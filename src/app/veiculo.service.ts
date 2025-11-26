// src/app/veiculo.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

// Interface para garantir a tipagem correta dos dados
export interface Veiculo {
  id?: number; // O ID é opcional na criação
  marca: string;
  modelo: string;
  ano: number;
  preco: number;
  quilometragem: number;
  descricao: string;
  urlsFotos: string[]; // O Array de URLs das 7+ fotos
}

@Injectable({
  // providedIn: 'root' torna o serviço disponível globalmente (StandAlone)
  providedIn: 'root'
})
export class VeiculoService {

  // ATENÇÃO: Verifique se a URL e a porta (8080) do seu Back-end Java estão corretas.
  // SE SEU BACK-END USA OUTRA PORTA, MUDE O NÚMERO AQUI!
  private readonly apiUrl = 'http://localhost:8080/api/veiculos';

  constructor(private http: HttpClient) { }
  
  /**
   * Obtém os headers de autorização (necessário para todas as rotas de Admin/CRUD)
   */
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('auth_token');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      // Adiciona o token JWT no cabeçalho de Autorização
      'Authorization': `Bearer ${token}` 
    });
  }

  // --- MÉTODOS PÚBLICOS (VITRINE) ---

  /**
   * Obtém todos os veículos para exibição na Vitrine e Dashboard (Sem filtros por enquanto)
   */
  getVeiculos(): Observable<Veiculo[]> {
    return this.http.get<Veiculo[]>(this.apiUrl);
  }

  /**
   * Obtém os detalhes de um veículo específico (para a página de detalhes)
   */
  getVeiculo(id: number): Observable<Veiculo> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Veiculo>(url);
  }

  // --- MÉTODOS DE ADMIN (CRUD) ---

  /**
   * Cria um novo veículo. Requer autenticação.
   */
  createVeiculo(veiculo: Veiculo): Observable<Veiculo> {
    // Usa os headers de autenticação
    return this.http.post<Veiculo>(this.apiUrl, veiculo, { headers: this.getAuthHeaders() });
  }

  /**
   * Atualiza um veículo existente. Requer autenticação.
   */
  updateVeiculo(id: number, veiculo: Veiculo): Observable<Veiculo> {
    const url = `${this.apiUrl}/${id}`;
    // Usa os headers de autenticação
    return this.http.put<Veiculo>(url, veiculo, { headers: this.getAuthHeaders() });
  }

  /**
   * Deleta um veículo. Requer autenticação.
   */
  deleteVeiculo(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    // Usa os headers de autenticação
    return this.http.delete<void>(url, { headers: this.getAuthHeaders() });
  }
}