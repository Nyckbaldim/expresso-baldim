import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { environment } from '../../environments/environment';
import { PedidoService } from './pedido';

describe('PedidoService', () => {
  let servico: PedidoService;
  let requisicoes: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    servico = TestBed.inject(PedidoService);
    requisicoes = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    sessionStorage.removeItem('eb_admin_email');
    requisicoes.verify();
  });

  it('consulta a coleção do JSON Server e filtra os resultados', () => {
    let resultado: unknown;
    servico
      .consultar({ pagina: 1, tamanho: 1, status: 'recebido', busca: 'maria' })
      .subscribe((pagina) => (resultado = pagina));

    const requisicao = requisicoes.expectOne(`${environment.apiUrl}/pedidos?_sort=-criadoEm`);
    expect(requisicao.request.method).toBe('GET');
    requisicao.flush([
      {
        id: 'pedido-1',
        codigo: 'EB-ABC12',
        tipo: 'frete',
        status: 'recebido',
        criadoEm: '2026-11-21T12:00:00.000Z',
        contato: { nome: 'Maria Souza', whatsapp: '31999999999', email: 'maria@example.com' },
        origem: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: 'Belo Horizonte', uf: 'MG' },
        destino: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: 'Contagem', uf: 'MG' },
        planejamento: { data: '', vistoria: false, observacoes: '' },
        fotos: [],
      },
      {
        id: 'pedido-2',
        codigo: 'EB-DEF34',
        tipo: 'frete',
        status: 'concluido',
        criadoEm: '2026-11-20T12:00:00.000Z',
        contato: { nome: 'João Silva', whatsapp: '31999999999', email: 'joao@example.com' },
        origem: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: 'Belo Horizonte', uf: 'MG' },
        destino: { cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: 'Contagem', uf: 'MG' },
        planejamento: { data: '', vistoria: false, observacoes: '' },
        fotos: [],
      },
    ]);

    expect(resultado).toEqual({
      itens: [
        expect.objectContaining({ id: 'pedido-1', codigo: 'EB-ABC12' }),
      ],
      total: 1,
    });
  });

  it('atualiza o status e registra a data da alteração', () => {
    sessionStorage.setItem('eb_admin_email', 'admin@expressobaldim.com');
    servico.atualizarStatus('pedido-1', 'orcamento_enviado').subscribe();

    const requisicao = requisicoes.expectOne(`${environment.apiUrl}/pedidos/pedido-1`);
    expect(requisicao.request.method).toBe('PATCH');
    expect(requisicao.request.body.status).toBe('orcamento_enviado');
    expect(requisicao.request.body.atualizadoEm).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    expect(requisicao.request.body.atualizadoPor).toBe('admin@expressobaldim.com');
    requisicao.flush({
      id: 'pedido-1',
      codigo: 'EB-ABC12',
      status: 'orcamento_enviado',
      atualizadoEm: requisicao.request.body.atualizadoEm,
    });
  });
});
