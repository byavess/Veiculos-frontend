import {Component, OnInit, ViewChild, Input, OnChanges, SimpleChanges, HostListener, ChangeDetectorRef} from '@angular/core';
import {MatTableDataSource} from '@angular/material/table';
import {MatPaginator, PageEvent} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {AdminVeiculoService} from './admin-veiculo.service';
import {IVeiculo} from '../../interfaces/IVeiculo';

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

  constructor(private adminVeiculoService: AdminVeiculoService, private cdr: ChangeDetectorRef) {}

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
    console.log('[carregarVeiculos] chamada', { page, size, filtroLivre, viewMode: this.viewMode });
    if (this.viewMode === 'card') {
      this.loadingCardData = true;
      console.log('[carregarVeiculos] set loadingCardData = true');
    }
    this.adminVeiculoService.getVeiculosPaginados({
      page,
      size,
      q: filtroLivre,
      withAuth: true
    }).subscribe({
      next: (result) => {
        console.log('[carregarVeiculos] resultado recebido', result);
        this.dataSource.data = result.content;
        this.totalElements = result.totalElements;
        this.pageSize = result.size;
        this.pageIndex = result.number;
        if (this.viewMode === 'card') {
          if (page === 0) {
            this.cardData = result.content || [];
            console.log('[carregarVeiculos] cardData inicial', this.cardData);
          } else {
            this.cardData = [...this.cardData, ...(result.content || [])];
            console.log('[carregarVeiculos] cardData append', this.cardData);
          }
          this.loadingCardData = false;
          console.log('[carregarVeiculos] set loadingCardData = false');
          this.cdr.detectChanges(); // Força atualização do Angular
        }
        setTimeout(() => {
          if (this.sort) this.dataSource.sort = this.sort;
        });
      },
      error: (err) => {
        console.error('[carregarVeiculos] erro', err);
        if (this.viewMode === 'card') {
          this.loadingCardData = false;
          console.log('[carregarVeiculos] set loadingCardData = false (erro)');
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

  editarVeiculo(veiculo: IVeiculo): void {
    // Implementar navegação para edição
  }

  deletarVeiculo(veiculo: IVeiculo): void {
    // Implementar deleção
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
    console.log('[setViewMode] chamada', { atual: this.viewMode, novo: mode });
    if (this.viewMode !== mode) {
      this.viewMode = mode;
      if (mode === 'card') {
        this.pageIndex = 0;
        this.cardData = [];
        console.log('[setViewMode] trocando para card, resetando pageIndex e cardData');
        this.carregarVeiculos(0, this.pageSize, this.filtroLivre);
      }
    }
  }
}
