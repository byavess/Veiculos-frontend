import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private lastValidation: number = 0;
  private readonly VALIDATION_CACHE_TIME = 5000; // 5 segundos de cache

  constructor(
    private router: Router,
    private http: HttpClient
  ) {
    // Limpa cache ao iniciar
    this.clearValidationCache();
  }

  /**
   * Limpa o cache de validação
   */
  private clearValidationCache(): void {
    this.lastValidation = 0;
  }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const token = localStorage.getItem('auth_token');
    const agora = Date.now();

    // 1. Verifica se tem token
    if (!token) {
      return of(this.redirectToLogin());
    }

    // 2. Valida expiração localmente PRIMEIRO (instantâneo)
    if (!this.isTokenValid(token)) {
      this.clearAuth();
      return of(this.redirectToLogin());
    }

    // 3. Valida com backend (com cache para evitar sobrecarga)
    const tempoDesdeUltimaValidacao = agora - this.lastValidation;

    // Se validou recentemente (menos de 5s), permite sem re-validar
    if (tempoDesdeUltimaValidacao < this.VALIDATION_CACHE_TIME) {
      return of(true);
    }

    // Valida com backend
    const headers = { Authorization: `Bearer ${token}` };

    return this.http.get(`${environment.apiBaseUrl}/auth/validate`, { headers }).pipe(
      tap(() => {
        // Atualiza timestamp da última validação
        this.lastValidation = Date.now();
      }),
      map(() => {
        return true;
      }),
      catchError((err) => {
        this.clearAuth();
        this.clearValidationCache();
        return of(this.redirectToLogin());
      })
    );
  }

  /**
   * Limpa autenticação do localStorage
   */
  private clearAuth(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nomeCompleto');
  }

  /**
   * Redireciona para login com mensagem de sessão expirada
   */
  private redirectToLogin(): UrlTree {
    return this.router.createUrlTree(['/login'], {
      queryParams: { sessionExpired: 'true' }
    });
  }

  /**
   * Verifica se o token é válido localmente (não expirado)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return false;

      const agora = Math.floor(Date.now() / 1000);
      return payload.exp > agora;
    } catch {
      return false;
    }
  }

  /**
   * Decodifica um token JWT
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));
      return JSON.parse(jsonPayload);
    } catch {
      return null;
    }
  }
}
