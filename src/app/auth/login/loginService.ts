import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthMonitorService } from '../../services/auth-monitor.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly apiUrl = `${environment.apiBaseUrl}/auth/login`;

  // Observables para status de login e admin
  private loggedInSubject = new BehaviorSubject<boolean>(this.isAuthenticated());
  loggedIn$ = this.loggedInSubject.asObservable();
  private isAdminSubject = new BehaviorSubject<boolean>(this.checkAdmin());
  isAdmin$ = this.isAdminSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router,
    private authMonitor: AuthMonitorService
  ) {}

  /**
   * Decodifica um token JWT de forma segura (compatível com base64url)
   */
  private decodeToken(token: string): any {
    try {
      // Base64Url decode (substitui - por + e _ por /)
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

      // Decodifica
      const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      }).join(''));

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('[LoginService] Erro ao decodificar token:', error);
      console.error('[LoginService] Token:', token.substring(0, 50) + '...');
      return null;
    }
  }

  /**
   * Verifica se o token é válido (não expirado)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return false;

      // Verifica expiração (exp está em segundos)
      const agora = Math.floor(Date.now() / 1000);
      const expirado = payload.exp < agora;


      return !expirado;
    } catch {
      return false;
    }
  }

  /**
   * Verifica se está autenticado
   */
  private isAuthenticated(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    const isValid = this.isTokenValid(token);
    if (!isValid) {
      // Limpa token expirado
      localStorage.removeItem('auth_token');
      localStorage.removeItem('nomeCompleto');
    }

    return isValid;
  }

  /**
   * Verifica se é admin
   */
  private checkAdmin(): boolean {
    const token = localStorage.getItem('auth_token');
    if (!token) return false;

    try {
      const payload = this.decodeToken(token);
      if (!payload) return false;

      // Verifica diferentes formatos de role
      const roles = payload.roles || payload.authorities || payload.role;
      // Verifica se é admin
      const isAdmin = (
        (Array.isArray(roles) && (
          roles.includes('ROLE_ADMIN') ||
          roles.includes('ADMIN') ||
          roles.some((r: any) => r.authority === 'ROLE_ADMIN')
        )) ||
        roles === 'ROLE_ADMIN' ||
        roles === 'ADMIN' ||
        payload.role === 'ROLE_ADMIN' ||
        payload.role === 'ADMIN'
      );

      return isAdmin;

    } catch (error) {
      console.error('[LoginService] Erro ao verificar admin:', error);
      return false;
    }
  }

  /**
   * Realiza o login no backend Java.
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.apiUrl, { username, password });
  }

  /**t
   *
   * Lida com o sucesso do login
   */
  handleLoginSuccess(response: any, router: Router): void {
    const token = response.token;
    if (token) {

      // Salva o token
      localStorage.setItem('auth_token', token);

      // Decodifica para debugging
      const payload = this.decodeToken(token);

      // Salva nomeCompleto se vier no response
      if (response.nomeCompleto) {
        localStorage.setItem('nomeCompleto', response.nomeCompleto);
      } else {
        localStorage.removeItem('nomeCompleto');
      }

      // Atualiza os subjects
      this.loggedInSubject.next(true);
      this.isAdminSubject.next(this.checkAdmin());

      // Inicia monitoramento de autenticação
      this.authMonitor.startMonitoring();

      router.navigate(['/admin/home']);
    } else {
      alert('Erro no login: Token não recebido.');
    }
  }

  /**
   * Lida com erro de login
   */
  handleLoginError(error: any): void {
    console.error('[LoginService] Erro de autenticação:', error);
    let msg = 'Falha na autenticação. Verifique suas credenciais.';

    if (error.status === 403 || error.status === 401) {
      if (error.error && error.error.message) {
        msg += '\nMotivo: ' + error.error.message;
      } else if (error.error) {
        msg += '\nDetalhe: ' + JSON.stringify(error.error);
      }
    }

    alert(msg);
  }

  /**
   * Logout
   */
  logout(): void {
    // Para o monitoramento
    this.authMonitor.stopMonitoring();

    localStorage.removeItem('auth_token');
    localStorage.removeItem('nomeCompleto');
    this.loggedInSubject.next(false);
    this.isAdminSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Força a atualização dos status
   */
  forceStatusUpdate(): void {
    const isAuth = this.isAuthenticated();
    const isAdmin = this.checkAdmin();


    this.loggedInSubject.next(isAuth);
    this.isAdminSubject.next(isAdmin);
  }

  /**
   * Método público para verificar autenticação
   */
  isUserAuthenticated(): boolean {
    return this.isAuthenticated();
  }

  /**
   * Método público para verificar admin
   */
  isUserAdmin(): boolean {
    return this.checkAdmin();
  }
}
