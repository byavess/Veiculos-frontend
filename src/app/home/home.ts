import { Component, OnInit, ViewChild, ChangeDetectorRef } from '@angular/core';
import { VeiculoService, Veiculo } from '../veiculo.service';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  filtroForm: FormGroup;
  marcasDisponiveis: string[] = [];
  modelosDisponiveis: string[] = [];
  veiculos: Veiculo[] = [];
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
      anoMax: ['']
    });
  }

  ngOnInit() {
    this.carregarMarcas();
    this.carregarModelos(); // Carrega todos os modelos inicialmente
    this.carregarVeiculos();
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
    this.loading = true;
    this.erroCarregamento = false;
    const { marca, modelo, anoMin, anoMax } = this.filtroForm.value;

    console.log('📋 Valores do formulário:', { marca, modelo, anoMin, anoMax });
    console.log('   marca tipo:', typeof marca, 'vazio?', marca === '');
    console.log('   modelo tipo:', typeof modelo, 'vazio?', modelo === '');

    const params = {
      marca: marca || undefined,
      modelo: modelo || undefined,
      anoMin: anoMin ? Number(anoMin) : undefined,
      anoMax: anoMax ? Number(anoMax) : undefined,
      sort: 'preco',
      direction: 'asc',
      page: this.pageIndex,
      size: this.pageSize
    };

    console.log('📤 Parâmetros enviados:', params);

    this.veiculoService.getVeiculosPaginados(params).subscribe({
      next: (response) => {
        console.log('✅ Resposta recebida do backend:', response);

        if (!response) {
          console.warn('⚠️ Resposta vazia ou undefined');
          this.veiculos = [];
          this.totalElements = 0;
        } else {
          console.log('📊 Estrutura da resposta:', {
            hasContent: !!response.content,
            contentType: Array.isArray(response.content) ? 'Array' : typeof response.content,
            contentLength: response.content?.length,
            totalElements: response.totalElements
          });

          this.veiculos = response.content || [];
          this.totalElements = response.totalElements || 0;
        }

        this.loading = false;
        console.log('✅ Estado final:', {
          veiculosCount: this.veiculos.length,
          totalElements: this.totalElements,
          loading: this.loading
        });

        // Força detecção de mudanças
        this.cdr.detectChanges();
        console.log('🔄 DetectChanges executado');
      },
      error: (error) => {
        console.error('❌ Erro ao carregar veículos:', error);
        this.loading = false;
        this.erroCarregamento = true;
        this.veiculos = [];
        this.totalElements = 0;
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
    window.open(`https://wa.me/${this.whatsappNumber}?text=${encodeURIComponent(this.defaultMessage)}`, '_blank');
  }

  onImageError(event: any): void {
    event.target.src = 'https://placehold.co/600x400?text=Imagem+N%C3%A3o+Encontrada';
  }

  getImagemUrl(path: string): string {
    return this.veiculoService.getImagemUrl(path);
  }

  openWhatsApp(veiculo?: Veiculo): void {
    let message = this.defaultMessage;
    if (veiculo) {
      message = `Olá! Tenho interesse no veículo:\n\n🏎️ ${veiculo.marca} ${veiculo.modelo}\n📅 Ano: ${veiculo.ano}\n💰 Valor: R$ ${(veiculo.preco)}\n${veiculo.km ? `📏 ${veiculo.km.toLocaleString()} km` : ''}\n\nPoderia me enviar mais informações?`;
    }
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  getCorHex(cor: string): string {
    const coresMap: { [key: string]: string } = {
      'branco': '#FFFFFF',
      'preto': '#1A1A1A',
      'prata': '#C0C0C0',
      'cinza': '#808080',
      'cinza escuro': '#4A4A4A',
      'vermelho': '#DC143C',
      'azul': '#1E90FF',
      'verde': '#228B22',
      'amarelo': '#FFD700',
      'laranja': '#FF8C00',
      'marrom': '#8B4513',
      'bege': '#F5F5DC',
      'dourado': '#DAA520',
      'vinho': '#722F37',
      'roxo': '#800080',
      'rosa': '#FF69B4'
    };

    return coresMap[cor?.toLowerCase()] || '#808080';
  }

  getCombustivelFormatado(combustivel: string): string {
    const combustivelMap: { [key: string]: string } = {
      'ALCOOL': 'Álcool',
      'FLEX': 'Flex',
      'GASOLINA': 'Gasolina',
      'GNV': 'GNV',
      'DIESEL': 'Diesel',
      'ELETRICO': 'Elétrico',
      'HIBRIDO': 'Híbrido'
    };

    return combustivelMap[combustivel] || combustivel;
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
}

