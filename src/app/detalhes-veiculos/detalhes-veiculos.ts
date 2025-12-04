import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Observable, catchError, EMPTY, switchMap, tap } from 'rxjs';
import { VeiculoService, Veiculo } from '../veiculo.service';

@Component({
  selector: 'app-detalhes-veiculos',
  standalone: false,
  templateUrl: './detalhes-veiculos.html',
  styleUrls: ['./detalhes-veiculos.css']
})
export class DetalhesVeiculos implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private veiculoService = inject(VeiculoService);

  veiculo$!: Observable<Veiculo | null>;
  carregando: boolean = true;
  statusMessage: { text: string; type: 'success' | 'error' | '' } = { text: '', type: '' };
 private whatsappNumber = '61984321908';
  private defaultMessage = 'Olá! Gostaria de mais de mais informações sobre os veiculos disponíveis?'

  // Imagem selecionada na galeria
  selectedImage: string | null = null;

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

  deletarVeiculo(id: number, modelo: string): void {
    // 🛑 Substituído 'confirm()' por uma lógica de status/modal (aqui apenas logando)
    console.log(`Solicitação de deleção para o veículo ID: ${id}.`);

    // Na aplicação real, você usaria um MatDialog para confirmar antes
    const confirmacao = true; // Simulação de confirmação positiva

    if (confirmacao) {
      this.veiculoService.deleteVeiculo(id).subscribe({
        next: () => {
          this.statusMessage = { text: `✅ ${modelo} deletado com sucesso! Redirecionando...`, type: 'success' };
          setTimeout(() => {
            this.router.navigate(['/home']); // Redireciona
          }, 2000);
        },
        error: (erro) => {
          this.statusMessage = { text: '❌ Erro ao deletar veículo. Tente novamente.', type: 'error' };
          console.error('❌ Erro ao deletar:', erro);
        }
      });
    }
  }

  comprarVeiculo(modelo: string, preco: number): void {
    // 🛑 Substituído 'alert()'
    this.statusMessage = { text: `🎉 Parabéns! Você simulou a compra do ${modelo} por R$ ${preco}.`, type: 'success' };
    console.log('Simulação de compra concluída.');
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

  openWhatsApp(veiculo?: Veiculo): void {
    let message = this.defaultMessage;
    
    if (veiculo) {
      message = `Olá! Tenho interesse no veículo:
      
🏎️ ${veiculo.marca} ${veiculo.modelo}
📅 Ano: ${veiculo.ano}
💰 Valor: R$ ${(veiculo.preco)}
${veiculo.marca ? `📏 ${veiculo.marca.toLocaleString()} km` : ''}

Poderia me enviar mais informações?`;
    }
    
    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.whatsappNumber}?text=${encodedMessage}`;
    
    // Abre o WhatsApp em nova aba
    window.open(whatsappUrl, '_blank');
    

   
  }
  
}
