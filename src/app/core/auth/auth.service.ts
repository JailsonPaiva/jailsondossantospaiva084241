import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { API_BASE_URL, API_ENDPOINTS } from '../api/api.constants';
import { ToastService } from '../services/toast.service';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  refreshToken?: string;
  refresh_token?: string;
  data?: {
    token?: string;
    accessToken?: string;
    access_token?: string;
    refreshToken?: string;
    refresh_token?: string;
  };
  [key: string]: unknown;
}

const LOGIN_REDIRECT_URL = '/pets';

/** Extrai o token de várias formas comuns de resposta da API */
function extractAccessToken(res: LoginResponse | null): string | null {
  if (!res || typeof res !== 'object') return null;
  const raw =
    res.token ??
    res.accessToken ??
    res.access_token ??
    (res.data && typeof res.data === 'object'
      ? (res.data.token ?? res.data.accessToken ?? res.data.access_token ?? null)
      : null);
  return typeof raw === 'string' && raw.length > 0 ? raw : null;
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

  private readonly toast = inject(ToastService);

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
        const accessToken = extractAccessToken(res);
        if (accessToken) {
          this.tokenSignal.set(accessToken);
          this.setStoredToken(accessToken);
          const refresh =
            res.refreshToken ??
            res.refresh_token ??
            res.data?.refreshToken ??
            res.data?.refresh_token;
          if (typeof refresh === 'string') {
            localStorage.setItem(REFRESH_TOKEN_KEY, refresh);
          }
          this.router.navigate([LOGIN_REDIRECT_URL]);
        }
        this.loadingSignal.set(false);
      }),
      catchError((err) => {
        this.loadingSignal.set(false);
        const message =
          err?.error?.message ??
          err?.error?.error ??
          err?.message ??
          'Falha ao entrar. Verifique usuário e senha.';
        const text = typeof message === 'string' ? message : 'Ocorreu um erro ao fazer login.';
        this.errorSignal.set(text);
        this.toast.showError(text);
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
