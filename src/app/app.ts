// src/app/app.ts - CÓDIGO COMPLETO E CORRIGIDO
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router'; // Necessário para exibir o conteúdo da rota
import { Header } from './header/header'; // Assumindo que o arquivo TS é 'header.ts'
import { HttpClientModule } from '@angular/common/http'; // Para chamadas HTTP (POST, GET, etc.)

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, // Necessário para o roteamento funcionar
    Header, // Importação correta do HeaderComponent
    
    
  ],
  // CORREÇÃO: Removendo o .component do templateUrl
  templateUrl: './app.html', 
  styleUrls: ['./app.css']
})
export class AppComponent {
  title = 'Teste veiculos';
}