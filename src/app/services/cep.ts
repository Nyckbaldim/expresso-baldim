import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export interface RespostaCep {
  logradouro: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean | string;
}

@Service()
export class CepService {
  private http = inject(HttpClient);

  buscar(cep: string) {
    return this.http.get<RespostaCep>(`https://viacep.com.br/ws/${cep}/json/`);
  }
}