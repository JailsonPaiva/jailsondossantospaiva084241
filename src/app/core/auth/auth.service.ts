import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, shareReplay, finalize } from 'rxjs';
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
  /** Tempo de vida do access_token em segundos */
  expires_in?: number;
  /** Tempo de vida do refresh_token em segundos */
  refresh_expires_in?: number;
  data?: {
    token?: string;
    accessToken?: string;
    access_token?: string;
    refreshToken?: string;
    refresh_token?: string;
    expires_in?: number;
    refresh_expires_in?: number;
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

/** Extrai expires_in (segundos) da resposta de login/refresh */
function extractExpiresIn(res: LoginResponse | null): number | null {
  if (!res || typeof res !== 'object') return null;
  const raw =
    res.expires_in ??
    (res.data && typeof res.data === 'object' ? res.data.expires_in ?? null : null);
  return typeof raw === 'number' && raw > 0 ? raw : null;
}

const TOKEN_KEY = 'petrack_token';
const REFRESH_TOKEN_KEY = 'petrack_refresh_token';
const TOKEN_EXPIRES_AT_KEY = 'petrack_token_expires_at';
const USER_PHOTO_KEY = 'petrack_user_photo';

/** Renovar o token com esta antecedência (em segundos) antes de expirar */
const REFRESH_BUFFER_SECONDS = 60;
/** Se a API não retornar expires_in, usar este valor (segundos) para agendar o refresh */
const EXPIRES_IN_FALLBACK_SECONDS = 300;

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
  private refreshTimeoutId: ReturnType<typeof setTimeout> | null = null;
  /** Evita múltiplas chamadas de refresh simultâneas (ex.: vários 401 ao mesmo tempo) */
  private refreshInProgress$: Observable<LoginResponse | null> | null = null;

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router
  ) {
    if (this.getStoredToken() && this.getStoredRefreshToken()) {
      this.initTokenRefreshSchedule();
    }
  }

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
          const expiresIn = extractExpiresIn(res) ?? EXPIRES_IN_FALLBACK_SECONDS;
          this.setStoredTokenExpiresAt(Date.now() + expiresIn * 1000);
          this.scheduleTokenRefresh(expiresIn);
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
    this.clearRefreshSchedule();
    this.refreshInProgress$ = null;
    this.tokenSignal.set(null);
    this.userPhotoSignal.set(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(TOKEN_EXPIRES_AT_KEY);
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
   * Atualiza o access token usando o endpoint de refresh.
   * Uma única chamada é feita por vez; requisições simultâneas reutilizam o mesmo observable.
   */
  refreshToken(): Observable<LoginResponse | null> {
    const refreshTokenValue = this.getStoredRefreshToken();
    if (!refreshTokenValue?.trim()) {
      return of(null);
    }
    if (this.refreshInProgress$) {
      return this.refreshInProgress$;
    }
    const url = `${API_BASE_URL}${API_ENDPOINTS.refresh}`;
    const headers = { Authorization: `Bearer ${refreshTokenValue}` };
    this.refreshInProgress$ = this.http.put<LoginResponse>(url, {}, { headers }).pipe(
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
        const expiresIn = extractExpiresIn(res) ?? EXPIRES_IN_FALLBACK_SECONDS;
        this.setStoredTokenExpiresAt(Date.now() + expiresIn * 1000);
        this.scheduleTokenRefresh(expiresIn);
      }),
      catchError(() => of(null)),
      shareReplay(1),
      finalize(() => {
        this.refreshInProgress$ = null;
      })
    );
    return this.refreshInProgress$;
  }

  /**
   * Agenda a renovação do token para REFRESH_BUFFER_SECONDS antes do vencimento.
   */
  private scheduleTokenRefresh(expiresInSeconds: number): void {
    this.clearRefreshSchedule();
    const delayMs = Math.max(0, (expiresInSeconds - REFRESH_BUFFER_SECONDS) * 1000);
    this.refreshTimeoutId = setTimeout(() => {
      this.refreshTimeoutId = null;
      this.refreshToken().subscribe((res) => {
        if (res == null) {
          this.logout();
        }
      });
    }, delayMs);
  }

  private clearRefreshSchedule(): void {
    if (this.refreshTimeoutId != null) {
      clearTimeout(this.refreshTimeoutId);
      this.refreshTimeoutId = null;
    }
  }

  /**
   * Inicializa o agendamento de refresh ao carregar a aplicação (token já existente).
   */
  private initTokenRefreshSchedule(): void {
    const expiresAt = this.getStoredTokenExpiresAt();
    if (expiresAt == null) {
      // Sessão antiga ou API não retornou expires_in: renovar agora para obter novos tokens e expiry
      this.refreshToken().subscribe((res) => {
        if (res == null) this.logout();
      });
      return;
    }
    const remainingMs = expiresAt - Date.now();
    const remainingSeconds = Math.floor(remainingMs / 1000);
    if (remainingSeconds <= 0) {
      this.refreshToken().subscribe((res) => {
        if (res == null) this.logout();
      });
      return;
    }
    this.scheduleTokenRefresh(remainingSeconds);
  }

  private getStoredToken(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  private setStoredToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  }

  private getStoredTokenExpiresAt(): number | null {
    if (typeof localStorage === 'undefined') return null;
    const raw = localStorage.getItem(TOKEN_EXPIRES_AT_KEY);
    if (raw == null) return null;
    const value = Number(raw);
    return Number.isFinite(value) ? value : null;
  }

  private setStoredTokenExpiresAt(timestamp: number): void {
    localStorage.setItem(TOKEN_EXPIRES_AT_KEY, String(timestamp));
  }

  private getStoredUserPhoto(): string | null {
    if (typeof localStorage === 'undefined') return null;
    return localStorage.getItem(USER_PHOTO_KEY);
  }
}
