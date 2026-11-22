import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { EditarPedido } from './editar-pedido';

describe('EditarPedido', () => {
  let fixture: ComponentFixture<EditarPedido>;
  let componente: EditarPedido;
  let requisicoes: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditarPedido],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: { snapshot: { paramMap: convertToParamMap({ codigo: 'EB-4F7K2' }) } },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(EditarPedido);
    componente = fixture.componentInstance;
    requisicoes = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    requisicoes.expectOne(`${environment.apiUrl}/pedidos?codigo=EB-4F7K2`).flush([{
      id: '1',
      codigo: 'EB-4F7K2',
      tipo: 'frete',
      status: 'recebido',
      criadoEm: '2026-11-17T14:00:00.000Z',
      observacoesAdmin: 'Ligar antes da coleta',
      contato: { nome: 'Ana Souza', whatsapp: '(31) 99999-9999', email: 'ana@example.com' },
      origem: { cep: '30110-000', rua: 'Afonso Pena', numero: '100', complemento: '', bairro: 'Centro', cidade: 'BH', uf: 'MG' },
      destino: { cep: '32010-000', rua: 'João César', numero: '200', complemento: '', bairro: 'Centro', cidade: 'Contagem', uf: 'MG' },
      planejamento: { data: '2026-12-01', vistoria: false, observacoes: '' },
      fotos: [],
    }]);
    fixture.detectChanges();
  });

  afterEach(() => requisicoes.verify());

  it('abre preenchido e separado entre status e dados', () => {
    expect(componente.pedido()?.codigo).toBe('EB-4F7K2');
    expect(componente.aba()).toBe('status');
    expect(componente.form.controls.observacoesAdmin.value).toBe('Ligar antes da coleta');
  });
});
