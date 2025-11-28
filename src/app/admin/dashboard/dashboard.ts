// src/app/admin/admin-dashboard/admin-dashboard.component.ts

import { AfterViewInit, Component, OnInit, ViewChild,inject } from '@angular/core';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Router, RouterLink } from '@angular/router';
import { VeiculoService, Veiculo } from '../../veiculo.service'; // Ajuste o caminho se necessário
import { MatCardModule } from '@angular/material/card';
import { CommonModule, DecimalPipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true, // 🛑 Confirme se é standalone
  imports: [
    CommonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatPaginatorModule,
    DecimalPipe, // Pipe de formatação de número (preço)
    RouterLink // Habilita routerLink
  ],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class AdminDashboardComponent implements OnInit, AfterViewInit {

   // 🛑 CORRIGIDO: Injeção de dependências via inject()
 private veiculoService = inject(VeiculoService);
 private router = inject(Router);

  // Colunas a serem exibidas na tabela (deve corresponder ao seu HTML)
  displayedColumns: string[] = ['id', 'marca', 'modelo', 'ano', 'preco', 'acoes'];
  
  // Fonte de dados para a tabela
  dataSource = new MatTableDataSource<Veiculo>();

  // Referência ao MatPaginator no HTML
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  

  ngOnInit(): void {
    this.carregarVeiculos();
  }

  ngAfterViewInit() {
    // 🛑 Conecta o paginator à fonte de dados APÓS a inicialização da view
    this.dataSource.paginator = this.paginator;
  }

  /**
   * 1. Carrega os veículos do backend e preenche a tabela.
   */
  carregarVeiculos(): void {
    // ATENÇÃO: Se for usar autenticação, este método deve usar o token JWT
    this.veiculoService.getVeiculos().subscribe({
      next: (data) => {
        this.dataSource.data = data;
        // O paginator é conectado automaticamente no ngAfterViewInit
      },
      error: (err) => {
        console.error('Erro ao carregar veículos:', err);
        // Implementar MatSnackBar para mostrar erro ao usuário
      }
    });
  }

  /**
   * 2. Implementa a lógica de filtro
   */
  aplicarFiltro(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  /**
   * 3. Navega para a tela de edição
   */
  editarVeiculo(id: number): void {
    this.router.navigate(['/admin/veiculo-form', id]);
  }

  /**
   * 4. Deleta um veículo
   */
  deletarVeiculo(id: number): void {
    if (confirm(`Tem certeza que deseja deletar o veículo ID ${id}?`)) {
      
    }
  }
}