import { Service, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../environments/environment';

/** De onde veio a avaliação. Hoje só existem avaliações do site; as do Google entram depois. */
export type OrigemDepoimento = 'site' | 'google';

export const ROTULO_ORIGEM_DEPOIMENTO: Record<OrigemDepoimento, string> = {
  site: 'Avaliação pelo site',
  google: 'Avaliação no Google',
};

export interface Depoimento {
  id: string;
  nome: string;
  nota: number;
  texto: string;
  publicado: boolean;
  /** Opcional: os depoimentos já cadastrados não informam a origem. */
  origem?: OrigemDepoimento;
}

@Service()
export class DepoimentoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/depoimentos`;

  listarPublicados() {
    return this.http.get<Depoimento[]>(`${this.url}?publicado=true&_sort=-id`);
  }
}