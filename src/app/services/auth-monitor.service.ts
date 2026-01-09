import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthMonitorService {
  private monitorSubscription?: Subscription;
  private readonly CHECK_INTERVAL = 30000; // Verifica a cada 30 segundos

  constructor(
    private router: Router,
    private http: HttpClient
  ) {}

  /**
   * Inicia o monitoramento de autenticação
   */
  startMonitoring(): void {
    // Para monitoramento anterior se existir
    this.stopMonitoring();

    // Verifica imediatamente
    this.checkAuth();

    // Verifica periodicamente
    this.monitorSubscription = interval(this.CHECK_INTERVAL).subscribe(() => {
      this.checkAuth();
    });
  }

  /**
   * Para o monitoramento
   */
  stopMonitoring(): void {
    if (this.monitorSubscription) {
      this.monitorSubscription.unsubscribe();

    }
  }

  /**
   * Verifica se o token ainda é válido
   */
  private checkAuth(): void {
    const token = localStorage.getItem('auth_token');

    if (!token) {
      console.warn('[AuthMonitor] ❌ Token não encontrado');
      this.handleInvalidAuth();
      return;
    }

    // Verifica se o token expirou localmente primeiro
    if (!this.isTokenValid(token)) {
      console.warn('[AuthMonitor] ⏰ Token expirado localmente');
      this.handleInvalidAuth();
      return;
    }

    // Verifica com o backend
    const headers = { Authorization: `Bearer ${token}` };
    this.http.get(`${environment.apiBaseUrl}/auth/validate`, { headers }).subscribe({
      next: () => {
      },
      error: (err) => {
        this.handleInvalidAuth();
      }
    });
  }

  /**
   * Verifica se o token é válido (não expirado)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = this.decodeToken(token);
      if (!payload || !payload.exp) return false;

      const agora = Math.floor(Date.now() / 1000);
      const expirado = payload.exp < agora;

      return !expirado;
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

  /**
   * Trata autenticação inválida
   */
  private handleInvalidAuth(): void {

    // Limpa dados do localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nomeCompleto');

    // Para o monitoramento
    this.stopMonitoring();

    // Redireciona para login se não estiver já lá
    const currentUrl = this.router.url;
    if (!currentUrl.includes('/login')) {
      this.router.navigate(['/login'], {
        queryParams: { sessionExpired: 'true' }
      });
    }
  }
}

