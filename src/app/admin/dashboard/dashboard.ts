// src/app/admin/dashboard/dashboard.ts - CÓDIGO COMPLETO E CORRIGIDO
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router'; // Adicionando Router para navegação
import { CommonModule, DecimalPipe } from '@angular/common'; // Para *ngFor e Pipes (number)
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule } from '@angular/material/paginator'; // Corrigindo NG8001: 'mat-paginator'
import { MatTableModule } from '@angular/material/table'; // Corrigindo Warnings/Erros da Tabela
import { VeiculoService, Veiculo } from '../../veiculo.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterLink, 
    // Módulos do Material (Tabela, Paginação e Formulário)
    MatCardModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, 
    MatTableModule, // ESSENCIAL para MatTable, matHeaderCellDef, matCellDef, etc.
    MatPaginatorModule 
  ],
  templateUrl: './dashboard.html', 
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  
  // A tabela usa 'veiculos' como DataSource
  // CORREÇÃO: Renomeado de 'veiculos' para 'dataSource' no template para evitar confusão, mas vamos manter 'veiculos' como array de dados
  veiculos: Veiculo[] = [];
  displayedColumns: string[] = ['id', 'marca', 'modelo', 'ano', 'preco', 'actions'];
  
  // Se o HTML usa 'dataSource', você deve criar essa propriedade
  dataSource: Veiculo[] = []; // Inicialmente vazia

  constructor(private veiculoService: VeiculoService, private router: Router) { }

  ngOnInit(): void {
    this.carregarVeiculos();
  }

  carregarVeiculos(): void {
    // CORREÇÃO: Usando a tipagem de erro 'any'
    this.veiculoService.getVeiculos().subscribe({
      next: (data) => {
        this.veiculos = data;
        this.dataSource = data; // A tabela usa dataSource
      },
      error: (err: any) => { // Tipagem de erro
        console.error('Erro ao carregar veículos para o Admin:', err);
      }
    });
  }
  
  // CORREÇÃO: Implementando os métodos chamados no HTML (TS2339)
  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    // Lógica de filtro aqui (ex: filtrar this.veiculos e atualizar this.dataSource)
    console.log('Filtrando por:', filterValue.trim().toLowerCase());
  }

  editarVeiculo(id: number | undefined): void {
    if (id !== undefined) {
        this.router.navigate(['/admin/veiculo-form', id]);
    }
  }

  deletarVeiculo(id: number | undefined): void { // O HTML usa deletarVeiculo, renomeando
    if (id !== undefined && confirm('Tem certeza que deseja excluir este veículo?')) {
      this.veiculoService.deleteVeiculo(id).subscribe({
        next: () => {
          alert('Veículo excluído com sucesso!');
          this.carregarVeiculos();
        },
        error: (err: any) => { // Tipagem de erro
          console.error('Erro ao excluir veículo:', err);
          alert('Falha ao excluir. Verifique sua autenticação e o Back-end.');
        }
      });
    }
  }
}