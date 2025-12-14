import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Veiculo } from '../veiculo.service';

@Component({
  selector: 'app-header',
  standalone: false,
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})


export class Header implements OnInit {


  isLoggedIn: boolean = false;

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

  constructor(private router: Router) { }

 
  closeSidenav() {
    this.sidenavOpen = false;
  }

  ngOnInit(): void {
    this.checkLoginStatus();
    this.router.events.subscribe(() => {
        this.checkLoginStatus();
    });
  }

  checkLoginStatus(): void {
    this.isLoggedIn = !!localStorage.getItem('auth_token');
  }

  logout(): void {
    localStorage.removeItem('auth_token');
    this.isLoggedIn = false;
    this.router.navigate(['/']);
  }


navigateToEstoque() {
  // Navega para home e força recarregamento
  this.router.navigate(['/']).then(() => {
    // Recarrega a página para executar o carregarVeiculos()
    window.location.reload();
  });
}

/*estoque(id: number): void {
    console.log('🔍 Navegando para detalhes do veículo ID:', id);
    this.router.navigate(['/estoque', id]);
  }
   0 
*/





openWhatsApp() {
  // Substitua pelo número real com código do país (ex: 5511999999999 para Brasil)
  const phoneNumber = '61984321908';
  const message = 'Olá! Gostaria de mais informações';
  const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  window.open(url, '_blank');
}

}

