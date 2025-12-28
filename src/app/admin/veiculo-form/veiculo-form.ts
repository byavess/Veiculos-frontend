import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators, FormArray, FormControl} from '@angular/forms';
import {Router, ActivatedRoute} from '@angular/router';
import {VeiculoService} from '../../veiculo.service';
import {IVeiculo} from '../../interfaces/IVeiculo';
import {AdminVeiculoService} from '../veiculo/admin-veiculo.service';

@Component({
  selector: 'app-veiculo-form',
  standalone: false,
  templateUrl: './veiculo-form.html',
  styleUrls: ['./veiculo-form.css']
})
export class VeiculoFormComponent implements OnInit {
  veiculoForm!: FormGroup;
  isEdicao: boolean = false;
  veiculoId: number | null = null;
  carregando: boolean = false;

  constructor(
    private fb: FormBuilder,
    private veiculoService: VeiculoService,
    private adminVeiculoService: AdminVeiculoService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  marcasDisponiveis: string[] = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru'];

  get veiculoFormUrlsFotos(): FormArray {
    return this.veiculoForm.get('urlsFotos') as FormArray;
  }

  ngOnInit(): void {
    this.inicializarFormulario();
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEdicao = true;
        this.veiculoId = +id;
        this.carregando = true;
        this.veiculoService.getVeiculoById(this.veiculoId).subscribe({
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
              imagem: veiculo.imagem
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
      urlsFotos: this.fb.array([
        this.fb.control('', Validators.required)
      ]),
      imagem: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.veiculoForm.valid) {
      const formValue = this.veiculoForm.value;
      const veiculo: IVeiculo = {
        ...formValue,
        urlsFotos: this.veiculoFormUrlsFotos.value,
        id: this.isEdicao ? this.veiculoId! : undefined
      };
      this.carregando = true;
      if (this.isEdicao && this.veiculoId) {
        this.adminVeiculoService.editarVeiculo(veiculo).subscribe({
          next: () => {
            this.carregando = false;
            this.router.navigate(['/admin/veiculo']);
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
            this.router.navigate(['/admin/veiculo']);
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
}
