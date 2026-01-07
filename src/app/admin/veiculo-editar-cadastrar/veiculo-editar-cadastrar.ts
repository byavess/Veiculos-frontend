import {Component, OnInit, ViewChild, TemplateRef, ChangeDetectorRef} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {VeiculoService} from '../../veiculo.service';
import {IVeiculo} from '../../interfaces/IVeiculo';
import {AdminVeiculoService} from '../veiculo/admin-veiculo.service';
import { CurrencyPipe } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';

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

  marcasDisponiveis: string[] = [];

  modelosDisponiveis: string[] = [];

  imagemPrincipalUrl: string | null = null;
  uploadEmProgresso: boolean = false;
  @ViewChild('imagemExpandida') imagemExpandidaTemplate!: TemplateRef<any>;
  imagemExpandidaUrl: string | null = null;

  imagemVisivel: boolean[] = [];
  uploadsPendentes: number = 0;

  constructor(
    private fb: FormBuilder,
    private veiculoService: VeiculoService,
    private adminVeiculoService: AdminVeiculoService,
    private router: Router,
    private route: ActivatedRoute,
    private currencyPipe: CurrencyPipe,
    private dialog: MatDialog,
    private cdr: ChangeDetectorRef
  ) {}



  get veiculoFormUrlsFotos(): FormArray {
    return this.veiculoForm.get('urlsFotos') as FormArray;
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.carregarMarcas();
    this.carregarModelos();

    // Atualiza modelos ao trocar a marca
    this.veiculoForm.get('marca')?.valueChanges.subscribe((novaMarca: string) => {
      this.carregarModelos(novaMarca);
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
            this.veiculoForm.patchValue({
              marca: veiculo.marca,
              modelo: veiculo.modelo,
              ano: veiculo.ano,
              preco: veiculo.preco,
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
            // Exibe a miniatura principal a partir da primeira imagem de urlsFotos
            if (veiculo.urlsFotos && veiculo.urlsFotos.length > 0 && typeof veiculo.urlsFotos[0] === 'string') {
              this.imagemPrincipalUrl = this.adminVeiculoService.getMiniaturaUrl(veiculo.urlsFotos[0]);
            } else {
              this.imagemPrincipalUrl = null;
            }
            this.veiculoForm.setControl('urlsFotos', this.fb.array([]));
            if (veiculo.urlsFotos && veiculo.urlsFotos.length > 0) {
              veiculo.urlsFotos.forEach(url => {
                this.veiculoFormUrlsFotos.push(this.fb.control(url, Validators.required));
              });
              this.imagemVisivel = veiculo.urlsFotos.map(() => true);
            } else {
              this.veiculoFormUrlsFotos.push(this.fb.control('', Validators.required));
              this.imagemVisivel = [true];
            }
            this.carregando = false;
          },
          error: () => {
            this.carregando = false;
            this.router.navigate(['/admin/veiculo']);
          }
        });
      }
    });
  }
  carregarMarcas(): void {
    this.veiculoService.getAllMarcas().subscribe({
      next: (marcas) => {
        this.marcasDisponiveis = marcas.sort();
      },
      error: () => {
        this.marcasDisponiveis = [];
      }
    });
  }

  carregarModelos(marca?: string): void {
    this.veiculoService.getModelos(marca).subscribe({
      next: (modelos) => {
        this.modelosDisponiveis = modelos;
      },
      error: () => {
        this.modelosDisponiveis = [];
      }
    });
  }

  inicializarFormulario(): void {
    this.veiculoForm = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      ano: [null, [Validators.required, Validators.min(1900)]],
      preco: [null, [Validators.required, Validators.min(1000)]],
      km: [null],
      cor: [''],
      cambio: [''],
      combustivel: [''],
      descricao: [''],
      placa: ['', Validators.required],
      motor: [''],
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
    this.veiculoForm.get('preco')?.setValue(valorFormatado, { emitEvent: false });
  }

  onSubmit(): void {
    if (this.veiculoForm.valid) {
      const formValue = this.veiculoForm.value;
      // Remove máscara do preço antes de enviar
      let preco = formValue.preco;
      if (typeof preco === 'string') {
        preco = preco.replace(/[^\d,.-]/g, '').replace(',', '.');
        preco = parseFloat(preco);
      }
      const veiculo: IVeiculo = {
        ...formValue,
        preco: preco,
        cambio: formValue.cambio ? formValue.cambio.toUpperCase() : undefined,
        combustivel: formValue.combustivel ? formValue.combustivel.toUpperCase() : undefined,
        urlsFotos: this.veiculoFormUrlsFotos.value,
        id: this.isEdicao ? this.veiculoId! : undefined,
        placa: formValue.placa,
        motor: formValue.motor,
        emOferta: formValue.emOferta,
        vendido: formValue.vendido // Garantir envio
      };
      this.carregando = true;
      if (this.isEdicao && this.veiculoId) {
        this.adminVeiculoService.editarVeiculo(veiculo).subscribe({
          next: () => {
            this.carregando = false;
            this.router.navigate(['/admin/home']);
          },
          error: () => {
            this.carregando = false;
            alert('Erro ao atualizar veículo!');
          }
        });
      } else {
        this.adminVeiculoService.cadastrarVeiculo(veiculo).subscribe({
          next: () => {
            this.carregando = false;
            this.router.navigate(['/admin/home']);
          },
          error: () => {
            this.carregando = false;
            alert('Erro ao cadastrar veículo!');
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
        error: () => {
          alert('Erro ao fazer upload da imagem.');
          this.uploadEmProgresso = false;
        }
      });
  }

  onFotosSelecionadas(event: any): void {
    const files: FileList = event.target.files;
    if (!files || files.length === 0) return;

    console.log('📁 Arquivos selecionados:', files.length);
    console.log('📊 Estado antes do upload:');
    console.log('  - Imagens atuais:', this.veiculoFormUrlsFotos.length);
    console.log('  - Uploads pendentes:', this.uploadsPendentes);

    this.uploadsPendentes += files.length;

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      console.log(`🔄 Iniciando upload ${i + 1}/${files.length}:`, file.name);

      this.adminVeiculoService.uploadImagem(file).subscribe({
        next: (caminhoRelativo: string) => {
          console.log('✅ Upload concluído:', caminhoRelativo);
          console.log('📊 Estado antes de adicionar ao FormArray:');
          console.log('  - Tamanho do FormArray:', this.veiculoFormUrlsFotos.length);

          // Adiciona a nova imagem ao FormArray
          this.veiculoFormUrlsFotos.push(this.fb.control(caminhoRelativo, Validators.required));

          console.log('📊 Estado depois de adicionar ao FormArray:');
          console.log('  - Tamanho do FormArray:', this.veiculoFormUrlsFotos.length);
          console.log('  - Valor do controle adicionado:', caminhoRelativo);
          console.log('  - Todos os valores:', this.veiculoFormUrlsFotos.value);

          // Atualiza array de visibilidade
          this.imagemVisivel.push(true);

          // Marca como touched
          this.veiculoForm.get('urlsFotos')?.markAsTouched();

          // Decrementa contador
          this.uploadsPendentes--;

          console.log('📊 Uploads pendentes restantes:', this.uploadsPendentes);
          console.log('📸 Total de imagens no FormArray:', this.veiculoFormUrlsFotos.length);

          // Força detecção de mudanças de forma assíncrona para evitar NG0100
          setTimeout(() => {
            this.veiculoForm.updateValueAndValidity();
            this.cdr.detectChanges();
            console.log('🔄 Change detection forçada (async)');
          }, 0);
        },
        error: (err) => {
          console.error('❌ Erro no upload:', err);
          this.uploadsPendentes--;
          alert('Erro ao fazer upload da imagem. Tente novamente.');
        }
      });
    }

    // Limpa o input para permitir selecionar as mesmas imagens novamente
    event.target.value = '';
  }

  removerFotoAdicional(index: number): void {
    console.log('🗑️ Removendo imagem no índice:', index);
    console.log('📊 Estado antes da remoção:');
    console.log('  - Total de imagens:', this.veiculoFormUrlsFotos.length);
    console.log('  - Valor a remover:', this.veiculoFormUrlsFotos.at(index)?.value);

    this.veiculoFormUrlsFotos.removeAt(index);
    this.imagemVisivel.splice(index, 1);
    this.veiculoForm.get('urlsFotos')?.markAsTouched();

    console.log('📊 Estado após remoção:');
    console.log('  - Total de imagens:', this.veiculoFormUrlsFotos.length);
    console.log('  - Todos os valores:', this.veiculoFormUrlsFotos.value);

    // Força detecção de mudanças de forma assíncrona para evitar NG0100
    setTimeout(() => {
      this.veiculoForm.updateValueAndValidity();
      this.cdr.detectChanges();
      console.log('🔄 Change detection forçada após remoção (async)');
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

  onImagemErro(index: number): void {
    this.imagemVisivel[index] = false;
  }
}
