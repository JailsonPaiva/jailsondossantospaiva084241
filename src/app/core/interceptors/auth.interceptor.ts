import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError, switchMap } from 'rxjs';
import { AuthService } from '../auth/auth.service';
import { API_BASE_URL } from '../api/api.constants';

const REFRESH_PATH = '/autenticacao/refresh';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const isApiRequest = req.url.startsWith(API_BASE_URL);
  const isRefreshRequest = req.url.includes(REFRESH_PATH);

  const token = auth.getToken();
  let cloned = req;
  if (isApiRequest && !isRefreshRequest && token) {
    cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
  }

  return next(cloned).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401 && isApiRequest && !isRefreshRequest && auth.getStoredRefreshToken()) {
        return auth.refreshToken().pipe(
          switchMap((res) => {
            const newToken = res ? auth.getToken() : null;
            if (newToken) {
              const retryReq = req.clone({
                setHeaders: { Authorization: `Bearer ${newToken}` },
              });
              return next(retryReq);
            }
            auth.logout();
            return throwError(() => err);
          }),
          catchError(() => {
            auth.logout();
            return throwError(() => err);
          })
        );
      }
      if (err.status === 401 && isApiRequest) {
        auth.logout();
      }
      return throwError(() => err);
    })
  );
};
