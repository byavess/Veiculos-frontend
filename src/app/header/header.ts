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
  

  constructor(private router: Router) { }

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
verEstoque(): void {
  this.router.navigate(['/estoque']);
}

}
