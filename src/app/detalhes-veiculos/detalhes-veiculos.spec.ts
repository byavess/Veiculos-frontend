import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetalhesVeiculos } from './detalhes-veiculos';

describe('DetalhesVeiculos', () => {
  let component: DetalhesVeiculos;
  let fixture: ComponentFixture<DetalhesVeiculos>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetalhesVeiculos]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DetalhesVeiculos);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
