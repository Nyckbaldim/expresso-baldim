import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { ROTA_LOGIN_ADMIN } from '../configuracao';
import { EstadoPedidos } from './estado-pedidos';

const CHAVE_SESSAO = 'eb_admin_token';
const CHAVE_ADMIN_EMAIL = 'eb_admin_email';

interface Usuario {
  id: string;
  email: string;
  senha: string;
  perfil: string;
}

function lerSessao(): string | null {
  try {
    return sessionStorage.getItem(CHAVE_SESSAO);
  } catch {
    return null;
  }
}

function lerEmailAdmin(): string | null {
  try {
    return sessionStorage.getItem(CHAVE_ADMIN_EMAIL)?.trim() || null;
  } catch {
    return null;
  }
}

@Service()
export class Autenticacao {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly pedidos = inject(EstadoPedidos);

  private readonly sinalSessao = signal<string | null>(lerSessao());
  private readonly sinalEmail = signal<string | null>(lerEmailAdmin());

  get sessao(): string | null {
    return this.sinalSessao();
  }

  get email(): string | null {
    return this.sinalEmail();
  }

  autenticado(): boolean {
    return !!this.sinalSessao();
  }

  entrar(email: string, senha: string): Observable<void> {
    const parametros = new HttpParams().set('email', email);
    return this.http
      .get<Usuario[]>(`${environment.apiUrl}/usuarios`, { params: parametros })
      .pipe(
        map((usuarios) => {
          const usuario = usuarios.find(
            (candidato) => candidato.senha === senha && candidato.perfil === 'gestor',
          );
          if (!usuario) throw new HttpErrorResponse({ status: 401 });
          return usuario;
        }),
        tap((usuario) => this.guardarSessao(usuario.id, usuario.email?.trim() || email.trim())),
        map(() => void 0),
      );
  }

  sair(redirecionar = true): void {
    try {
      sessionStorage.removeItem(CHAVE_SESSAO);
      sessionStorage.removeItem(CHAVE_ADMIN_EMAIL);
    } catch {
      this.sinalSessao.set(null);
      this.sinalEmail.set(null);
    }
    this.sinalSessao.set(null);
    this.sinalEmail.set(null);
    this.pedidos.limpar();
    if (redirecionar) void this.router.navigateByUrl(ROTA_LOGIN_ADMIN);
  }

  private guardarSessao(id: string, email: string): void {
    try {
      sessionStorage.setItem(CHAVE_SESSAO, id);
      sessionStorage.setItem(CHAVE_ADMIN_EMAIL, email);
    } catch {
      throw new Error('Não foi possível iniciar a sessão neste navegador.');
    }
    this.sinalSessao.set(id);
    this.sinalEmail.set(email.trim() || null);
  }
}
