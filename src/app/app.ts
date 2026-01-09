import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthMonitorService } from './services/auth-monitor.service';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Teste veiculos';

  constructor(
    private authMonitor: AuthMonitorService,
    private router: Router
  ) {}

  ngOnInit() {
    // Inicia monitoramento se estiver em rota protegida
    this.checkAndStartMonitoring();

    // Monitora mudanças de rota
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkAndStartMonitoring();
    });
  }

  ngOnDestroy() {
    // Para o monitoramento ao destruir o componente
    this.authMonitor.stopMonitoring();
  }

  /**
   * Força logout e redireciona para login
   */
  private forceLogout(): void {
    console.error('[App] 🚪 Forçando logout - token inválido');

    // Para monitoramento
    this.authMonitor.stopMonitoring();

    // Limpa localStorage
    localStorage.removeItem('auth_token');
    localStorage.removeItem('nomeCompleto');

    // Redireciona para login
    this.router.navigate(['/login'], {
      queryParams: { sessionExpired: 'true' }
    });
  }

  private checkAndStartMonitoring(): void {
    const currentUrl = this.router.url;
    const token = localStorage.getItem('auth_token');

    // Inicia monitoramento se estiver logado e em rota protegida
    if (token && (currentUrl.includes('/admin') || currentUrl.includes('/dashboard'))) {
      this.authMonitor.startMonitoring();
    } else {
      this.authMonitor.stopMonitoring();
    }
  }

  /**
   * Valida o token imediatamente ao iniciar a aplicação
   */
  private validateTokenOnStartup(): void {
    const token = localStorage.getItem('auth_token');
    const currentUrl = this.router.url;

    // Se tem token e está em rota protegida, valida imediatamente
    if (token && (currentUrl.includes('/admin') || currentUrl.includes('/dashboard'))) {
      // Verifica se o token expirou localmente
      if (!this.isTokenValid(token)) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('nomeCompleto');
        this.router.navigate(['/login'], {
          queryParams: { sessionExpired: 'true' }
        });
      }
    }
  }

  /**
   * Verifica se o token é válido (não expirado)
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

