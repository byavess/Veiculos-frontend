import {Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef, NgZone} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {VeiculoService} from '../../veiculo.service';
import {IVeiculo} from '../../interfaces/IVeiculo';
import {IMarca} from '../../interfaces/IMarca';
import {IModelo} from '../../interfaces/IModelo';
import {AdminVeiculoService} from '../veiculo/admin-veiculo.service';
import { CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-veiculo-form',
  standalone: false,
  templateUrl: './veiculo-editar-cadastrar.html',
  styleUrls: ['./veiculo-editar-cadastrar.css'],
  providers: [CurrencyPipe]
})
export class VeiculoEditarCadastrarComponent implements OnInit {
  veiculoForm!: FormGroup;
  isEdicao: boolean = false;
  veiculoId: number | null = null;
  carregando: boolean = false;
  formularioAlterado: boolean = false;
  valoresOriginais: any = null;

  marcasDisponiveis: IMarca[] = [];

  modelosDisponiveis: IModelo[] = [];

  imagemPrincipalUrl: string | null = null;
  uploadEmProgresso: boolean = false;
  @ViewChild('imagemExpandida') imagemExpandidaTemplate!: TemplateRef<any>;
  imagemExpandidaUrl: string | null = null;

  imagemVisivel: boolean[] = [];
  uploadsPendentes: number = 0;

  maxImagens: number = 7;
  maxTamanhoImagemMB: number = 2;
  erroUploadImagem: string = '';

  constructor(
    private fb: FormBuilder,
    private veiculoService: VeiculoService,
    private adminVeiculoService: AdminVeiculoService,
    private router: Router,
    private route: ActivatedRoute,
    private currencyPipe: CurrencyPipe,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef,
    private ngZone: NgZone,
    private snackBar: MatSnackBar
  ) {}



