import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { VeiculoService, Veiculo } from '../../veiculo.service';

@Component({
  selector: 'app-veiculo-form',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="container">
      <button [routerLink]="['/public/home']" class="back-btn">← Voltar para Loja</button>
      
      <div class="form-container">
        <h1>{{ isEdicao ? 'Editar Veículo' : 'Cadastrar Novo Veículo' }}</h1>
        
        <form [formGroup]="veiculoForm" (ngSubmit)="onSubmit()" class="vehicle-form">
          <div class="form-group">
            <label>Marca *</label>
            <input type="text" formControlName="marca" class="form-input">
            <div *ngIf="veiculoForm.get('marca')?.invalid && veiculoForm.get('marca')?.touched" class="error">
              Marca é obrigatória
            </div>
          </div>

          <div class="form-group">
            <label>Modelo *</label>
            <input type="text" formControlName="modelo" class="form-input">
            <div *ngIf="veiculoForm.get('modelo')?.invalid && veiculoForm.get('modelo')?.touched" class="error">
              Modelo é obrigatório
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Ano *</label>
              <input type="number" formControlName="ano" class="form-input">
              <div *ngIf="veiculoForm.get('ano')?.invalid && veiculoForm.get('ano')?.touched" class="error">
                Ano deve ser maior que 1900
              </div>
            </div>

            <div class="form-group">
              <label>Preço *</label>
              <input type="number" formControlName="preco" class="form-input">
              <div *ngIf="veiculoForm.get('preco')?.invalid && veiculoForm.get('preco')?.touched" class="error">
                Preço deve ser maior que 1000
              </div>
            </div>
          </div>

          <div class="form-group">
            <label>Cor</label>
            <input type="text" formControlName="cor" class="form-input">
          </div>

          <div class="form-group">
            <label>Descrição</label>
            <textarea formControlName="descricao" class="form-textarea" rows="4"></textarea>
          </div>

          <div class="form-group">
            <label>URL da Imagem *</label>
            <input type="text" formControlName="imagem" class="form-input">
            <div *ngIf="veiculoForm.get('imagem')?.invalid && veiculoForm.get('imagem')?.touched" class="error">
              URL da imagem é obrigatória
            </div>
          </div>

          <div class="form-actions">
            <button type="submit" class="submit-btn" [disabled]="veiculoForm.invalid">
              {{ isEdicao ? 'Atualizar Veículo' : 'Cadastrar Veículo' }}
            </button>
            <button type="button" class="cancel-btn" [routerLink]="['/public/home']">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 0 auto; padding: 20px; }
    .back-btn { 
      background: none; 
      border: 1px solid #ddd; 
      padding: 8px 15px; 
      border-radius: 5px; 
      cursor: pointer;
      margin-bottom: 20px;
    }
    
    .form-container {
      background: white;
      padding: 30px;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    
    .form-container h1 {
      color: #2c3e50;
      margin-bottom: 30px;
      text-align: center;
    }
    
    .vehicle-form {
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .form-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .form-group {
      display: flex;
      flex-direction: column;
    }
    
    .form-group label {
      margin-bottom: 5px;
      font-weight: bold;
      color: #34495e;
    }
    
    .form-input, .form-textarea {
      padding: 10px;
      border: 2px solid #ddd;
      border-radius: 5px;
      font-size: 16px;
    }
    
    .form-input:focus, .form-textarea:focus {
      border-color: #3498db;
      outline: none;
    }
    
    .form-textarea {
      resize: vertical;
    }
    
    .error {
      color: #e74c3c;
      font-size: 14px;
      margin-top: 5px;
    }
    
    .form-actions {
      display: flex;
      gap: 15px;
      margin-top: 30px;
    }
    
    .submit-btn {
      background: #27ae60;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      flex: 1;
    }
    
    .submit-btn:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
    
    .submit-btn:hover:not(:disabled) {
      background: #219a52;
    }
    
    .cancel-btn {
      background: #e74c3c;
      color: white;
      border: none;
      padding: 12px 30px;
      border-radius: 5px;
      font-size: 16px;
      cursor: pointer;
      flex: 1;
    }
    
    .cancel-btn:hover {
      background: #c0392b;
    }

    @media (max-width: 768px) {
      .form-row {
        grid-template-columns: 1fr;
      }
      
      .form-actions {
        flex-direction: column;
      }
    }
  `]
})
export class VeiculoFormComponent implements OnInit {
  veiculoForm!: FormGroup;
  isEdicao: boolean = false;
  veiculoId: number | null = null;

  // ✅ Usando inject() para injeção de dependências
  private fb = inject(FormBuilder);
  private veiculoService = inject(VeiculoService);
  private router = inject(Router);

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
}