import {Component, inject, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {Veiculo, VeiculoService} from '../../veiculo.service';

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

  // ✅ Usando inject() para injeção de dependências
  private fb = inject(FormBuilder);
  private veiculoService = inject(VeiculoService);
  private router = inject(Router);
  urlsFotos: string[] = [];
  marcasDisponiveis: string[] = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'Volkswagen', 'Nissan', 'Hyundai', 'Kia', 'Mazda', 'Subaru'];

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.veiculoForm = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      ano: [null, [Validators.required, Validators.min(1900)]],
      preco: [null, [Validators.required, Validators.min(1000)]],
      cor: [''],
      descricao: [''],
      imagem: ['', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.veiculoForm.valid) {
      const veiculo: Veiculo = this.veiculoForm.value;

      if (this.isEdicao && this.veiculoId) {
        // Edição

      } else {
        // Criação

      }
    } else {
      alert('Funcionalidade de cadastrar será implementada depois');
      this.router.navigate(['/public/home']);
    }
  }

  adicionarCampoFoto() {
    console.log("Adicionar campo foto");
  }

  removerCampoFoto(i: number) {
    console.log("Remover campo foto", i);
  }
}
