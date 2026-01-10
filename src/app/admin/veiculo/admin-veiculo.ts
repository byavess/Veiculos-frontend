import {Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, HostListener, ChangeDetectorRef} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {AdminVeiculoService} from './admin-veiculo.service';
import {IVeiculo} from '../../interfaces/IVeiculo';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-veiculo',
  standalone: false,
  templateUrl: './admin-veiculo.html',
  styleUrls: ['./admin-veiculo.css']
})
export class AdminVeiculoComponent implements OnInit, OnChanges {
  @Input() filtroLivre: string = '';
  viewMode: 'table' | 'card' = 'table';
  displayedColumns: string[] = [
    'info', 'placa', 'vendido', 'acoes'
  ];
  dataSource = new MatTableDataSource<IVeiculo>();
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  private filtroTimeout: any;

  // Novo: array acumulativo para o modo card
  cardData: IVeiculo[] = [];
  loadingCardData = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private adminVeiculoService: AdminVeiculoService,
    private cdr: ChangeDetectorRef,
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.carregarVeiculos();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['filtroLivre'] && !changes['filtroLivre'].firstChange) {
      this.pageIndex = 0;
      this.cardData = []; // Limpa dados acumulados ao filtrar
      // Debounce para evitar requisições a cada tecla
      if (this.filtroTimeout) {
        clearTimeout(this.filtroTimeout);
      }
      this.filtroTimeout = setTimeout(() => {
        this.carregarVeiculos(0, this.pageSize, this.filtroLivre);
      }, 350);
    }
  }

  carregarVeiculos(page: number = 0, size: number = 10, filtroLivre: string = this.filtroLivre): void {
    if (this.viewMode === 'card') {
      this.loadingCardData = true;
    }
    this.adminVeiculoService.getVeiculosPaginados({
      page,
      size,
      q: filtroLivre,
      withAuth: true
    }).subscribe({
      next: (result) => {
        this.dataSource.data = result.content;
        this.totalElements = result.totalElements;
        this.pageSize = result.size;
        this.pageIndex = result.number;
        if (this.viewMode === 'card') {
          if (page === 0) {
            this.cardData = result.content || [];
          } else {
            this.cardData = [...this.cardData, ...(result.content || [])];
          }
          this.loadingCardData = false;
          this.cdr.detectChanges(); // Força atualização do Angular
        }
        setTimeout(() => {
          if (this.sort) this.dataSource.sort = this.sort;
        });
      },
      error: (err) => {
        if (this.viewMode === 'card') {
          this.loadingCardData = false;
          this.cdr.detectChanges();
        }
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarVeiculos(this.pageIndex, this.pageSize, this.filtroLivre);
  }

  // Adicione logs mais detalhados temporariamente
  cadastrarVeiculo(): void {
    this.router.navigate(['/admin/veiculo/novo']);
  }

  editarVeiculo(veiculo: IVeiculo): void {
    this.router.navigate(['/admin/veiculo/editar', veiculo.id]);
  }

  deletarVeiculo(veiculo: IVeiculo): void {
    if (!veiculo || !veiculo.id) return;
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '350px',
      data: {
        title: 'Confirmação',
        message: 'Tem certeza que deseja deletar este veículo?'
      }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.adminVeiculoService.deleteVeiculo(veiculo.id).subscribe({
          next: () => {
            this.snackBar.open('Veículo deletado com sucesso!', '', {
              duration: 3000,
              panelClass: ['snackbar-success'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.pageIndex = 0;
            this.carregarVeiculos(0, this.pageSize, this.filtroLivre);
          },
          error: (err) => {
            const mensagemErro = err?.error?.error || err.message || 'Erro desconhecido';
            this.snackBar.open('Erro ao deletar veículo: ' + mensagemErro, '', {
              duration: 5000,
              panelClass: ['snackbar-error'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
          }
        });
      }
    });
  }

  get pagedData(): IVeiculo[] {
    // Para o modo card, retorna o array acumulativo
    return this.viewMode === 'card' ? this.cardData : (this.dataSource.data || []);
  }

  @HostListener('scroll', ['$event'])
  onScroll(event: any) {
    if (this.viewMode !== 'card' || this.loadingCardData) return;
    const { scrollTop, scrollHeight, clientHeight } = event.target;
    // Só carrega mais se não estiver carregando e houver mais itens
    if (scrollTop + clientHeight >= scrollHeight - 10) {
      if (this.cardData.length < this.totalElements) {
        this.loadingCardData = true; // Evita múltiplas requisições
        this.pageIndex++;
        this.carregarVeiculos(this.pageIndex, this.pageSize, this.filtroLivre);
      }
    }
  }

  // Detecta troca de modo para resetar cardData
  setViewMode(mode: 'table' | 'card') {
    if (this.viewMode !== mode) {
      this.viewMode = mode;
      if (mode === 'card') {
        this.pageIndex = 0;
        this.cardData = [];
        this.carregarVeiculos(0, this.pageSize, this.filtroLivre);
      }
    }
  }
}
