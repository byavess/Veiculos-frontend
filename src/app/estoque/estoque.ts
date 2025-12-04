import { Component, OnInit, inject } from '@angular/core';
import { VeiculoService, Veiculo } from '../veiculo.service';
import { Observable, catchError, of, tap } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-estoque',
  templateUrl: './estoque.html',
  styleUrls: ['./estoque.css'],
  standalone: false,
})
export class EstoqueComponent implements OnInit {
  private veiculoService = inject(VeiculoService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  
  veiculos$!: Observable<Veiculo[]>;
  loading: boolean = false;
  erroCarregamento: boolean = false;
  
  // Filtro Form
  filtroForm!: FormGroup;
  
  // Opções para filtros
  marcasDisponiveis: string[] = [
    'Todas as Marcas', 'Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen', 
    'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru', 'Renault', 'Fiat', 
    'Land Rover', 'BMW', 'Mercedes', 'Jeep', 'Peugeot', 'Citroen'
  ];
  
  anosDisponiveis: number[] = this.gerarAnos(2000, 2024);

  
  
  // WhatsApp
  private whatsappNumber = '61984321908';

  ngOnInit(): void {
        this.carregarVeiculos();
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



  gerarAnos(inicio: number, fim: number): number[] {
    const anos = [];
    for (let ano = fim; ano >= inicio; ano--) {
      anos.push(ano);
    }
    return anos;
  }

  carregarVeiculos(): void {
    this.loading = true;
    this.erroCarregamento = false;

    // Conecta ao backend via VeiculoService
    this.veiculos$ = this.veiculoService.getVeiculos().pipe(
      tap((veiculos) => {
        console.log('✅ Veículos carregados:', veiculos);
        this.loading = false;
      }),
      catchError((error) => {
        console.error('❌ Erro ao carregar veículos do backend:', error);
        this.loading = false;
        this.erroCarregamento = true;
        return of([]);
      })
    );
  }

  aplicarFiltros(): void {
    const filtro = this.filtroForm.value;
    
    if (filtro.marca && filtro.marca !== 'Todas as Marcas') {
      this.loading = true;
      this.veiculos$ = this.veiculoService.getVeiculosByMarca(filtro.marca).pipe(
        tap(() => this.loading = false),
        catchError((error) => {
          console.error('Erro ao filtrar:', error);
          this.loading = false;
          return of([]);
        })
      );
    } else {
      this.carregarVeiculos();
    }
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
    this.carregarVeiculos();
  }

  verDetalhes(id: number): void {
    this.router.navigate(['/details', id]);
  }

  // WhatsApp para veículo específico
  openWhatsApp(veiculo: Veiculo): void {
    const message = `Olá! Tenho interesse no veículo do estoque:

🏎️ *${veiculo.marca} ${veiculo.modelo}*
📅 Ano: ${veiculo.ano}
💰 Valor: R$ ${veiculo.preco.toLocaleString('pt-BR')}

Poderia me enviar mais informações?`;
    
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

  getImagemUrl(path: string): string {
    return this.veiculoService.getImagemUrl(path);
  }

  onImageError(event: any): void {
    event.target.src = 'https://placehold.co/600x400?text=Imagem+Não+Encontrada';
  }

  formatarPreco(preco: number): string {
    return 'R$ ' + preco.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}