import { Injectable } from '@angular/core';
import { VeiculoService } from '../../veiculo.service';
import { Observable } from 'rxjs';
import { HttpHeaders } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AdminVeiculoService {
  constructor(private veiculoService: VeiculoService) {}

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
}
