import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

export interface Veiculo {

  id: number;
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  descricao: string;
  urlsFotos: string[];
  cor?: string;
  imagem: Blob | null;
}

@Injectable({
  providedIn: 'root'
})
export class VeiculoService {

  private http = inject(HttpClient);
  private readonly apiUrl = 'http://localhost:8080/api/veiculos';
  veiculoService: any;

  constructor() {
  }

  // Método SIMPLES para buscar veículos
  getVeiculos(): Observable<Veiculo[]> {
    console.log('🔍 Testando conexão com backend...', this.apiUrl);
    return this.http.get<Veiculo[]>(this.apiUrl);
  }

  // Método SIMPLES para buscar veículo por ID
  getVeiculoById(id: number): Observable<Veiculo> {
    return this.http.get<Veiculo>(`${this.apiUrl}/${id}`);
  }

  // Método SIMPLES para filtrar por marca
  getVeiculosByMarca(marca: string): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(`${this.apiUrl}/marca/${marca}`);
  }

  // Adicione no VeiculoService:
  deleteVeiculo(id: number) {
    console.log('Veículo deletado (mock):', id);
    // Por enquanto só mostra no console
    return of(null);
  }

  // Helper para construir a URL da imagem via endpoint de imagens
  getImagemUrl(path: string): string {
    // Normaliza: remove possível prefixo '/images/' e barras iniciais
    const normalized = path.replace(/^\/?images\//, '').replace(/^\//, '');
    return `${this.apiUrl}/imagens?path=${encodeURIComponent(normalized)}`;
  }
  openWhatsApp(veiculo?: Veiculo): void {
    this.veiculoService.openWhatsApp(veiculo);
  }

}
