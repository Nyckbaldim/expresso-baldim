import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Service, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, map, of, switchMap, tap, throwError, timer } from 'rxjs';

import { environment } from '../../environments/environment';
import { ADMIN_LOGIN } from '../constants';
import { OrdersStore } from './orders-store';

const TOKEN_KEY = 'eb_admin_token';

interface LoginResponse {
  token: string;
}

function readToken(): string | null {
  try {
    return sessionStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

/** Se o token for um JWT com "exp", confere se já venceu. Tokens sem esse formato são considerados válidos. */
function isExpired(token: string): boolean {
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  try {
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.exp === 'number' && payload.exp * 1000 <= Date.now();
  } catch {
    return false;
  }
}

@Service()
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly orders = inject(OrdersStore);

  private readonly tokenSignal = signal<string | null>(readToken());

  get token(): string | null {
    return this.tokenSignal();
  }

  isLoggedIn(): boolean {
    const token = this.tokenSignal();
    return !!token && !isExpired(token);
  }

  login(username: string, password: string): Observable<void> {
    const request$: Observable<LoginResponse> = environment.useMock
      ? this.mockLogin(username, password)
      : this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, { username, password });

    return request$.pipe(
      tap((res) => this.saveToken(res.token)),
      map(() => void 0),
    );
  }

  logout(redirect = true): void {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {
      /* armazenamento indisponível: nada a limpar */
    }
    this.tokenSignal.set(null);
    this.orders.reset();
    if (redirect) void this.router.navigateByUrl(ADMIN_LOGIN);
  }

  private saveToken(token: string): void {
    try {
      sessionStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* sem armazenamento: o login vale só até recarregar a página */
    }
    this.tokenSignal.set(token);
  }

  /** REMOVER quando a API de autenticação existir (environment.useMock = false). */
  private mockLogin(username: string, password: string): Observable<LoginResponse> {
    return timer(450).pipe(
      switchMap(() =>
        username === 'admin' && password === 'admin123'
          ? of({ token: 'mock-token' })
          : throwError(() => new HttpErrorResponse({ status: 401 })),
      ),
    );
  }
}
