import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { API_BASE_URL, API_ENDPOINTS } from '../api/api.constants';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  refreshToken?: string;
  [key: string]: unknown;
}

const TOKEN_KEY = 'petrack_token';
const REFRESH_TOKEN_KEY = 'petrack_refresh_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(this.getStoredToken());
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly token = this.tokenSignal.asReadonly();
  readonly isLoading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isAuthenticated = computed(() => !!this.tokenSignal());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {}

  login(username: string, password: string): Observable<LoginResponse> {
    this.errorSignal.set(null);
    this.loadingSignal.set(true);

    const body: LoginRequest = { username, password };
    const url = `${API_BASE_URL}${API_ENDPOINTS.login}`;

    return this.http.post<LoginResponse>(url, body).pipe(
      tap((res) => {
        const accessToken = res.token ?? res.accessToken ?? null;
        if (accessToken) {
          this.tokenSignal.set(accessToken);
          this.setStoredToken(accessToken);
          if (res.refreshToken) {
            localStorage.setItem(REFRESH_TOKEN_KEY, res.refreshToken);
          }
        }
        this.loadingSignal.set(false);
      }),
      catchError((err) => {
        this.loadingSignal.set(false);
        const message =
          err?.error?.message ??
          err?.error?.error ??
          err?.message ??
          'Falha ao entrar. Verifique usuário e password.';
        this.errorSignal.set(typeof message === 'string' ? message : 'Erro ao fazer login.');
        return of(err);
      })
    );
  }

  logout(): void {
    this.tokenSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  private getStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setStoredToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }
}
