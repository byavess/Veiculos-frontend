import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { LoginService } from './loginService';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  constructor(
    private router: Router,
    private loginService: LoginService
  ) {}

  // Objeto para armazenar as credenciais do formulário via [(ngModel)]
  credenciais = {
    username: '',
    password: ''
  };

  ngOnInit(): void {
    // Removido o redirecionamento automático para o dashboard
  }

  /**
   * Envia as credenciais para o Back-end Java e armazena o token JWT.
   */
  logar(): void {
    if (!this.credenciais.username || !this.credenciais.password) {
      alert('Por favor, preencha o usuário e a senha.');
      return;
    }

    this.loginService.login(this.credenciais.username, this.credenciais.password).subscribe({
      next: (response) => {
        this.loginService.handleLoginSuccess(response, this.router);
      },
      error: (error) => {
        this.loginService.handleLoginError(error);
      }
    });
  }
}
