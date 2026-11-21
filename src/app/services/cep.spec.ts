import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { CepService } from './cep';

describe('CepService', () => {
  let servico: CepService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    servico = TestBed.inject(CepService);
  });

  it('é criado', () => {
    expect(servico).toBeTruthy();
  });
});
