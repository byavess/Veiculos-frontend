import { Injectable } from '@angular/core';
import { VeiculoService } from '../../veiculo.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';
import {IVeiculo} from '../../interfaces/IVeiculo';

@Injectable({ providedIn: 'root' })
export class AdminVeiculoService {
  constructor(private veiculoService: VeiculoService, private http: HttpClient) {}

  private readonly apiUrl = `${environment.apiBaseUrl}/admin/veiculos`;

  getVeiculosPaginados(params: {
    q?: string;
    marca?: string;
    modelo?: string;
    anoMin?: number;
    anoMax?: number;
    sort?: string;
    direction?: string;
    page?: number;
    size?: number;
    vendido?: boolean;
    withAuth?: boolean; // se true, envia o token
  } = {}): Observable<any> {
    let headers = undefined;
    if (params.withAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
      }
    }
    // Remove withAuth do params antes de passar para o service
    const { withAuth, ...queryParams } = params;
    return this.veiculoService.getVeiculosPaginados(queryParams, headers);
  }

  deleteVeiculo(id: number) {
    let headers = undefined;
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }
    return this.http.delete(`${this.apiUrl}/${id}`, { headers });
  }

  cadastrarVeiculo(veiculo: IVeiculo) {
    const token = localStorage.getItem('auth_token');
    let headers = undefined;
    if (token) {
      headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }
    return this.http.post(`${this.apiUrl}`, veiculo, { headers });
  }

  editarVeiculo(veiculo: IVeiculo) {
    const token = localStorage.getItem('auth_token');
    let headers = undefined;
    if (token) {
      headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }
    return this.http.put(`${this.apiUrl}/${veiculo.id}`, veiculo, { headers });
  }

  uploadImagem(file: File): Observable<string> {
    const token = localStorage.getItem('auth_token');
    let headers = undefined;
    if (token) {
      headers = new HttpHeaders({ 'Authorization': `Bearer ${token}` });
    }
    const formData = new FormData();
    formData.append('file', file);
    // Backend agora retorna { path: "veiculos/xxx.jpg" }
    return this.http.post<{path: string}>(`${this.apiUrl}/upload-imagem`, formData, { headers })
      .pipe(
        map(response => response.path)
      );
  }

  getMiniaturaUrl(path: string): string {
    if (!path) return '';
    if (/^https?:\/\//.test(path)) return path;
    return `${environment.apiBaseUrl}/veiculos/imagens?path=${encodeURIComponent(path)}`;
  }
}
