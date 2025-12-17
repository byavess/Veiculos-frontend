import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private readonly LOGIN_API = 'http://localhost:8080/api/auth/login';

  // Observables para status de login e admin
  private loggedInSubject = new BehaviorSubject<boolean>(this.hasToken());
  loggedIn$ = this.loggedInSubject.asObservable();
  private isAdminSubject = new BehaviorSubject<boolean>(this.checkAdmin());
  isAdmin$ = this.isAdminSubject.asObservable();

  constructor(private http: HttpClient, private router: Router) {}

  /**
   * Realiza o login no backend Java.
   * @param username Nome de usuário
   * @param password Senha
   * @returns Observable da resposta do backend
   */
  login(username: string, password: string): Observable<any> {
    return this.http.post<any>(this.LOGIN_API, { username, password });
  }

  /**
   * Lida com o sucesso do login: armazena token, alerta e redireciona.
   */
  handleLoginSuccess(response: any, router: Router): void {
    const token = response.token;
    if (token) {
      localStorage.setItem('auth_token', token);
      // Salva nomeCompleto se vier no response
      if (response.nomeCompleto) {
        localStorage.setItem('nomeCompleto', response.nomeCompleto);
      } else {
        localStorage.removeItem('nomeCompleto');
      }
      this.loggedInSubject.next(true);
      this.isAdminSubject.next(this.checkAdmin());
      router.navigate(['/admin/home']);
    } else {
      alert('Erro no login: Token não recebido.');
    }
  }

  /**
   * Lida com erro de login: exibe mensagem detalhada.
   */
  handleLoginError(error: any): void {
    console.error('Erro de autenticação:', error);
    let msg = 'Falha na autenticação. Verifique suas credenciais e se o Back-end Java está rodando.';
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
   * Remove o token do localStorage e redireciona para a tela de login.
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    this.loggedInSubject.next(false);
    this.isAdminSubject.next(false);
    this.router.navigate(['/login']);
  }

  /**
   * Força a atualização dos status de login e admin (útil para header em reload/navegação).
   */
  forceStatusUpdate(): void {
    this.loggedInSubject.next(this.hasToken());
    this.isAdminSubject.next(this.checkAdmin());
  }

  private hasToken(): boolean {
    return !!localStorage.getItem('auth_token');
  }

  private checkAdmin(): boolean {
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        // Aceita ADMIN, ROLE_ADMIN, roles: ['ADMIN'], roles: ['ROLE_ADMIN']
        return (
          payload && (
            payload.role === 'ADMIN' ||
            payload.role === 'ROLE_ADMIN' ||
            (Array.isArray(payload.roles) && (payload.roles.includes('ADMIN') || payload.roles.includes('ROLE_ADMIN')))
          )
        );
      } catch {
        return false;
      }
    }
    return false;
  }
}
