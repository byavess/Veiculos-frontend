import { Component, OnInit, inject } from '@angular/core';
import { VeiculoService, Veiculo } from '../veiculo.service';
import { Observable, catchError, of, tap, map } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';

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
      // Transforma os veículos para buscar suas imagens
      map((veiculos: Veiculo[]) => {
        return veiculos.map((veiculo: Veiculo) => {
          // Instancia ou processa cada veículo para carregar imagens
          // Exemplo: carrega a imagem se tiver um ID
          if (veiculo.urlsFotos && veiculo.urlsFotos.length > 0) {
            this.veiculoService.buscarImagemVeiculo(veiculo.urlsFotos[0]).subscribe(
              (imagem) => {
                veiculo.imagem = imagem; // Adiciona a URL da imagem ao veículo
              }
            );
          }
          console.log(veiculo)
          return veiculo;
        });
      }),
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

  // Método auxiliar para formatação de preço profissional (Melhor ainda seria um Pipe)
  formatarPreco(preco: number): string {
    // Pipe de formatação é mais idiomático no Angular (vide HTML abaixo)
    return preco.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2 });
  }
}