  get veiculoFormUrlsFotos(): FormArray {
    return this.veiculoForm.get('urlsFotos') as FormArray;
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.carregarMarcas();
    this.carregarModelos();

    // Atualiza modelos ao trocar a marca
    this.veiculoForm.get('marca')?.valueChanges.subscribe((marcaId: number) => {
      this.carregarModelos(marcaId);
      // Limpa o modelo selecionado ao trocar de marca
      this.veiculoForm.get('modelo')?.setValue('');
    });

    this.veiculoForm?.get('vendido')?.valueChanges.subscribe((vendido: boolean) => {
      if (vendido) {
        this.veiculoForm.get('emOferta')?.setValue(false, { emitEvent: false });
        this.veiculoForm.get('emOferta')?.disable({ emitEvent: false }); // Desabilita programaticamente
        this.veiculoForm.get('infoVenda')?.setValidators([Validators.required]);
      } else {
        this.veiculoForm.get('emOferta')?.enable({ emitEvent: false }); // Habilita programaticamente
        this.veiculoForm.get('infoVenda')?.clearValidators();
      }
      this.veiculoForm.get('infoVenda')?.updateValueAndValidity();
    });
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEdicao = true;
        this.veiculoId = +id;
        this.carregando = true;
        this.veiculoService.getVeiculoById(this.veiculoId, true).subscribe({
          next: (veiculo) => {
            // Formata o preço antes de carregar (converte número para string formatada)
            const precoFormatado = veiculo.preco
              ? this.currencyPipe.transform(veiculo.preco, 'BRL', 'symbol', '1.2-2')
              : null;

            // Primeiro seta todos os valores exceto o modelo
            this.veiculoForm.patchValue({
              marca: veiculo.marca?.id, // Usa o ID da marca
              ano: veiculo.ano,
              preco: precoFormatado, // Usa o preço formatado
              km: veiculo.km,
              cor: veiculo.cor,
              cambio: veiculo.cambio,
              combustivel: veiculo.combustivel,
              descricao: veiculo.descricao,
              imagem: veiculo.imagem,
              placa: veiculo.placa,
              motor: veiculo.motor,
              emOferta: veiculo.emOferta,
              vendido: veiculo.vendido,
              infoVenda: veiculo.infoVenda,
              urlsFotos: veiculo.urlsFotos && veiculo.urlsFotos.length > 0 ? veiculo.urlsFotos : []
            });

            // Carrega os modelos da marca e depois seta o modelo selecionado
            if (veiculo.marca?.id) {
              this.veiculoService.getModelos(veiculo.marca.id).subscribe({
                next: (modelos) => {
                  this.modelosDisponiveis = modelos;
                  // Agora que os modelos estão carregados, seta o valor do modelo
                  this.veiculoForm.patchValue({
                    modelo: veiculo.modelo?.id
                  });

                  // IMPORTANTE: Salva valores originais DEPOIS de setar o modelo
                  setTimeout(() => {
                    this.salvarValoresOriginais();
                    this.monitorarMudancasFormulario();
                  }, 100);
                },
                error: () => {
                  this.modelosDisponiveis = [];
                }
              });
            } else {
              // Se não tem marca, salva imediatamente
              setTimeout(() => {
                this.salvarValoresOriginais();
                this.monitorarMudancasFormulario();
              }, 100);
            }

            // Exibe a miniatura principal a partir da primeira imagem de urlsFotos
            if (veiculo.urlsFotos && veiculo.urlsFotos.length > 0 && typeof veiculo.urlsFotos[0] === 'string') {
              this.imagemPrincipalUrl = this.adminVeiculoService.getMiniaturaUrl(veiculo.urlsFotos[0]);
            } else {
              this.imagemPrincipalUrl = null;
            }
            this.veiculoForm.setControl('urlsFotos', this.fb.array([]));
            if (veiculo.urlsFotos && veiculo.urlsFotos.length > 0) {
              veiculo.urlsFotos.forEach(url => {
                this.veiculoFormUrlsFotos.push(this.fb.control(url));
              });
              this.imagemVisivel = veiculo.urlsFotos.map(() => true);
            }


            this.carregando = false;
          },
          error: () => {
            this.carregando = false;
            this.router.navigate(['/admin/veiculo']);
          }
        });
      } else {
        // Modo CADASTRO: salva valores originais (formulário vazio) e monitora mudanças
        this.salvarValoresOriginais();
        this.monitorarMudancasFormulario();
      }
    });
  }
  carregarMarcas(): void {
    this.veiculoService.getAllMarcas().subscribe({
      next: (marcas) => {
        this.marcasDisponiveis = marcas.sort((a, b) => a.nome.localeCompare(b.nome));
      },
      error: () => {
        this.marcasDisponiveis = [];
      }
    });
  }

  carregarModelos(marcaId?: number): void {
    this.veiculoService.getModelos(marcaId).subscribe({
      next: (modelos) => {
        this.modelosDisponiveis = modelos;
      },
      error: () => {
        this.modelosDisponiveis = [];
      }
    });
  }

  salvarValoresOriginais(): void {
    this.valoresOriginais = JSON.stringify(this.veiculoForm.value);
    this.formularioAlterado = false;
  }

  monitorarMudancasFormulario(): void {
    this.veiculoForm.valueChanges.subscribe(() => {
      this.ngZone.run(() => {
        const valoresAtuais = JSON.stringify(this.veiculoForm.value);
        this.formularioAlterado = valoresAtuais !== this.valoresOriginais;
      });
    });
  }

  inicializarFormulario(): void {
    this.veiculoForm = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      ano: [null, [Validators.required, Validators.min(1900)]],
      preco: [null, [Validators.required, Validators.min(1000)]],
      km: [null, Validators.required],
      cor: ['', Validators.required],
      cambio: ['', Validators.required],
      combustivel: ['', Validators.required],
      descricao: ['', Validators.required],
      placa: ['', Validators.required],
      motor: ['', Validators.required],
      emOferta: [false],
      vendido: [false],
      infoVenda: [''],
      urlsFotos: this.fb.array([]), // Inicia vazio
      imagem: [''] // Remove Validators.required
    });
  }

  formatarMoeda(event: any): void {
    let valor = event.target.value;
    // Remove tudo que não for número
    valor = valor.replace(/\D/g, '');
    // Converte para centavos
    valor = (parseInt(valor, 10) / 100).toFixed(2);
    // Formata para moeda
    const valorFormatado = this.currencyPipe.transform(valor, 'BRL', 'symbol', '1.2-2');

    // Remove emitEvent: false para permitir detecção de mudanças
    this.veiculoForm.get('preco')?.setValue(valorFormatado);

    // Força verificação de alteração após formatação
    if (this.isEdicao && this.valoresOriginais) {
      const valoresAtuais = JSON.stringify(this.veiculoForm.value);
      this.formularioAlterado = valoresAtuais !== this.valoresOriginais;
    }
  }

  onSubmit(): void {
    if (this.veiculoForm.valid) {
      const formValue = this.veiculoForm.value;
      // Remove máscara do preço antes de enviar
      let preco = formValue.preco;
      if (typeof preco === 'string') {
        // Remove o símbolo R$ e espaços
        preco = preco.replace(/[R$\s]/g, '');
        // Remove os pontos de milhar (ex: 20.000 -> 20000)
        preco = preco.replace(/\./g, '');
        // Substitui a vírgula decimal por ponto (ex: 20000,00 -> 20000.00)
        preco = preco.replace(',', '.');
        // Converte para número
        preco = parseFloat(preco);

      }
      const veiculo: any = {
        ...formValue,
        marca: formValue.marca, // Já é o ID selecionado no formulário
        modelo: formValue.modelo, // Já é o ID selecionado no formulário
        preco: preco,
        cambio: formValue.cambio ? formValue.cambio.toUpperCase() : undefined,
        combustivel: formValue.combustivel ? formValue.combustivel.toUpperCase() : undefined,
        urlsFotos: this.veiculoFormUrlsFotos.value,
        id: this.isEdicao ? this.veiculoId! : undefined,
        placa: formValue.placa,
        motor: formValue.motor,
        emOferta: formValue.emOferta,
        vendido: formValue.vendido,
        infoVenda: formValue.vendido ? formValue.infoVenda : '' // Envia vazio se não estiver vendido
      };
      this.carregando = true;
      if (this.isEdicao && this.veiculoId) {
        this.adminVeiculoService.editarVeiculo(veiculo).subscribe({
          next: () => {
            this.carregando = false;
            this.snackBar.open('Veículo atualizado com sucesso!', '', {
              duration: 3000,
              panelClass: ['snackbar-success'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.router.navigate(['/admin/home']);
          },
          error: (err) => {
            this.carregando = false;
            const mensagemErro = this.formatarMensagemErro(err);

            setTimeout(() => {
              this.snackBar.open(mensagemErro, '', {
                duration: 7000,
                panelClass: ['snackbar-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            }, 100);
          }
        });
      } else {
        this.adminVeiculoService.cadastrarVeiculo(veiculo).subscribe({
          next: () => {
            this.carregando = false;
            this.snackBar.open('Veículo cadastrado com sucesso!', '', {
              duration: 3000,
              panelClass: ['snackbar-success'],
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this.router.navigate(['/admin/home']);
          },
          error: (err) => {
            this.carregando = false;
            const mensagemErro = this.formatarMensagemErro(err);

            // Garante que o snackbar seja exibido após a detecção de mudanças
            setTimeout(() => {
               this.snackBar.open(mensagemErro, '', {
                duration: 7000,
                panelClass: ['snackbar-error'],
                horizontalPosition: 'center',
                verticalPosition: 'top'
              });
            }, 100);
          }
        });
      }
    } else {
      this.veiculoForm.markAllAsTouched();
    }
  }

  onImagemPrincipalSelecionada(event: any): void {
    const file: File = event.target.files[0];
    if (!file) return;
    this.uploadEmProgresso = true;
    this.adminVeiculoService.uploadImagem(file)
      .subscribe({
        next: (caminhoRelativo: string) => {
          this.veiculoForm.get('imagem')?.setValue(caminhoRelativo);
          this.imagemPrincipalUrl = this.adminVeiculoService.getMiniaturaUrl(caminhoRelativo);
          this.uploadEmProgresso = false;
        },
        error: (err) => {
          const mensagemErro = this.formatarMensagemErro(err) || 'Erro ao fazer upload da imagem.';
          this.snackBar.open(mensagemErro, '', {
            duration: 7000,
            panelClass: ['snackbar-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
          this.uploadEmProgresso = false;
        }
      });
  }

  onFotosSelecionadas(event: any): void {
    this.erroUploadImagem = '';
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    // Verifica limite máximo de imagens
    const imagensAtuais = this.veiculoFormUrlsFotos.length;
    if (imagensAtuais >= this.maxImagens) {
      this.erroUploadImagem = `Limite máximo de ${this.maxImagens} imagens atingido.`;
      event.target.value = '';
      return;
    }
    if (imagensAtuais + files.length > this.maxImagens) {
      this.erroUploadImagem = `Você só pode adicionar mais ${this.maxImagens - imagensAtuais} imagem(ns).`;
      event.target.value = '';
      return;
    }

    // Verifica tamanho de cada imagem
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file.size > this.maxTamanhoImagemMB * 1024 * 1024) {
        this.erroUploadImagem = `A imagem "${file.name}" excede o tamanho máximo de ${this.maxTamanhoImagemMB}MB.`;
        event.target.value = '';
        return;
      }
    }

    this.uploadsPendentes += files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      this.adminVeiculoService.uploadImagem(file).subscribe({
        next: (caminhoRelativo: string) => {

          // Adiciona a nova imagem ao FormArray
          this.veiculoFormUrlsFotos.push(this.fb.control(caminhoRelativo));

          // Atualiza array de visibilidade
          this.imagemVisivel.push(true);

          // Marca como touched
          this.veiculoForm.get('urlsFotos')?.markAsTouched();

          // Decrementa contador (garantindo que nunca fique negativo)
          this.uploadsPendentes = Math.max(0, this.uploadsPendentes - 1);


          // Força detecção de mudanças de forma assíncrona para evitar NG0100
          setTimeout(() => {
            this.veiculoForm.updateValueAndValidity();
            this.cdr.detectChanges();
          }, 0);
        },
        error: (err) => {
          // Decrementa contador (garantindo que nunca fique negativo)
          this.uploadsPendentes = Math.max(0, this.uploadsPendentes - 1);
          const mensagemErro = this.formatarMensagemErro(err) || 'Erro ao fazer upload da imagem. Tente novamente.';
          this.erroUploadImagem = mensagemErro;

          // Exibe também um snackbar para garantir que o usuário veja o erro
          this.snackBar.open(mensagemErro, '', {
            duration: 7000,
            panelClass: ['snackbar-error'],
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });

          // Reseta estado do upload
          this.resetarEstadoUpload();

          // Timeout para esconder mensagem de erro automaticamente
          setTimeout(() => {
            this.erroUploadImagem = '';
            this.cdr.detectChanges();
          }, 7000);

          // Força detecção de mudanças para atualizar a UI
          setTimeout(() => {
            this.cdr.detectChanges();
          }, 0);
        }
      });
    }

    // Limpa o input para permitir selecionar as mesmas imagens novamente
    event.target.value = '';
  }

  removerFotoAdicional(index: number): void {

    this.veiculoFormUrlsFotos.removeAt(index);
    this.imagemVisivel.splice(index, 1);
    this.veiculoForm.get('urlsFotos')?.markAsTouched();


    // Força detecção de mudanças de forma assíncrona para evitar NG0100
    setTimeout(() => {
      this.veiculoForm.updateValueAndValidity();
      this.cdr.detectChanges();
    }, 0);
  }

  definirComoPrincipal(index: number): void {
    if (index > 0 && index < this.veiculoFormUrlsFotos.length) {
      // Pega o controle da imagem selecionada
      const imagemSelecionada = this.veiculoFormUrlsFotos.at(index);

      // Remove da posição atual
      this.veiculoFormUrlsFotos.removeAt(index);

      // Insere na primeira posição
      this.veiculoFormUrlsFotos.insert(0, imagemSelecionada);

      this.veiculoForm.get('urlsFotos')?.markAsTouched();
    }
  }

  voltarParaAdmin(): void {
    this.router.navigate(['/admin/home']);
  }

  private formatarMensagemErro(err: any): string {
    // Verifica se é um erro de validação com múltiplos campos
    if (err?.error?.errors && Array.isArray(err.error.errors)) {
      const erros = err.error.errors.map((e: any) => `${e.field}: ${e.message}`).join('; ');
      return `Erro de validação: ${erros}`;
    }

    // Verifica se tem uma mensagem de erro simples no formato {"error": "mensagem"}
    if (err?.error?.error) {
      return err.error.error;
    }

    // Verifica se tem message no error
    if (err?.error?.message) {
      return err.error.message;
    }

    // Verifica se error é uma string diretamente
    if (typeof err?.error === 'string') {
      return err.error;
    }

    // Fallback para err.message
    if (err?.message) {
      return err.message;
    }

    // Verifica status HTTP
    if (err?.status) {
      switch (err.status) {
        case 400:
          return 'Requisição inválida. Verifique os dados enviados.';
        case 401:
          return 'Não autorizado. Faça login novamente.';
        case 403:
          return 'Acesso negado.';
        case 404:
          return 'Recurso não encontrado.';
        case 500:
          return 'Erro interno do servidor. Tente novamente mais tarde.';
        default:
          return `Erro ${err.status}: ${err.statusText || 'Erro desconhecido'}`;
      }
    }

    return 'Erro desconhecido';
  }

  getMiniaturaUrl(path: string): string {
    return this.adminVeiculoService.getMiniaturaUrl(path);
  }

  abrirImagemExpandida(url: string): void {
    this.imagemExpandidaUrl = url;
    this.dialog.open(this.imagemExpandidaTemplate, {
      data: url,
      panelClass: 'imagem-expandida-dialog-panel',
      maxWidth: '95vw',
      maxHeight: '95vh'
    });
  }

  removerImagemPrincipal(): void {
    const urlsFotos = this.veiculoForm.get('urlsFotos')?.value || [];
    if (urlsFotos.length > 0) {
      urlsFotos.splice(0, 1);
      this.veiculoForm.get('urlsFotos')?.setValue([...urlsFotos]);
      this.veiculoForm.get('urlsFotos')?.markAsTouched();
      // Atualiza a miniatura principal
      if (urlsFotos.length > 0) {
        this.imagemPrincipalUrl = this.adminVeiculoService.getMiniaturaUrl(urlsFotos[0]);
      } else {
        this.imagemPrincipalUrl = null;
      }
    }
  }

  resetarEstadoUpload(): void {
    this.erroUploadImagem = '';
    this.uploadsPendentes = 0;
    this.cdr.detectChanges();
  }

  onImagemErro(index: number): void {
    this.imagemVisivel[index] = false;
  }
}
