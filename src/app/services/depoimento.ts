import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Depoimento {
  id: string;
  nome: string;
  nota: number;
  texto: string;
  publicado: boolean;
}

@Service()
export class DepoimentoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/depoimentos`;

  listarPublicados() {
    return this.http.get<Depoimento[]>(`${this.url}?publicado=true&_sort=-id`);
  }
}