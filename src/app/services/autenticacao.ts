import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';

import { environment } from '../../environments/environment';
import { ROTA_LOGIN_ADMIN } from '../configuracao';
import { EstadoPedidos } from './estado-pedidos';

const CHAVE_SESSAO = 'eb_admin_token';

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

@Service()
export class Autenticacao {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly pedidos = inject(EstadoPedidos);

  private readonly sinalSessao = signal<string | null>(lerSessao());

  get sessao(): string | null {
    return this.sinalSessao();
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
        tap((usuario) => this.guardarSessao(usuario.id)),
        map(() => void 0),
      );
  }

  sair(redirecionar = true): void {
    try {
      sessionStorage.removeItem(CHAVE_SESSAO);
    } catch {
      this.sinalSessao.set(null);
    }
    this.sinalSessao.set(null);
    this.pedidos.limpar();
    if (redirecionar) void this.router.navigateByUrl(ROTA_LOGIN_ADMIN);
  }

  private guardarSessao(id: string): void {
    try {
      sessionStorage.setItem(CHAVE_SESSAO, id);
    } catch {
      throw new Error('Não foi possível iniciar a sessão neste navegador.');
    }
    this.sinalSessao.set(id);
  }
}
