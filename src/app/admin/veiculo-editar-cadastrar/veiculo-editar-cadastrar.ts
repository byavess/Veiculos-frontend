import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {VeiculoService} from '../../veiculo.service';
import {IVeiculo} from '../../interfaces/IVeiculo';
import {AdminVeiculoService} from '../veiculo/admin-veiculo.service';
import { CurrencyPipe } from '@angular/common';

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

  constructor(
    private fb: FormBuilder,
    private veiculoService: VeiculoService,
    private adminVeiculoService: AdminVeiculoService,
    private router: Router,
    private route: ActivatedRoute,
    private currencyPipe: CurrencyPipe
  ) {}

  marcasDisponiveis: string[] = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru'];

  get veiculoFormUrlsFotos(): FormArray {
    return this.veiculoForm.get('urlsFotos') as FormArray;
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.veiculoForm?.get('vendido')?.valueChanges.subscribe((vendido: boolean) => {
      if (vendido) {
        this.veiculoForm.get('emOferta')?.setValue(false, { emitEvent: false });
        this.veiculoForm.get('infoVenda')?.setValidators([Validators.required]);
      } else {
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
              infoVenda: veiculo.infoVenda // garante exibição no textarea
            });
            this.veiculoForm.setControl('urlsFotos', this.fb.array([]));
            if (veiculo.urlsFotos && veiculo.urlsFotos.length > 0) {
              veiculo.urlsFotos.forEach(url => {
                this.veiculoFormUrlsFotos.push(this.fb.control(url, Validators.required));
              });
            } else {
              this.veiculoFormUrlsFotos.push(this.fb.control('', Validators.required));
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
      urlsFotos: this.fb.array([
        this.fb.control('', Validators.required)
      ]),
      imagem: ['', Validators.required]
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

  adicionarCampoFoto() {
    this.veiculoFormUrlsFotos.push(new FormControl('', Validators.required));
  }

  removerCampoFoto(i: number) {
    if (this.veiculoFormUrlsFotos.length > 1) {
      this.veiculoFormUrlsFotos.removeAt(i);
    }
  }

  voltarParaAdmin(): void {
    this.router.navigate(['/admin/home']);
  }
}
