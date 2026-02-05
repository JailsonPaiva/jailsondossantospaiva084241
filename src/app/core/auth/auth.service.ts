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

export interface RegisterRequest {
  nome: string;
  email: string;
  senha: string;
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
const USER_PHOTO_KEY = 'petrack_user_photo';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly tokenSignal = signal<string | null>(this.getStoredToken());
  private readonly userPhotoSignal = signal<string | null>(this.getStoredUserPhoto());
  private readonly loadingSignal = signal(false);
  private readonly errorSignal = signal<string | null>(null);

  readonly token = this.tokenSignal.asReadonly();
  readonly userPhoto = this.userPhotoSignal.asReadonly();
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
          const photo = (res as LoginResponse & { user?: { photo?: string; avatar?: string; foto?: string } })?.user?.photo
            ?? (res as LoginResponse & { user?: { photo?: string; avatar?: string; foto?: string } })?.user?.avatar
            ?? (res as LoginResponse & { user?: { photo?: string; avatar?: string; foto?: string } })?.user?.foto;
          if (typeof photo === 'string') {
            this.userPhotoSignal.set(photo);
            localStorage.setItem(USER_PHOTO_KEY, photo);
          }
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

  register(nome: string, email: string, senha: string): Observable<unknown> {
    this.errorSignal.set(null);
    this.loadingSignal.set(true);

    const body: RegisterRequest = { nome, email, senha };
    const url = `${API_BASE_URL}${API_ENDPOINTS.register}`;

    return this.http.post<unknown>(url, body).pipe(
      tap(() => {
        this.loadingSignal.set(false);
        this.toast.showSuccess('Conta criada com sucesso! Faça login para continuar.');
        this.router.navigate(['/login']);
      }),
      catchError((err) => {
        this.loadingSignal.set(false);
        const message =
          err?.error?.message ??
          err?.error?.error ??
          err?.message ??
          'Falha ao cadastrar. Tente novamente.';
        const text = typeof message === 'string' ? message : 'Ocorreu um erro ao criar a conta.';
        this.errorSignal.set(text);
        this.toast.showError(text);
        return of(err);
      })
    );
  }

  logout(): void {
    this.tokenSignal.set(null);
    this.userPhotoSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_PHOTO_KEY);
    this.router.navigate(['/login']);
  }

  /** Define a foto do usuário (ex.: após carregar perfil). */
  setUserPhoto(url: string | null): void {
    this.userPhotoSignal.set(url);
    if (url) localStorage.setItem(USER_PHOTO_KEY, url);
    else localStorage.removeItem(USER_PHOTO_KEY);
  }

  getToken(): string | null {
    return this.tokenSignal();
  }

  /** Refresh token armazenado (localStorage). Usado pelo interceptor em 401. */
  getStoredRefreshToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(REFRESH_TOKEN_KEY);
  }

  /**
   * Atualiza o access token usando PUT /autenticacao/refresh.
   * Retorna a resposta em caso de sucesso; em falha retorna null (ou o observable completa em erro).
   */
  refreshToken(): Observable<LoginResponse | null> {
    const refreshToken = this.getStoredRefreshToken();
    if (!refreshToken?.trim()) {
      return of(null);
    }
    const url = `${API_BASE_URL}${API_ENDPOINTS.refresh}`;
    return this.http.put<LoginResponse>(url, { refreshToken }).pipe(
      tap((res) => {
        const accessToken = extractAccessToken(res);
        if (accessToken) {
          this.tokenSignal.set(accessToken);
          this.setStoredToken(accessToken);
        }
        const newRefresh =
          res.refreshToken ??
          res.refresh_token ??
          (res.data && typeof res.data === 'object'
            ? (res.data.refreshToken ?? res.data.refresh_token ?? null)
            : null);
        if (typeof newRefresh === 'string') {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefresh);
        }
      }),
      catchError(() => of(null))
    );
  }

  private getStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setStoredToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private getStoredUserPhoto(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(USER_PHOTO_KEY);
  }
}
