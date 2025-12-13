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



  // ... (O restante da lógica de isLoggedIn, checkLoginStatus() e logout() permanece o mesmo)
  isLoggedIn: boolean = false;

  /*veiculos!: Observable<Veiculo[]>;
    loading: boolean = false;
    erroCarregamento: boolean = false;*/


  public sidenavOpen: boolean = false;


  constructor(private router: Router) { }

  // Se precisar de lógica para fechar o menu
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

