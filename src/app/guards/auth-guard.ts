import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean | UrlTree> {
    const token = localStorage.getItem('auth_token');
    console.log('[AuthGuard] Token encontrado:', token);
    if (!token) {
      console.warn('[AuthGuard] Nenhum token encontrado. Redirecionando para login.');
      return of(this.router.createUrlTree(['/login']));
    }
    const headers = { Authorization: `Bearer ${token}` };
    console.log('[AuthGuard] Validando token no backend...');
    return this.http.get(`${environment.apiBaseUrl}/auth/validate`, { headers }).pipe(
      map(() => {
        console.log('[AuthGuard] Token válido. Acesso permitido.');
        return true;
      }),
      catchError((err) => {
        console.error('[AuthGuard] Token inválido ou erro na validação:', err);
        localStorage.removeItem('auth_token');
        return of(this.router.createUrlTree(['/login']));
      })
    );
  }
}
