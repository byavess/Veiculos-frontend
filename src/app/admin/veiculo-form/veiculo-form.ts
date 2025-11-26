// src/app/admin/veiculo-form/veiculo-form.ts - COMPLETO E CORRIGIDO
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router'; 
import { CommonModule } from '@angular/common';

// 🛑 ESSENCIAL: Reactive Forms e FormBuilder
import { 
  FormBuilder, 
  FormGroup, 
  Validators, 
  FormArray, 
  ReactiveFormsModule // Módulo para [formGroup] e [formControlName]
} from '@angular/forms';

// Imports do Material para o template
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon'; 
import { MatDividerModule } from '@angular/material/divider'; // Para mat-divider
import { MatSelectModule } from '@angular/material/select'; // Para mat-select e mat-option

// Importa o serviço (verifique o caminho, pode ser '../../veiculo.service' dependendo de onde está)
import { VeiculoService, Veiculo } from '../../veiculo.service';

@Component({
  selector: 'app-veiculo-form',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, // 🛑 RESOLVE NG8002: [formGroup]
    MatCardModule, 
    MatFormFieldModule, 
    MatInputModule, 
    MatButtonModule,
    MatIconModule,
    MatDividerModule, // 🛑 RESOLVE NG8001: mat-divider
    MatSelectModule // 🛑 RESOLVE NG8001: mat-option e mat-select
  ],
  templateUrl: './veiculo-form.html', 
  styleUrls: ['./veiculo-form.css']
})
export class VeiculoFormComponent implements OnInit {
  
  // 🛑 PROPRIEDADES FALTANTES (RESOLVE TS2339)
  veiculoForm!: FormGroup; // ! para indicar que será inicializado no ngOnInit
  isEdicao: boolean = false; 
  veiculoId: number | null = null;
  
  // Lista de marcas para o <mat-select>
  marcasDisponiveis = ['Chevrolet', 'Ford', 'Fiat', 'Honda', 'Toyota', 'Volkswagen'];

  // 🛑 GETTER PARA ACESSAR FormArray (RESOLVE urlsFotos.controls)
  get urlsFotos(): FormArray {
    return this.veiculoForm.get('urlsFotos') as FormArray;
  }

  constructor(
    private fb: FormBuilder, // Injeção do FormBuilder
    private veiculoService: VeiculoService, 
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Lógica para inicializar e carregar dados em caso de edição
    this.veiculoId = Number(this.route.snapshot.paramMap.get('id'));
    this.isEdicao = !!this.veiculoId && !isNaN(this.veiculoId);
    this.inicializarFormulario();
    if (this.isEdicao) {
      this.carregarVeiculoParaEdicao(this.veiculoId as number);
    }
  }

  inicializarFormulario(): void {
    this.veiculoForm = this.fb.group({
      marca: ['', Validators.required],
      modelo: ['', Validators.required],
      ano: [null, [Validators.required, Validators.min(1900)]],
      preco: [null, [Validators.required, Validators.min(1000)]],
      quilometragem: [null, [Validators.required, Validators.min(0)]],
      descricao: [''],
      urlsFotos: this.fb.array([this.fb.control('', Validators.required)])
    });
  }

  carregarVeiculoParaEdicao(id: number): void {
    // Lógica de carregamento de veículo aqui
  }

  // 🛑 MÉTODOS FALTANTES (RESOLVE TS2339)
  adicionarCampoFoto(): void {
    this.urlsFotos.push(this.fb.control('', Validators.required));
  }

  removerCampoFoto(index: number): void {
    if (this.urlsFotos.length > 1) {
      this.urlsFotos.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.veiculoForm.valid) {
      // Lógica de envio
    }
  }
}