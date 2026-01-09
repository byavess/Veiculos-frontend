import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable()
export class AuthErrorInterceptor implements HttpInterceptor {
  constructor(private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        // Se receber 401 (Unauthorized) ou 403 (Forbidden)
        if (error.status === 401 || error.status === 403) {
          // Limpa dados do localStorage
          localStorage.removeItem('auth_token');
          localStorage.removeItem('nomeCompleto');

          // Redireciona IMEDIATAMENTE para login
          const currentUrl = this.router.url;
          if (!currentUrl.includes('/login')) {
            this.router.navigate(['/login'], {
              queryParams: { sessionExpired: 'true' }
            });
          }
        }

        return throwError(() => error);
      })
    );
  }
}

