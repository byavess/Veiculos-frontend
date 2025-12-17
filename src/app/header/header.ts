import {Component, OnDestroy, OnInit, ChangeDetectorRef} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {LoginService} from '../auth/login/loginService';
import {filter, Subscription} from 'rxjs';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class Header implements OnInit, OnDestroy {
  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  private subscriptions: Subscription = new Subscription();

  constructor(
    private router: Router,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(this.loginService.loggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      this.cdr.detectChanges();
      this.logStatus();
    }));
    this.subscriptions.add(this.loginService.isAdmin$.subscribe(status => {
      this.isAdmin = status;
      this.cdr.detectChanges();
      this.logStatus();
    }));
    // Força atualização dos status em cada navegação
    this.subscriptions.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        this.loginService.forceStatusUpdate();
      })
    );
  }

  logStatus(): void {
    const token = localStorage.getItem('auth_token');
    let payload = null;
    if (token) {
      try {
        payload = JSON.parse(atob(token.split('.')[1]));
      } catch {}
    }
    console.log('[HEADER] isLoggedIn:', this.isLoggedIn, '| isAdmin:', this.isAdmin, '| token payload:', payload);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  logout(): void {
    this.loginService.logout();
  }

  getUserName(): string {
    const nomeCompleto = localStorage.getItem('nomeCompleto');
    if (nomeCompleto) return nomeCompleto;
    const token = localStorage.getItem('auth_token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.name || payload.sub || 'Usuário';
      } catch {}
    }
    return '';
  }
}
