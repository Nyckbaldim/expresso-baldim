import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { Auth } from '../../../services/auth';
import { ADMIN_HOME } from '../../../constants';

@Component({
  selector: 'eb-login',
  imports: [ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  readonly showPassword = signal(false);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  invalid(name: 'username' | 'password'): boolean {
    const control = this.form.controls[name];
    return control.invalid && (control.touched || control.dirty);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.loading.set(true);
    const { username, password } = this.form.getRawValue();

    this.auth
      .login(username.trim(), password)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => void this.router.navigateByUrl(this.returnUrl()),
        error: (err: HttpErrorResponse) =>
          this.error.set(
            err.status === 401 || err.status === 403
              ? 'Usuário ou senha incorretos. Confira os dados e tente de novo.'
              : 'Não foi possível entrar agora. Tente novamente em instantes.',
          ),
      });
  }

  /** Volta para a página que a pessoa tentou abrir, aceitando só caminhos internos do /admin. */
  private returnUrl(): string {
    const url = this.route.snapshot.queryParamMap.get('returnUrl');
    return url && url.startsWith('/admin') && !url.startsWith('//') ? url : ADMIN_HOME;
  }
}
