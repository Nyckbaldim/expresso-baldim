import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { DepoimentoService } from './depoimento';

describe('DepoimentoService', () => {
  let servico: DepoimentoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    servico = TestBed.inject(DepoimentoService);
  });

  it('é criado', () => {
    expect(servico).toBeTruthy();
  });
});
