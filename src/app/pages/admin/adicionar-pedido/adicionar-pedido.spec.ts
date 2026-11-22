import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { environment } from '../../../../environments/environment';
import { AdicionarPedido } from './adicionar-pedido';

describe('AdicionarPedido', () => {
  let componente: AdicionarPedido;
  let fixture: ComponentFixture<AdicionarPedido>;
  let requisicoes: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdicionarPedido],
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(AdicionarPedido);
    componente = fixture.componentInstance;
    requisicoes = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.removeItem('eb_admin_email');
    requisicoes.verify();
  });

  it('deve criar', () => {
    expect(componente).toBeTruthy();
  });

  it('cria um frete com os campos preenchidos e registra o administrador', async () => {
    sessionStorage.setItem('eb_admin_email', 'admin@expressobaldim.com');

    componente.form.controls.codigo.setValue('EB-MANUAL');
    componente.form.controls.tipo.setValue('frete');
    componente.form.controls.status.setValue('orcamento_enviado');
    componente.form.controls.contato.patchValue({
      nome: 'Cliente Manual',
      whatsapp: '(31) 99999-9999',
      email: 'cliente@example.com',
    });
    componente.form.controls.origem.patchValue({
      cep: '30110-000',
      rua: 'Afonso Pena',
      numero: '100',
      bairro: 'Centro',
      cidade: 'Belo Horizonte',
      uf: 'MG',
    });
    componente.form.controls.destino.patchValue({
      cep: '32010-000',
      rua: 'João César',
      numero: '200',
      bairro: 'Centro',
      cidade: 'Contagem',
      uf: 'MG',
    });
    componente.form.controls.carga.patchValue({
      tipo: 'Caixas e volumes',
      descricao: 'Carga adicionada pelo administrador',
      peso: 20,
    });
    componente.form.controls.planejamento.patchValue({
      data: '2026-12-01',
      observacoes: 'Coletar pela manhã',
    });

    const promessa = componente.salvar();

    const requisicao = requisicoes.expectOne(`${environment.apiUrl}/pedidos`);
    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual(expect.objectContaining({
      codigo: 'EB-MANUAL',
      tipo: 'frete',
      status: 'orcamento_enviado',
      criadoPor: 'admin@expressobaldim.com',
      atualizadoPor: 'admin@expressobaldim.com',
      contato: expect.objectContaining({ nome: 'Cliente Manual' }),
      carga: expect.objectContaining({
        tipo: 'Caixas e volumes',
        descricao: 'Carga adicionada pelo administrador',
      }),
    }));

    requisicao.flush({
      id: 'manual-1',
      ...requisicao.request.body,
    });
    await promessa;

    expect(componente.sucesso()?.codigo).toBe('EB-MANUAL');
  });

  it('cria uma mudança com móveis opcionais', async () => {
    componente.form.controls.tipo.setValue('mudanca');
    componente.form.controls.mudanca.patchValue({
      moveis: 'Sofá x2\nGeladeira x1',
      volumeM3: 12,
      extras: 'Embalagem,Montagem',
    });

    const promessa = componente.salvar();
    const requisicao = requisicoes.expectOne(`${environment.apiUrl}/pedidos`);

    expect(requisicao.request.body.mudanca).toEqual({
      moveis: [
        { id: 'movel-1', nome: 'Sofá', quantidade: 2 },
        { id: 'movel-2', nome: 'Geladeira', quantidade: 1 },
      ],
      volumeM3: 12,
      extras: ['Embalagem', 'Montagem'],
    });

    requisicao.flush({
      id: 'manual-2',
      ...requisicao.request.body,
    });
    await promessa;

    expect(componente.sucesso()).not.toBeNull();
  });
});
