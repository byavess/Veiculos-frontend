import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { VeiculoService } from '../veiculo.service';
import { catchError, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import {IVeiculo} from '../interfaces/IVeiculo';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.html',
  styleUrls: ['./estoque.css'],
  standalone: false,
})
export class EstoqueComponent implements OnInit {
  constructor(
    private veiculoService: VeiculoService,
    private router: Router,
    private fb: FormBuilder,
    private cdRef: ChangeDetectorRef
  ) {}

  // Arrays SIMPLES para template
  veiculos: IVeiculo[] = [];
  veiculosFiltrados: IVeiculo[] = [];
  loading: boolean = false;
  erroCarregamento: boolean = false;
  // Filtro Form
  filtroForm!: FormGroup;
  // Opções para filtros
  marcasDisponiveis: string[] = [];
  modelosDisponiveis: string[] = [];
  anosDisponiveis: number[] = [];
  // WhatsApp
  private whatsappNumber = '61984321908';

  ngOnInit(): void {
    this.inicializarFormulario();
    this.carregarVeiculos();
  }

  inicializarFormulario(): void {
    this.filtroForm = this.fb.group({
      marca: ['Todas as Marcas'],
      modelo: [''],
      anoMin: [''],
      anoMax: [''],
      precoMin: [''],
      precoMax: ['']
    });
  }

  carregarVeiculos(): void {
    console.log('🔍 Iniciando carregamento...');
    this.loading = true;
    this.erroCarregamento = false;

    // Força o Angular a detectar a mudança no loading
    this.cdRef.detectChanges();

    this.veiculoService.getVeiculos().pipe(
      tap((veiculos) => {
        console.log('✅ Veículos carregados:', veiculos.length, 'itens');
        this.veiculos = veiculos;
        this.veiculosFiltrados = [...veiculos];

        // Extrair marcas únicas
        const marcasUnicas = [...new Set(veiculos.map(v => v.marca))];
        this.marcasDisponiveis = ['Todas as Marcas', ...marcasUnicas.sort()];

        // Extrair anos únicos
        const anos = [...new Set(veiculos.map(v => v.ano))];
        this.anosDisponiveis = anos.sort((a, b) => a - b);

        // Inicializar modelos
        this.atualizarModelosDisponiveis();

        this.loading = false;
        console.log('✅ Loading definido como false');

        // Força detecção de mudanças APÓS carregar
        this.cdRef.detectChanges();
      }),
      catchError((error) => {
        console.error('❌ Erro ao carregar veículos:', error);
        this.loading = false;
        this.erroCarregamento = true;
        this.cdRef.detectChanges();
        return of([]);
      })
    ).subscribe();
  }

  atualizarModelosDisponiveis(): void {
    const marcaSelecionada = this.filtroForm.get('marca')?.value;

    if (!this.veiculos || this.veiculos.length === 0) {
      this.modelosDisponiveis = [];
      return;
    }

    let modelosFiltrados: string[];

    if (marcaSelecionada === 'Todas as Marcas') {
      modelosFiltrados = [...new Set(this.veiculos.map(v => v.modelo))];
    } else {
      modelosFiltrados = [...new Set(
        this.veiculos
          .filter(v => v.marca === marcaSelecionada)
          .map(v => v.modelo)
      )];
    }

    this.modelosDisponiveis = modelosFiltrados.sort();
  }

