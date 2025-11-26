import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // Para navegação e links
import { HttpClient } from '@angular/common/http'; // Para chamadas HTTP (POST)
import { FormsModule } from '@angular/forms'; // Para [(ngModel)]

// Imports do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-login',
  // MARCAÇÃO STANDALONE: ESSENCIAL
  standalone: true, 
  imports: [
    CommonModule,
    FormsModule, // Para usar [(ngModel)]
    RouterLink,  // Para usar routerLink
    
    // Módulos do Material
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './login.html', // Usaremos o arquivo HTML, não o inline
  styleUrls: ['./login.css']
})
export class Login implements OnInit {

  // Objeto para armazenar as credenciais do formulário via [(ngModel)]
  credenciais = {
    email: '',
    senha: ''
  };
  
  // URL base do endpoint de login no seu Back-end Java
  // ATENÇÃO: Verifique a porta do seu Back-end (comumente 8080 ou 8085)
  private readonly LOGIN_API = 'http://localhost:8080/auth/login'; 

  constructor(
    private http: HttpClient, // Injeção do HttpClient
    private router: Router    // Injeção do Router para navegação
  ) { }

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