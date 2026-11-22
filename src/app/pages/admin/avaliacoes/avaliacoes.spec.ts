import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';

import { environment } from '../../../../environments/environment';
import { Avaliacoes } from './avaliacoes';

describe('Avaliacoes', () => {
  let fixture: ComponentFixture<Avaliacoes>;
  let requisicoes: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Avaliacoes],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    requisicoes = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(Avaliacoes);
    fixture.detectChanges();
  });

  afterEach(() => requisicoes.verify());

  it('exibe todos os dados de avaliações retornadas pelo servidor', () => {
    const requisicao = requisicoes.expectOne(`${environment.apiUrl}/avaliacoes`);
    requisicao.flush([
      {
        id: 'avaliacao-1',
        pedidoId: 'pedido-1',
        codigo: 'EB-ABC12',
        tipo: 'feedback',
        nota: 2,
        motivo: 'Atraso na coleta ou na entrega',
        comentario: 'O caminhão chegou atrasado.',
        criadoEm: '2026-11-17T14:30:00.000Z',
      },
    ]);

    fixture.detectChanges();
    const texto = fixture.nativeElement.textContent as string;

    expect(texto).toContain('avaliacao-1');
    expect(texto).toContain('pedido-1');
    expect(texto).toContain('EB-ABC12');
    expect(texto).toContain('Feedback reservado');
    expect(texto).toContain('2 de 5');
    expect(texto).toContain('Atraso na coleta ou na entrega');
    expect(texto).toContain('O caminhão chegou atrasado.');
    expect(texto).toContain('17/11/2026');
  });
});