  aplicarFiltros(): void {
    const filtros = this.filtroForm.value;

    // Se todos os filtros estão vazios, mostrar todos
    if (this.isFiltrosVazios(filtros)) {
      this.veiculosFiltrados = [...this.veiculos];
      return;
    }

    this.veiculosFiltrados = this.veiculos.filter(veiculo => {
      // Filtro por marca
      if (filtros.marca && filtros.marca !== 'Todas as Marcas') {
        if (veiculo.marca !== filtros.marca) {
          return false;
        }
      }

      // Filtro por modelo (busca parcial)
      if (filtros.modelo && filtros.modelo.trim() !== '') {
        const modeloVeiculo = veiculo.modelo.toLowerCase();
        const modeloFiltro = filtros.modelo.toLowerCase().trim();

        if (!modeloVeiculo.includes(modeloFiltro)) {
          return false;
        }
      }

      // Filtro por ano mínimo
      if (filtros.anoMin && filtros.anoMin !== '') {
        if (veiculo.ano < Number(filtros.anoMin)) {
          return false;
        }
      }

      // Filtro por ano máximo
      if (filtros.anoMax && filtros.anoMax !== '') {
        if (veiculo.ano > Number(filtros.anoMax)) {
          return false;
        }
      }

      // Filtro por preço mínimo
      if (filtros.precoMin && filtros.precoMin !== '') {
        if (veiculo.preco < Number(filtros.precoMin)) {
          return false;
        }
      }

      // Filtro por preço máximo
      if (filtros.precoMax && filtros.precoMax !== '') {
        if (veiculo.preco > Number(filtros.precoMax)) {
          return false;
        }
      }

      return true;
    });
  }

  isFiltrosVazios(filtros: any): boolean {
    return (
      (!filtros.marca || filtros.marca === 'Todas as Marcas') &&
      (!filtros.modelo || filtros.modelo.trim() === '') &&
      (!filtros.anoMin || filtros.anoMin === '') &&
      (!filtros.anoMax || filtros.anoMax === '') &&
      (!filtros.precoMin || filtros.precoMin === '') &&
      (!filtros.precoMax || filtros.precoMax === '')
    );
  }

  limparFiltros(): void {
    this.filtroForm.reset({
      marca: 'Todas as Marcas',
      modelo: '',
      anoMin: '',
      anoMax: '',
      precoMin: '',
      precoMax: ''
    });

    this.atualizarModelosDisponiveis();
    this.veiculosFiltrados = [...this.veiculos];
  }

  onMarcaChange(): void {
    this.atualizarModelosDisponiveis();
    this.filtroForm.get('modelo')?.setValue('');
  }

  verDetalhes(id: number): void {
    this.router.navigate(['/details', id]);
  }

  // WhatsApp para veículo específico
  openWhatsApp(veiculo: IVeiculo): void {
    const message = `🏎️ *${veiculo.marca} ${veiculo.modelo} ${veiculo.ano}*

📋 *Detalhes do Veículo:*
• **Marca:** ${veiculo.marca}
• **Modelo:** ${veiculo.modelo}
• **Ano:** ${veiculo.ano}
• **Cor:** ${veiculo.cor || 'Não informada'}
• **Preço:** R$ ${veiculo.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}

${veiculo.descricao ? `📝 *Descrição:* ${veiculo.descricao}` : ''}

Olá! Tenho interesse neste veículo. Poderia me enviar mais informações?`;

    this.abrirWhatsApp(message);
  }

  // WhatsApp geral (botão flutuante)
  contatoWhatsApp(): void {
    const message = 'Olá! Gostaria de informações sobre o estoque completo de veículos disponíveis.';
    this.abrirWhatsApp(message);
  }

  private abrirWhatsApp(message: string): void {
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;
    window.open(whatsappUrl, '_blank');
  }

  onImageError(event: any): void {
    event.target.src = 'https://placehold.co/600x400/1a237e/ffffff?text=Veículo+Sem+Imagem';
  }

  getImagemUrl(path: string): string {
    return this.veiculoService.getImagemUrl(path);
  }

  // Método para obter anos em ordem crescente para ano mínimo
  getAnosCrescente(): number[] {
    return [...this.anosDisponiveis].sort((a, b) => a - b);
  }

  // Método para obter anos em ordem decrescente para ano máximo
  getAnosDecrescente(): number[] {
    return [...this.anosDisponiveis].sort((a, b) => b - a);
  }

  // Método auxiliar para obter imagem do veículo
  getImagemDoVeiculo(veiculo: IVeiculo): string {
    if (!veiculo.urlsFotos || veiculo.urlsFotos.length === 0) {
      return 'https://placehold.co/600x400/1a237e/ffffff?text=Veículo+Sem+Imagem';
    }

    try {
      return this.getImagemUrl(veiculo.urlsFotos[0]);
    } catch (error) {
      return 'https://placehold.co/600x400/1a237e/ffffff?text=Erro+na+Imagem';
    }
  }
}
