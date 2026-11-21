import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EtiquetaStatus } from './etiqueta-status';

describe('EtiquetaStatus', () => {
  let componente: EtiquetaStatus;
  let fixture: ComponentFixture<EtiquetaStatus>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EtiquetaStatus],
    }).compileComponents();

    fixture = TestBed.createComponent(EtiquetaStatus);
    fixture.componentRef.setInput('status', 'recebido');
    componente = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('deve ser criada', () => {
    expect(componente).toBeTruthy();
  });
});
