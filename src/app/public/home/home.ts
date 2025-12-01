// src/app/public/home/home.ts (ou home.component.ts)

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // Para o ngModel

// 🎯 Componentes Standalone do Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatIconModule } from '@angular/material/icon';

import { VeiculoService, Veiculo } from '../../veiculo.service';
import { Observable, catchError, of, tap } from 'rxjs';



// Interface do filtro (simples, só para o input)
interface Filtro {
  marca: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
  imports: [
    CommonModule,
    RouterLink,
    FormsModule, // Para formulários
    // 🎯 Módulos do Angular Material
    MatCardModule, MatButtonModule, MatFormFieldModule, MatInputModule,
    MatProgressSpinnerModule, MatIconModule
],
})
export class Home implements OnInit {
  // Injeção de dependência moderna (inject)
  private veiculoService = inject(VeiculoService);

  veiculos$!: Observable<Veiculo[]>;
  loading: boolean = false;
  erroCarregamento: boolean = false;
  marcaFiltro: Filtro = { marca: '' }; // Objeto de filtro para o ngModel

  ngOnInit() {
    this.carregarVeiculos();
  }

  carregarVeiculos(): void {
    this.loading = true;
    this.erroCarregamento = false;

    // Conecta ao backend via VeiculoService
    this.veiculos$ = this.veiculoService.getVeiculos().pipe(
      // Executa o lado a lado (tap) para gerenciar o estado de carregamento
      tap(() => {
        this.loading = false;
      }),
      // Captura o erro, define o estado de erro e retorna um Observable vazio
      catchError((error) => {
        console.error('❌ Erro ao carregar veículos do backend:', error);
        this.loading = false;
        this.erroCarregamento = true;
        // Retorna um Observable de lista vazia para o template não quebrar
        return of([]);
      })
    );
  }

  aplicarFiltros(): void {
    const marca = this.marcaFiltro.marca.trim();
    if (marca) {
      this.loading = true;
      this.erroCarregamento = false;
      // Chama o método de filtragem do seu service
      this.veiculos$ = this.veiculoService.getVeiculosByMarca(marca).pipe(
        tap(() => this.loading = false),
        catchError((error) => {
          console.error('❌ Erro ao filtrar veículos:', error);
          this.loading = false;
          this.erroCarregamento = true;
          return of([]);
        })
      );
    } else {
      // Se o filtro estiver vazio, recarrega todos
      this.carregarVeiculos();
    }
  }

  // Método auxiliar para formatação de preço profissional (Melhor ainda seria um Pipe)
  formatarPreco(preco: number): string {
    // Pipe de formatação é mais idiomático no Angular (vide HTML abaixo)
    return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  }
}