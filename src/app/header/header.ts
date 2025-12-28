import {Component, OnDestroy, OnInit, ChangeDetectorRef} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {LoginService} from '../auth/login/loginService';
import {filter, Subscription} from 'rxjs';
import { Platform } from '@angular/cdk/platform';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})


export class Header implements OnInit, OnDestroy {


isPublicPage: boolean = true;


  isLoggedIn: boolean = false;
  isAdmin: boolean = false;
  private subscriptions: Subscription = new Subscription();


  /*veiculos!: Observable<Veiculo[]>;
    loading: boolean = false;
    erroCarregamento: boolean = false;*/
    public sidenavOpen: boolean = false;

    private phoneNumber: string = '5561984321908';

    private address: string = 'INDICAR VEICULOS DF, SCIA QUADRA 15, CONJUNTO 7 LOTE 12 - ZONA INDUSTRIAL, Brasília - DF, 71250-035';

    public callContact(): void {
    // Usa window.location.href para direcionar o navegador para o protocolo tel:
    window.location.href = `tel:+${this.phoneNumber}`;
  }
  public openLocation(): void {
    // Codifica a URL e abre em uma nova aba
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.address)}`;
    window.open(mapsUrl, '_blank');
  }

  constructor(
    private router: Router,
    private loginService: LoginService,
    private cdr: ChangeDetectorRef,
    private platform: Platform
  ) {}


  ngOnInit(): void {
    this.subscriptions.add(this.loginService.loggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      this.cdr.detectChanges();
    }));
    this.subscriptions.add(this.loginService.isAdmin$.subscribe(status => {
      this.isAdmin = status;
      this.cdr.detectChanges();
    }));
    // Força atualização dos status em cada navegação
    this.subscriptions.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        this.loginService.forceStatusUpdate();
      })
    );
    this.subscriptions.add(
      this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe((event: any) => {
        const url = event.urlAfterRedirects || event.url;

        // Define como FALSO se estiver no login ou na home do admin
        this.isPublicPage = !(url.includes('/login') || url.startsWith('/admin/'));

        this.loginService.forceStatusUpdate();
        this.cdr.detectChanges();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  logout(): void {
    this.loginService.logout();
  }


navigateToEstoque() {
  // Navega para home e força recarregamento
  this.router.navigate(['/']).then(() => {
    // Recarrega a página para executar o carregarVeiculos()
    window.location.reload();
  });
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

openContact(): void {
    const phoneNumber = '+5561984321908';
    const whatsappUrl = `https://wa.me/5561984321908`;
    const telUrl = `tel:${phoneNumber}`;

    // Verifica se é dispositivo móvel
    if (this.platform.ANDROID || this.platform.IOS) {
      // Dispositivo móvel: abre app de telefone
      window.location.href = telUrl;
    } else {
      // Desktop: abre WhatsApp Web
      window.open(whatsappUrl, '_blank');
    }
  }


}
