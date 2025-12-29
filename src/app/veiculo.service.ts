import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {Injectable} from '@angular/core';
import {IVeiculo} from './interfaces/IVeiculo';
import {environment} from '../environments/environment';


@Injectable({
  providedIn: 'root'
})
export class VeiculoService {

  constructor(private http: HttpClient) {
  }

  private readonly apiUrl = `${environment.apiBaseUrl}/veiculos`;

  getVeiculos(): Observable<IVeiculo[]> {
    return this.http.get<IVeiculo[]>(this.apiUrl);
  }

  getVeiculoById(id: number, withAuth: boolean = false): Observable<IVeiculo> {
    let options = {};
    if (withAuth) {
      const token = localStorage.getItem('auth_token');
      if (token) {
        options = { headers: { Authorization: `Bearer ${token}` } };
      }
    }
    return this.http.get<IVeiculo>(`${this.apiUrl}/${id}`, options);
  }


  // Helper para construir a URL da imagem via endpoint de imagens
  getImagemUrl(path: string): string {
    // Normaliza: remove possível prefixo '/images/' e barras iniciais
    const normalized = path.replace(/^\/?images\//, '').replace(/^\//, '');
    return `${this.apiUrl}/imagens?path=${encodeURIComponent(normalized)}`;
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
  } = {}, headers?: any): Observable<any> {
    // Monta os parâmetros da query string
    const queryParams = new URLSearchParams();
    if (params.q) queryParams.append('q', params.q);
    if (params.marca) queryParams.append('marca', params.marca);
    if (params.modelo) queryParams.append('modelo', params.modelo);
    if (params.anoMin !== undefined) queryParams.append('anoMin', params.anoMin.toString());
    if (params.anoMax !== undefined) queryParams.append('anoMax', params.anoMax.toString());
    if (params.sort) queryParams.append('sort', params.sort);
    if (params.direction) queryParams.append('direction', params.direction);
    if (params.vendido !== undefined) queryParams.append('vendido', params.vendido.toString());
    queryParams.append('page', params.page?.toString() ?? '0');
    queryParams.append('size', params.size?.toString() ?? '12');
    const url = `${this.apiUrl}?${queryParams.toString()}`;
    return this.http.get<any>(url, headers ? { headers } : {});
  }

  // ==========================================
  // MÉTODOS UTILITÁRIOS PARA FORMATAÇÃO
  // ==========================================

  /**
   * Formata o combustível para exibição amigável
   */
  getCombustivelFormatado(combustivel: string): string {
    const mapa: { [key: string]: string } = {
      'FLEX': 'Flex (Etanol/Gasolina)',
      'GASOLINA': 'Gasolina',
      'ETANOL': 'Etanol',
      'DIESEL': 'Diesel',
      'ELETRICO': 'Elétrico',
      'HIBRIDO': 'Híbrido',
      'GNV': 'GNV (Gás Natural)'
    };
    return mapa[combustivel?.toUpperCase()] || combustivel;
  }

  /**
   * Converte nome da cor para código hexadecimal
   */
  getCorHex(cor: string): string {
    const cores: { [key: string]: string } = {
      'preto': '#000000',
      'branco': '#FFFFFF',
      'prata': '#C0C0C0',
      'cinza': '#808080',
      'vermelho': '#FF0000',
      'azul': '#0000FF',
      'verde': '#008000',
      'amarelo': '#FFFF00',
      'laranja': '#FFA500',
      'marrom': '#8B4513',
      'bege': '#F5F5DC',
      'dourado': '#FFD700',
      'roxo': '#800080',
      'rosa': '#FFC0CB',
      'bordo': '#800000',
      'vinho': '#722F37'
    };
    return cores[cor?.toLowerCase()] || '#666666';
  }

  /**
   * Formata o tipo de câmbio para exibição
   */
  getCambioFormatado(cambio: string): string {
    const mapa: { [key: string]: string } = {
      'AUTOMATICO': 'Automático',
      'MANUAL': 'Manual',
      'CVT': 'CVT (Automático)',
      'AUTOMATIZADO': 'Automatizado'
    };
    return mapa[cambio?.toUpperCase()] || cambio;
  }

  /**
   * Abre o WhatsApp com mensagem pré-formatada sobre o veículo
   * @param veiculo Veículo sobre o qual deseja informações (opcional)
   * @param whatsappNumber Número do WhatsApp (com DDI)
   * @param customMessage Mensagem personalizada (opcional)
   */
  openWhatsApp(veiculo?: IVeiculo, whatsappNumber: string = '61984321908', customMessage?: string): void {
    let message: string;

    if (customMessage) {
      message = customMessage;
    } else if (veiculo) {
      message = `Olá! Tenho interesse no veículo:

🏎️ ${veiculo.marca} ${veiculo.modelo}
📅 Ano: ${veiculo.ano}
💰 Valor: R$ ${veiculo.preco.toLocaleString('pt-BR', {minimumFractionDigits: 2})}
${veiculo.km ? `📏 ${veiculo.km.toLocaleString('pt-BR')} km` : ''}
${veiculo.cor ? `🎨 Cor: ${veiculo.cor}` : ''}
${veiculo.cambio ? `⚙️ Câmbio: ${this.getCambioFormatado(veiculo.cambio)}` : ''}

Poderia me enviar mais informações?`;
    } else {
      message = 'Olá! Gostaria de mais informações sobre os veículos disponíveis.';
    }

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    // Abre o WhatsApp em nova aba
    window.open(whatsappUrl, '_blank');
  }

  /**
   * Busca veículos vendidos (vendido=true)
   */
  getVeiculosVendidos(): Observable<IVeiculo[]> {
    return this.http.get<IVeiculo[]>(`${this.apiUrl}?vendido=true`);
  }

}
