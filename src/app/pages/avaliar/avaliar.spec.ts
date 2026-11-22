import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { Avaliar } from './avaliar';

describe('Avaliar', () => {
  let component: Avaliar;
  let fixture: ComponentFixture<Avaliar>;
  let requisicoes: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avaliar],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(Avaliar);
    component = fixture.componentInstance;
    requisicoes = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => requisicoes.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('limpa os campos após enviar uma avaliação', () => {
    component.form.setValue({
      tipo: 'google',
      codigo: 'EB-TESTE1',
      nota: '5',
      motivo: '',
      comentario: '',
    });

    component.enviar();

    requisicoes.expectOne(`${environment.apiUrl}/pedidos?codigo=EB-TESTE1`).flush([{
      id: 'pedido-1',
      codigo: 'EB-TESTE1',
    }]);
    requisicoes.expectOne(`${environment.apiUrl}/avaliacoes`).flush({
      id: 'avaliacao-1',
    });

    fixture.detectChanges();
    expect(component.enviado()).toBe(true);
    expect(component.form.getRawValue()).toEqual({
      tipo: '',
      codigo: '',
      nota: '',
      motivo: '',
      comentario: '',
    });
  });
});
