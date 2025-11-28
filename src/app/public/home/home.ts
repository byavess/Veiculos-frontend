import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { VeiculoService, Veiculo } from '../../veiculo.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="max-width: 1200px; margin: 0 auto; padding: 20px;">
      <header style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #2c3e50;">🚗 Loja de Veículos</h1>
      <p>Conectado com Backend Java ✅</p>
      
      <!-- Botão para recarregar -->
      <button 
        (click)="carregarVeiculos()" 
        style="background: #3498db; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; margin: 10px;">
        🔄 Recarregar Veículos
      </button>
    </header>

      <!-- Loading -->
    <div *ngIf="carregando" style="text-align: center; padding: 40px;">
      <p>Carregando veículos do backend Java...</p>
    </div>

    <!-- Grid de Veículos -->
    <div *ngIf="!carregando && veiculos.length > 0" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 20px;">
      <div *ngFor="let veiculo of veiculos" style="border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
        <div style="width: 100%; height: 200px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
          {{ veiculo.marca }} {{ veiculo.modelo }}
        </div>
        
        <div style="padding: 15px;">
          <h3 style="margin: 0 0 10px 0; color: #2c3e50;">{{ veiculo.marca }} {{ veiculo.modelo }}</h3>
          <p style="color: #7f8c8d; margin: 5px 0;">Ano: {{ veiculo.ano }}</p>
          <p style="font-size: 1.2em; font-weight: bold; color: #27ae60; margin: 10px 0;">
            R$ {{ veiculo.preco | number:'1.2-2' }}
          </p>
          <p style="color: #34495e; margin: 5px 0;">Cor: {{ veiculo.cor || 'Não informada' }}</p>
          <button style="background: #3498db; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; width: 100%; margin-top: 10px;">
            Ver Detalhes
          </button>
        </div>
      </div>
    </div>


      <!-- Mensagem se não há veículos -->
    <div *ngIf="veiculos.length === 0 && !carregando" style="text-align: center; padding: 40px;">
      <p>Nenhum veículo encontrado.</p>
      <button (click)="carregarVeiculos()" style="background: #e74c3c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">
        Tentar Carregar Novamente
      </button>
    </div>
  </div>
  `
})
export class Home implements OnInit {
  veiculos: Veiculo[] = [];
  carregando: boolean = false;
  erro: string = '';

  constructor(
    private veiculoService: VeiculoService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarVeiculos();
  }

  carregarVeiculos(): void {
    this.carregando = true;
    this.erro = '';
    
console.log('Tentando conectar com:', 'http://localhost:8080/api/veiculos');

    this.veiculoService.getVeiculos().subscribe({
      next: (dados: Veiculo[]) => {
        this.veiculos = dados;
        this.carregando = false;
        console.log('Veículos carregados:', this.veiculos);
        this.veiculos = dados;
        this.carregando = false;
      },
      error: (erro: any) => {
        this.carregando = false;
        this.erro = 'Erro ao carregar veículos. Verifique se o backend Java está rodando na porta 8080.';
        console.error('Erro:', erro);
        
        
      }
    });
  }

  onImageError(event: any): void {
    // Se a imagem não carregar, usa um placeholder
    event.target.src = 'https://via.placeholder.com/300x200/ddd/666?text=Imagem+Não+Encontrada';
  }
}