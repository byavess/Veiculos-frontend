import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, EMPTY, switchMap, tap } from 'rxjs';
import { VeiculoService } from '../veiculo.service';
import { IVeiculo } from '../interfaces/IVeiculo';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-detalhes-veiculos',
  standalone: false,
  templateUrl: './detalhes-veiculos.html',
  styleUrls: ['./detalhes-veiculos.css']
})
export class DetalhesVeiculos implements OnInit {
  veiculo$!: Observable<IVeiculo | null>;
  carregando: boolean = true;
  statusMessage: { text: string; type: 'success' | 'error' | '' } = { text: '', type: '' };
  private whatsappNumber = '61984321908';
  private defaultMessage = 'Olá! Gostaria de mais de mais informações sobre os veiculos disponíveis?';

  // Imagem selecionada na galeria
  selectedImage: string | null = null;

  @ViewChild('imagemExpandida') imagemExpandidaTemplate!: TemplateRef<any>;
  @ViewChild('expandedImage') expandedImage: any;
  imagemExpandidaUrl: string | null = null;

  // Controle de zoom
  zoomLevel: number = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private veiculoService: VeiculoService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.carregarDetalhes();
  }

  carregarDetalhes(): void {
    this.carregando = true;
    this.statusMessage = { text: '', type: '' };

    this.veiculo$ = this.route.paramMap.pipe(
      // Pega o parâmetro 'id' da rota
      switchMap(params => {
        const id = Number(params.get('id'));
        if (isNaN(id) || id <= 0) {
          console.error('ID inválido na rota.');
          this.carregando = false;
          this.statusMessage = { text: 'ID do veículo inválido.', type: 'error' };
          return EMPTY; // Encerra o fluxo
        }

        // Chama o serviço para buscar o veículo
        return this.veiculoService.getVeiculoById(id).pipe(
          tap(veiculo => {
            this.carregando = false;
            if (!veiculo) {
              this.statusMessage = { text: 'Veículo não encontrado.', type: 'error' };
            }
          }),
          catchError(erro => {
            this.carregando = false;
            this.statusMessage = { text: 'Erro de conexão ao carregar detalhes do veículo. Verifique o backend.', type: 'error' };
            console.error('❌ Erro:', erro);
            return EMPTY; // Encerra o fluxo e evita que o template tente usar dados
          })
        );
      })
    );
  }

  comprarVeiculo(modelo: string, preco: number): void {
    this.statusMessage = { text: `🎉 Parabéns! Você simulou a compra do ${modelo} por R$ ${preco}.`, type: 'success' };
  }

  // Galeria: selecionar uma miniatura
  selectImage(url: string): void {
    this.selectedImage = url;
  }

  // Constrói URL da imagem via endpoint
  getImagemUrl(path: string): string {
    return this.veiculoService.getImagemUrl(path);
  }

  onMainImageError(event: any): void {
    event.target.src = 'https://placehold.co/800x400?text=Imagem+N%C3%A3o+Encontrada';
  }

  onThumbnailError(event: any): void {
    event.target.src = 'https://placehold.co/80x60?text=Sem+Foto';
  }

  openWhatsApp(veiculo?: IVeiculo): void {
    this.veiculoService.openWhatsApp(veiculo, this.whatsappNumber);
  }

  // Delegar métodos de formatação para o service
  getCombustivelFormatado(combustivel: string): string {
    return this.veiculoService.getCombustivelFormatado(combustivel);
  }

  getCorHex(cor: string): string {
    return this.veiculoService.getCorHex(cor);
  }

  getCambioFormatado(cambio: string): string {
    return this.veiculoService.getCambioFormatado(cambio);
  }

  openImagemExpandida(url: string): void {
    this.imagemExpandidaUrl = url;
    this.zoomLevel = 1; // Reset zoom ao abrir
    this.dialog.open(this.imagemExpandidaTemplate, {
      data: url,
      panelClass: 'imagem-expandida-dialog-panel',
      maxWidth: '98vw',
      maxHeight: '98vh',
      width: '98vw',
      height: '98vh',
      hasBackdrop: true,
      backdropClass: 'dialog-backdrop-dark',
      disableClose: false
    });
  }

  // Métodos de controle de zoom
  zoomIn(): void {
    if (this.zoomLevel < 3) {
      this.zoomLevel++;
    }
  }

  zoomOut(): void {
    if (this.zoomLevel > 1) {
      this.zoomLevel--;
    }
  }

  resetZoom(): void {
    this.zoomLevel = 1;
  }

  toggleZoom(): void {
    if (this.zoomLevel === 1) {
      this.zoomLevel = 2;
    } else if (this.zoomLevel === 2) {
      this.zoomLevel = 3;
    } else {
      this.zoomLevel = 1;
    }
  }
}
