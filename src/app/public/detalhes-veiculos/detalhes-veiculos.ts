// src/app/public/detalhes-veiculos/detalhes-veiculos.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common'; // Para *ngIf, *ngFor, e pipes
import { ActivatedRoute, RouterLink } from '@angular/router'; // Para obter o ID da rota

// Imports do Material (Ajuste conforme o seu HTML de detalhes)
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

// Importa o serviço e a interface Veiculo (Resolve TS2307 no Service)
import { VeiculoService, Veiculo } from '../../veiculo.service';
import { Observable, switchMap } from 'rxjs'; // Para carregar dados da rota

@Component({
  selector: 'app-detalhes-veiculos',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    // Módulos do Material
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './detalhes-veiculos.html',
  styleUrls: ['./detalhes-veiculos.css']
})
export class DetalhesVeiculos implements OnInit {

  // Propriedade para armazenar o veículo carregado
  veiculo: Veiculo | undefined;
  
  // Para lidar com erros ou loading
  loading = true;
  erroCarregamento = false;

  constructor(
    private route: ActivatedRoute, // Para acessar parâmetros da URL
    private veiculoService: VeiculoService // Para buscar os dados
  ) { }

  ngOnInit(): void {
    this.carregarDetalhesVeiculo();
  }

  carregarDetalhesVeiculo(): void {
    // 1. Obtém o parâmetro 'id' da rota
    const idParam = this.route.snapshot.paramMap.get('id');
    const veiculoId = idParam ? parseInt(idParam, 10) : NaN;

    this.loading = true;
    this.erroCarregamento = false;

    // 2. Verifica se o ID é um número válido
    if (!isNaN(veiculoId)) {
      // 3. Usa o serviço para buscar o veículo por ID
      this.veiculoService.getVeiculo(veiculoId).subscribe({
        next: (data) => {
          this.veiculo = data;
          this.loading = false;
        },
        error: (err: any) => {
          console.error('Erro ao buscar detalhes do veículo:', err);
          this.erroCarregamento = true;
          this.loading = false;
        }
      });
    } else {
      console.error('ID de veículo inválido na URL.');
      this.erroCarregamento = true;
      this.loading = false;
    }
  }

  // Método de exemplo para simular o clique em "Simular Agora"
  simularFinanciamento(modelo: string | undefined): void {
    alert(`Você está simulando o financiamento para o veículo: ${modelo || 'Não especificado'}.`);
    // Lógica real de redirecionamento ou abertura de modal aqui
  }

}