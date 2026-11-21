import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { environment } from '../../environments/environment';
import { Autenticacao } from './autenticacao';

describe('Autenticacao', () => {
  let servico: Autenticacao;
  let requisicoes: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting(), provideRouter([])],
    });
    servico = TestBed.inject(Autenticacao);
    requisicoes = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    servico.sair(false);
    requisicoes.verify();
  });

  it('autentica gestores consultando o JSON Server pelo e-mail', () => {
    let entrou = false;
    servico.entrar('gestor@example.com', 'senha-teste').subscribe(() => (entrou = true));

    const requisicao = requisicoes.expectOne((req) => req.url === `${environment.apiUrl}/usuarios`);
    expect(requisicao.request.params.get('email')).toBe('gestor@example.com');
    expect(requisicao.request.params.has('senha')).toBe(false);
    requisicao.flush([{ id: '1', email: 'gestor@example.com', senha: 'senha-teste', perfil: 'gestor' }]);

    expect(entrou).toBe(true);
    expect(servico.autenticado()).toBe(true);
  });

  it('recusa senha incorreta', () => {
    let statusErro: number | undefined;
    servico.entrar('gestor@example.com', 'senha-incorreta').subscribe({
      error: (erro: { status?: number }) => (statusErro = erro.status),
    });

    requisicoes
      .expectOne((req) => req.url === `${environment.apiUrl}/usuarios`)
      .flush([{ id: '1', email: 'gestor@example.com', senha: 'senha-teste', perfil: 'gestor' }]);

    expect(statusErro).toBe(401);
    expect(servico.autenticado()).toBe(false);
  });

  it('recusa usuários que não sejam gestores', () => {
    let statusErro: number | undefined;
    servico.entrar('cliente@example.com', 'senha-teste').subscribe({
      error: (erro: { status?: number }) => (statusErro = erro.status),
    });

    requisicoes
      .expectOne((req) => req.url === `${environment.apiUrl}/usuarios`)
      .flush([{ id: '2', email: 'cliente@example.com', senha: 'senha-teste', perfil: 'cliente' }]);

    expect(statusErro).toBe(401);
    expect(servico.autenticado()).toBe(false);
  });
});
