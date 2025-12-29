import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { VeiculoService } from '../veiculo.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import {IVeiculo} from '../interfaces/IVeiculo';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filtroForm: FormGroup;
  marcasDisponiveis: string[] = [];
  modelosDisponiveis: string[] = [];
  veiculos: IVeiculo[] = [];
  
  totalElements: number = 0;
  pageSize: number = 12;
  pageIndex: number = 0;
  pageSizeOptions: number[] = [12, 24, 36];
  loading: boolean = false;
  erroCarregamento: boolean = false;
  private whatsappNumber = '61984321908';
  private defaultMessage = 'Olá! Gostaria de mais de mais informações sobre os veiculos disponíveis?';
  anoCorrente: number = new Date().getFullYear();

  // Controle do carrossel de imagens
  currentImageIndexes: Map<number, number> = new Map();

  // Ordenação
  ordenacaoSelecionada: string = 'oferta';

  // Carrossel do Banner
  currentSlide: number = 0;
  totalSlides: number = 3;
  autoPlayInterval: any;


  constructor(
    private fb: FormBuilder,
    private veiculoService: VeiculoService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.filtroForm = this.fb.group({
      marca: [''],
      modelo: [''],
      anoMin: [''],
      anoMax: [''],


      buscaGeral: [''],

    });
  }

  public showDetailedFilters: boolean = false; // Começa escondido, conforme Imagem 2

  ngOnInit() {
    this.carregarMarcas();
    this.carregarModelos(); // Carrega todos os modelos inicialmente
    this.carregarVeiculos();
    this.startAutoPlay(); // Inicia carrossel automático
  }

  ngOnDestroy() {
    this.stopAutoPlay(); // Para o carrossel ao destruir componente
  }

  carregarMarcas(): void {
    console.log('🔄 Carregando marcas do backend...');
    this.veiculoService.getAllMarcas().subscribe({
      next: (marcas) => {
        console.log('✅ Marcas recebidas:', marcas);
        this.marcasDisponiveis = marcas.sort();
      },
      error: (error) => {
        console.error('❌ Erro ao carregar marcas:', error);
        this.marcasDisponiveis = [];
      }
    });
  }

  carregarModelos(marca?: string): void {
    console.log('🔄 Carregando modelos...', marca ? `da marca: ${marca}` : 'todos');
    this.veiculoService.getModelos(marca).subscribe({
      next: (modelos) => {
        console.log('✅ Modelos recebidos:', modelos);
        this.modelosDisponiveis = modelos;
      },
      error: (error) => {
        console.error('❌ Erro ao carregar modelos:', error);
        this.modelosDisponiveis = [];
      }
    });
  }

  carregarVeiculos(): void {
    console.log('🔄 Iniciando carregamento de veículos...');
    console.log('🎯 ORDENAÇÃO ATUAL:', this.ordenacaoSelecionada);
    this.loading = true;
    this.erroCarregamento = false;
    const { marca, modelo, anoMin, anoMax,buscaGeral } = this.filtroForm.value;

    console.log('📋 Valores do formulário:', { marca, modelo, anoMin, anoMax });
    console.log('   marca tipo:', typeof marca, 'vazio?', marca === '');
    console.log('   modelo tipo:', typeof modelo, 'vazio?', modelo === '');

    // Configurar ordenação baseada na seleção
    let sortBy = 'emOferta';
    let direction = 'desc';

    console.log('🔄 Ordenação selecionada:', this.ordenacaoSelecionada);

    switch (this.ordenacaoSelecionada) {
      case 'oferta':
        sortBy = 'emOferta';
        direction = 'desc';
        break;
      case 'preco-asc':
        sortBy = 'preco';
        direction = 'asc';
        break;
      case 'preco-desc':
        sortBy = 'preco';
        direction = 'desc';
        break;
      case 'ano-desc':
        sortBy = 'ano';
        direction = 'desc';
        break;
      case 'ano-asc':
        sortBy = 'ano';
        direction = 'asc';
        break;
      case 'km-asc':
        sortBy = 'km';
        direction = 'asc';
        break;
      case 'marca':
        sortBy = 'marca';
        direction = 'asc';
        break;
    }

    const params = {
      marca: marca || undefined,
      modelo: modelo || undefined,
      anoMin: anoMin ? Number(anoMin) : undefined,
      anoMax: anoMax ? Number(anoMax) : undefined,
       busca: buscaGeral || undefined,
      sort: sortBy,
      direction: direction,
      page: this.pageIndex,
      size: this.pageSize
    };

    console.log('📤 Parâmetros enviados:', params);
    console.log('🎯 Ordenação aplicada:', sortBy, direction);

    this.veiculoService.getVeiculosPaginados(params).subscribe({
      next: (response) => {
        console.log('✅ Resposta recebida do backend:', response);

         if (response && response.content) {
          let listaFiltrada = response.content;

          // --- LÓGICA DE FILTRO LOCAL (SEGURANÇA) ---
          // Se o usuário digitou algo na busca geral (ex: "Jeep"), filtramos aqui no front
          if (buscaGeral && buscaGeral.trim() !== '') {
            const termo = buscaGeral.toLowerCase().trim();
            listaFiltrada = listaFiltrada.filter((v: IVeiculo) => 
              v.marca.toLowerCase().includes(termo) || 
              v.modelo.toLowerCase().includes(termo) 
             
            );
          }

          this.veiculos = listaFiltrada;
          this.totalElements = response.totalElements;
        } else {
          this.veiculos = [];
          this.totalElements = 0;
        }

        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Erro:', error);
        this.loading = false;
        this.erroCarregamento = true;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.carregarVeiculos();
  }

  aplicarFiltros(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.firstPage();
    }
    this.carregarVeiculos();
  }

  limparFiltros(): void {
    this.filtroForm.reset({ marca: '', modelo: '', anoMin: '', anoMax: '' });
    this.carregarModelos(); // Recarrega todos os modelos
    this.aplicarFiltros();
  }



  onMarcaChange(): void {
    const marcaSelecionada = this.filtroForm.get('marca')?.value;

    // Limpar modelo quando marca muda
    this.filtroForm.patchValue({ modelo: '' });

    // Carrega modelos: se marca selecionada, filtra; se não, busca todos
    this.carregarModelos(marcaSelecionada || undefined);

    // Aplica os filtros automaticamente quando marca muda
    this.aplicarFiltros();
  }

  onAnoChange(): void {
    console.log('📅 Filtro de ano alterado');
    this.aplicarFiltros();
  }

  getAnosDisponiveis(): number[] {
    const anos: number[] = [];
    const anoAtual = new Date().getFullYear();
    for (let ano = anoAtual; ano >= 1990; ano--) {
      anos.push(ano);
    }
    return anos;
  }


  verDetalhes(id: number): void {
    console.log('🔍 Navegando para detalhes do veículo ID:', id);
    this.router.navigate(['/details', id]);
  }

  contatoWhatsApp(): void {
    this.veiculoService.openWhatsApp(undefined, this.whatsappNumber, this.defaultMessage);
  }

  onImageError(event: any): void {
    event.target.src = 'https://placehold.co/600x400?text=Imagem+N%C3%A3o+Encontrada';
  }

  getImagemUrl(path: string): string {
    return this.veiculoService.getImagemUrl(path);
  }

  openWhatsApp(veiculo?: IVeiculo): void {
    this.veiculoService.openWhatsApp(veiculo, this.whatsappNumber);
  }

  getCorHex(cor: string): string {
    return this.veiculoService.getCorHex(cor);
  }

  getCombustivelFormatado(combustivel: string): string {
    return this.veiculoService.getCombustivelFormatado(combustivel);
  }

  getCambioFormatado(cambio: string): string {
    return this.veiculoService.getCambioFormatado(cambio);
  }

  // Métodos do Carrossel de Imagens
  getCurrentImageIndex(veiculoIndex: number): number {
    return this.currentImageIndexes.get(veiculoIndex) || 0;
  }

  getCurrentImageUrl(veiculoIndex: number): string {
    const veiculo = this.veiculos[veiculoIndex];
    if (!veiculo || !veiculo.urlsFotos || veiculo.urlsFotos.length === 0) {
      return 'https://placehold.co/600x400/1a237e/ffffff?text=Veículo+Sem+Imagem';
    }
    const currentIndex = this.getCurrentImageIndex(veiculoIndex);
    return this.getImagemUrl(veiculo.urlsFotos[currentIndex]);
  }

  nextImage(veiculoIndex: number, event: Event): void {
    event.stopPropagation();
    const veiculo = this.veiculos[veiculoIndex];
    if (!veiculo?.urlsFotos || veiculo.urlsFotos.length <= 1) return;

    const currentIndex = this.getCurrentImageIndex(veiculoIndex);
    const nextIndex = (currentIndex + 1) % veiculo.urlsFotos.length;
    this.currentImageIndexes.set(veiculoIndex, nextIndex);
  }

  previousImage(veiculoIndex: number, event: Event): void {
    event.stopPropagation();
    const veiculo = this.veiculos[veiculoIndex];
    if (!veiculo?.urlsFotos || veiculo.urlsFotos.length <= 1) return;

    const currentIndex = this.getCurrentImageIndex(veiculoIndex);
    const prevIndex = currentIndex === 0 ? veiculo.urlsFotos.length - 1 : currentIndex - 1;
    this.currentImageIndexes.set(veiculoIndex, prevIndex);
  }

  goToImage(veiculoIndex: number, imageIndex: number, event: Event): void {
    event.stopPropagation();
    this.currentImageIndexes.set(veiculoIndex, imageIndex);
  }

  // Método de Ordenação
  aplicarOrdenacao(): void {
    console.log('🔄 Aplicando ordenação:', this.ordenacaoSelecionada);
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.carregarVeiculos();
  }

  // ==========================================
  // MÉTODOS DO CARROSSEL DE BANNER
  // ==========================================

  startAutoPlay(): void {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Muda de slide a cada 5 segundos
  }

  stopAutoPlay(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.totalSlides;
  }

  previousSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.totalSlides - 1 : this.currentSlide - 1;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
    // Reinicia o auto-play ao clicar em um indicador
    this.stopAutoPlay();
    this.startAutoPlay();
  }

  scrollToVehicles(): void {
    const vehiclesSection = document.querySelector('.veiculos-container');
    if (vehiclesSection) {
      vehiclesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }




  public toggleFiltros(): void {
    this.showDetailedFilters = !this.showDetailedFilters;
}

public aplicarFiltrosGeral(): void {
    // Você pode adicionar uma lógica de debounce aqui, mas por enquanto:
    this.aplicarFiltros();
}



}

