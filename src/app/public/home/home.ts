import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router'; 

// Imports de Lógica e Pipes
import { CommonModule, DecimalPipe } from '@angular/common'; // Para *ngFor, Pipes (number, currency)
import { FormsModule } from '@angular/forms'; // Para two-way binding se tiver campos de filtro

// Imports do Material (Corrigindo os erros NG8001)
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { VeiculoService, Veiculo } from '../../veiculo.service';

// Importa o Serviço de Comunicação e a Interface

// ATENÇÃO: Verifique o caminho se o seu VeiculoService não estiver na raiz de 'app'

@Component({
  selector: 'app-Home',
  standalone: true,
  // Lista de imports para resolver *ngFor, [routerLink] e elementos do Material
  imports: [
    CommonModule, // ESSENCIAL para *ngFor, DecimalPipe e outros
    RouterLink,   // Para usar [routerLink] no HTML
    FormsModule,  // Para two-way binding (filtros)
    
    // Módulos do Material (NG8001 resolvido)
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
  ],
  templateUrl: './home.html', 
  styleUrls: ['./home.css']
})
export class Home implements OnInit {

  // Lista para armazenar os veículos vindos do Back-end Java
  public veiculos: Veiculo[] = []; 
  // O *ngFor no HTML usa este array: *ngFor="let veiculo of veiculos"

  // Objeto para armazenar o estado dos filtros (se houver)
  public filtros = {
    marca: '',
    modelo: '',
    // ... outros filtros
  };

  // 1. INJEÇÃO DE DEPENDÊNCIAS
  constructor(
    private veiculoService: VeiculoService // Injeção do serviço de comunicação
  ) { }

  // 2. LÓGICA DE INICIALIZAÇÃO
  ngOnInit(): void {
    // Carrega os dados assim que o componente é iniciado
    this.carregarVeiculos();
  }

  // 3. MÉTODO PARA BUSCAR DADOS
  carregarVeiculos(): void {
    this.veiculoService.getVeiculos().subscribe({
      next: (dados) => {
        // Armazena os dados recebidos do Back-end
        this.veiculos = dados; 
        console.log('Veículos carregados com sucesso:', this.veiculos);
      },
      error: (erro) => {
        // Trata erros de CORS, 404, etc.
        console.error('Erro ao carregar veículos:', erro);
        alert('Falha ao carregar veículos. Verifique se o Back-end está rodando e se não há erros de CORS.');
      }
    });
  }
  
  // Exemplo de função de filtro (opcional)
  aplicarFiltros(): void {
    alert('Filtros aplicados (Implementar lógica de filtro no Back-end)');
    // Aqui você chamaria um método no VeiculoService com os parâmetros de filtro
  }
}