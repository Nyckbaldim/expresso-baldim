import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../../environments/environment';
import { RastrearPedido } from './rastrear-pedido';

describe('RastrearPedido', () => {
  let componente: RastrearPedido;
  let fixture: ComponentFixture<RastrearPedido>;
  let requisicoes: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RastrearPedido],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(RastrearPedido);
    componente = fixture.componentInstance;
    requisicoes = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => requisicoes.verify());

  it('exibe o status atual do pedido consultado', () => {
    componente.formulario.controls.codigo.setValue('EB-TESTE1');
    componente.consultar();

    const requisicao = requisicoes.expectOne(`${environment.apiUrl}/pedidos?codigo=EB-TESTE1`);
    requisicao.flush([
      {
        id: 'pedido-teste',
        codigo: 'EB-TESTE1',
        tipo: 'frete',
        status: 'em_analise',
        criadoEm: '2026-11-21T12:00:00.000Z',
        contato: { nome: 'Pessoa Teste', whatsapp: '31999999999', email: 'teste@example.com' },
        origem: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: 'Belo Horizonte', uf: 'MG' },
        destino: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: 'Contagem', uf: 'MG' },
        planejamento: { data: '', vistoria: false, observacoes: '' },
        fotos: [],
      },
    ]);

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Em análise');
  });

  it('informa quando o código não corresponde a nenhum pedido', () => {
    componente.formulario.controls.codigo.setValue('EB-NAOEXISTE');
    componente.consultar();

    requisicoes.expectOne(`${environment.apiUrl}/pedidos?codigo=EB-NAOEXISTE`).flush([]);

    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Não encontramos um pedido com esse código');
  });
});
