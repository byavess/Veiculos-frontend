import { Component, OnInit, inject } from '@angular/core';
import { VeiculoService, Veiculo } from '../veiculo.service';
import { Observable, catchError, of, tap } from 'rxjs';

// Interface do filtro (simples, só para o input)
interface Filtro {
  marca: string;
}

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: './home.html',
  styleUrls: ['./home.css']
})
export class Home implements OnInit {
  // Injeção de dependência moderna (inject)
  private veiculoService = inject(VeiculoService);


  constructor() {
  }

  veiculos!: Observable<Veiculo[]>;
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
    this.veiculos = this.veiculoService.getVeiculos().pipe(
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
    const marca = this.marcaFiltro.marca.trim();
    if (marca) {
      this.loading = true;
      this.erroCarregamento = false;
      // Chama o método de filtragem do seu service
      this.veiculos = this.veiculoService.getVeiculosByMarca(marca).pipe(
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

  onImageError(event: any): void {
    event.target.src = 'https://placehold.co/600x400?text=Imagem+N%C3%A3o+Encontrada';
  }

  getImagemUrl(path: string): string {
    console.log(path)
    return this.veiculoService.getImagemUrl(path);
  }
}
