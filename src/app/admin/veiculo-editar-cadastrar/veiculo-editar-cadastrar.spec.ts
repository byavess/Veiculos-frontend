import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VeiculoEditarCadastrarComponent } from './veiculo-editar-cadastrar';

describe('VeiculoForm', () => {
  let component: VeiculoEditarCadastrarComponent;
  let fixture: ComponentFixture<VeiculoEditarCadastrarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VeiculoEditarCadastrarComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(VeiculoEditarCadastrarComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
