import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Autenticacao } from '../../../services/autenticacao';
import { ROTA_INICIO_ADMIN } from '../../../configuracao';

@Component({
  selector: 'eb-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly construtorFormulario = inject(NonNullableFormBuilder);
  private readonly autenticacao = inject(Autenticacao);
  private readonly roteador = inject(Router);
  private readonly rota = inject(ActivatedRoute);

  readonly formulario = this.construtorFormulario.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', Validators.required],
  });

  readonly mostrarSenha = signal(false);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  invalido(nome: 'email' | 'senha'): boolean {
    const control = this.formulario.controls[nome];
    return control.invalid && (control.touched || control.dirty);
  }

  entrar(): void {
    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      return;
    }

    this.erro.set(null);
    this.carregando.set(true);
    const { email, senha } = this.formulario.getRawValue();

    this.autenticacao
      .entrar(email.trim(), senha)
      .pipe(finalize(() => this.carregando.set(false)))
      .subscribe({
        next: () => void this.roteador.navigateByUrl(this.rotaRetorno()),
        error: (err: HttpErrorResponse) =>
          this.erro.set(
            err.status === 401 || err.status === 403
              ? 'E-mail ou senha incorretos. Confira os dados e tente de novo.'
              : 'Não foi possível entrar agora. Confira se a API está disponível e tente novamente.',
          ),
      });
  }

  private rotaRetorno(): string {
    const url = this.rota.snapshot.queryParamMap.get('urlRetorno');
    return url && url.startsWith('/admin') && !url.startsWith('//') ? url : ROTA_INICIO_ADMIN;
  }
}
