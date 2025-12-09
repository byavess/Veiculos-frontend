import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';

export interface Veiculo {

  id: number;
  marca: string;
  modelo: string;
  ano: number;
  km?: number;
  preco: number;
  descricao: string;
  urlsFotos: string[];
  cor?: string;
  motor?: string;
  cambio?: string;
  combustivel?: string;
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

  // Busca todas as marcas disponíveis
  getAllMarcas(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/marcas`);
  }

  // Busca modelos (todos ou filtrados por marca)
  getModelos(marca?: string): Observable<string[]> {
    const url = marca
      ? `${this.apiUrl}/modelos?marca=${encodeURIComponent(marca)}`
      : `${this.apiUrl}/modelos`;
    return this.http.get<string[]>(url);
  }

  // Busca paginada de veículos
  getVeiculosPaginados(params: {
    marca?: string;
    modelo?: string;
    anoMin?: number;
    anoMax?: number;
    sort?: string;
    direction?: string;
    page?: number;
    size?: number;
  } = {}): Observable<any> {
    // Monta os parâmetros da query string
    const queryParams = new URLSearchParams();
    if (params.marca) queryParams.append('marca', params.marca);
    if (params.modelo) queryParams.append('modelo', params.modelo);
    if (params.anoMin !== undefined) queryParams.append('anoMin', params.anoMin.toString());
    if (params.anoMax !== undefined) queryParams.append('anoMax', params.anoMax.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.direction) queryParams.append('direction', params.direction);
    queryParams.append('page', params.page?.toString() ?? '0');
    queryParams.append('size', params.size?.toString() ?? '12');
    const url = `${this.apiUrl}?${queryParams.toString()}`;
    return this.http.get<any>(url);
  }

}
