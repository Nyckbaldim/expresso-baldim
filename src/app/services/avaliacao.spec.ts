import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AvaliacaoService } from './avaliacao';

describe('AvaliacaoService', () => {
  let service: AvaliacaoService;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient()] });
    service = TestBed.inject(AvaliacaoService);
  });

  it('é criado', () => {
    expect(service).toBeTruthy();
  });
});
