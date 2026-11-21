import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface Avaliacao {
  id?: string;
  pedidoId: string;
  codigo: string;
  tipo: 'feedback' | 'google';
  nota: number;
  motivo?: string;
  comentario?: string;
  criadoEm: string;
}

@Service()
export class AvaliacaoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/avaliacoes`;

  listar() {
    return this.http.get<Avaliacao[]>(this.url);
  }

  listarFeedbacks() {
    return this.http.get<Avaliacao[]>(`${this.url}?tipo=feedback&_sort=-criadoEm`);
  }

  criar(avaliacao: Omit<Avaliacao, 'id'>) {
    return this.http.post<Avaliacao>(this.url, avaliacao);
  }
}