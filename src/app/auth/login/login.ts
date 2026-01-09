import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { LoginService } from './loginService';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {
  sessionExpired = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private loginService: LoginService
  ) {}

  // Objeto para armazenar as credenciais do formulário via [(ngModel)]
  credenciais = {
    username: '',
    password: ''
  };

  ngOnInit(): void {
    // Verifica se a sessão expirou
    this.route.queryParams.subscribe(params => {
      if (params['sessionExpired'] === 'true') {
        this.sessionExpired = true;
      }
    });
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
