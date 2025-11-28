import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VeiculoService, Veiculo } from '../../veiculo.service';

@Component({
  selector: 'app-detalhes-veiculos',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div style="max-width: 1000px; margin: 0 auto; padding: 20px;">
      <button [routerLink]="['/public/home']" style="background: none; border: 1px solid #ddd; padding: 8px 15px; border-radius: 5px; cursor: pointer; margin-bottom: 20px;">
        ← Voltar
      </button>
      
      <div *ngIf="veiculo; else carregando">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 40px;">
          <!-- Imagem do veículo -->
          <img 
            [src]="veiculo.imagem" 
            [alt]="veiculo.modelo" 
            style="width: 100%; border-radius: 8px; background: #f5f5f5;"
            (error)="onImageError($event)"
          >
          
          <div>
            <h1 style="color: #2c3e50;">{{ veiculo.marca }} {{ veiculo.modelo }}</h1>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <p><strong>Ano:</strong> {{ veiculo.ano }}</p>
              <p><strong>Preço:</strong> R$ {{ veiculo.preco | number:'1.2-2' }}</p>
              <p><strong>Cor:</strong> {{ veiculo.cor || 'Não informada' }}</p>
            </div>
            
            <div style="margin-bottom: 20px;">
              <h3>Descrição</h3>
              <p>{{ veiculo.descricao }}</p>
            </div>
            
            <button style="background: #27ae60; color: white; border: none; padding: 15px 30px; border-radius: 5px; font-size: 16px; cursor: pointer; width: 100%;">
              Entrar em Contato
            </button>
          </div>
        </div>
      </div>
      
      <ng-template #carregando>
        <div style="text-align: center; padding: 50px;">
          <p>Carregando veículo...</p>
        </div>
      </ng-template>
    </div>
  `
})
export class DetalhesVeiculos implements OnInit {
  veiculo: Veiculo | null = null;

  private route = inject(ActivatedRoute);
  private veiculoService = inject(VeiculoService);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carregarVeiculo(parseInt(id));
    }
  }

  carregarVeiculo(id: number): void {
    this.veiculoService.getVeiculoById(id).subscribe({
      next: (dados: Veiculo) => {
        this.veiculo = dados;
      },
      error: (erro: any) => {
        console.error('Erro ao carregar veículo:', erro);
      }
    });
  }

  onImageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/500x300/ddd/666?text=Imagem+Não+Encontrada';
  }
}