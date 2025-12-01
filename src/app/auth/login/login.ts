import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class Login implements OnInit {

  private http = inject(HttpClient);
  private router = inject(Router);

  // Objeto para armazenar as credenciais do formulário via [(ngModel)]
  credenciais = {
    email: '',
    senha: ''
  };

  // URL base do endpoint de login no seu Back-end Java
  // ATENÇÃO: Verifique a porta do seu Back-end (comumente 8080 ou 8085)
  private readonly LOGIN_API = 'http://localhost:8080/auth/login';



  ngOnInit(): void {
    // Se o usuário já tiver um token, redireciona diretamente para o admin
    if (localStorage.getItem('auth_token')) {
        this.router.navigate(['/admin/dashboard']);
    }
  }

  /**
   * Envia as credenciais para o Back-end Java e armazena o token JWT.
   */
  logar(): void {
    if (!this.credenciais.email || !this.credenciais.senha) {
        alert('Por favor, preencha o email e a senha.');
        return;
    }

    this.http.post<any>(this.LOGIN_API, this.credenciais).subscribe({
      next: (response) => {
        // Assume que o Back-end retorna um objeto com a propriedade 'token'
        const token = response.token;

        if (token) {
          // Armazena o token no armazenamento local (localStorage)
          localStorage.setItem('auth_token', token);
          alert('Login realizado com sucesso!');

          // Redireciona para o Painel Administrativo
          this.router.navigate(['/admin/dashboard']);
        } else {
          alert('Erro no login: Token não recebido.');
        }
      },
      error: (error) => {
        // Erro comum: 403 Forbidden ou 401 Unauthorized
        console.error('Erro de autenticação:', error);
        alert('Falha na autenticação. Verifique suas credenciais e se o Back-end Java está rodando.');
      }
    });
  }
}
