import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // RouterLink para usar routerLink no HTML

// Imports do Angular Material para a Barra de Navegação
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { CommonModule } from '@angular/common'; // Necessário para *ngIf e *ngFor
@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true,
    imports: [
      CommonModule,
      RouterLink,

      // Módulos do Material
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    ],
})
export class Header implements OnInit {

  // ... (O restante da lógica de isLoggedIn, checkLoginStatus() e logout() permanece o mesmo)
  isLoggedIn: boolean = false; 

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
    this.router.navigate(['/public/home']);
  }
}