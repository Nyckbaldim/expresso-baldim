import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, delay, of, throwError } from 'rxjs';

import { environment } from '../../environments/environment';
import { Order, OrderQuery, OrderStatus, OrderSummary, Page, ServiceType } from '../models/order';

/** Remove acentos e maiúsculas para a busca por nome. */
const normalize = (text: string) =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

// Dados de exemplo, usados só com environment.useMock = true (47 pedidos, para testar a paginação).
const SEED: Order[] = [
  { code: 'EB-7K4M2', customerName: 'Mariana Alves', service: 'MUDANCA_RESIDENCIAL', origin: 'Belo Horizonte', destination: 'Contagem', volumeM3: 18, desiredDate: '2026-11-28', status: 'EM_TRANSPORTE' },
  { code: 'EB-3P9QX', customerName: 'Carlos Mendes', service: 'FRETE_AVULSO', origin: 'Contagem', destination: 'Sabará', volumeM3: 6, desiredDate: null, status: 'EM_ANALISE' },
  { code: 'EB-8T2LD', customerName: 'Fernanda Rocha', service: 'MUDANCA_RESIDENCIAL', origin: 'Santa Luzia', destination: 'Belo Horizonte', volumeM3: 22, desiredDate: null, status: 'RECEBIDO' },
  { code: 'EB-5N6WA', customerName: 'João Pereira', service: 'FRETE_AVULSO', origin: 'Nova Lima', destination: 'Ibirité', volumeM3: 4, desiredDate: null, status: 'CONCLUIDO' },
  { code: 'EB-1R8ZC', customerName: 'Patrícia Lima', service: 'MUDANCA_RESIDENCIAL', origin: 'Belo Horizonte', destination: 'Vespasiano', volumeM3: 15, desiredDate: null, status: 'RECEBIDO' },
  { code: 'EB-9M4HV', customerName: 'Rafael Souza', service: 'FRETE_AVULSO', origin: 'Sabará', destination: 'Contagem', volumeM3: 3, desiredDate: null, status: 'CONCLUIDO' },
  { code: 'EB-2D7JB', customerName: 'Luciana Prado', service: 'MUDANCA_RESIDENCIAL', origin: 'Ibirité', destination: 'Nova Lima', volumeM3: 20, desiredDate: null, status: 'EM_ANALISE' },
];

const FIRST_NAMES = ['Ana', 'Bruno', 'Camila', 'Daniel', 'Eduarda', 'Felipe', 'Gabriela', 'Henrique', 'Isabela', 'Lucas', 'Marcos', 'Natália', 'Otávio', 'Priscila', 'Renato', 'Sofia', 'Tiago', 'Vanessa'];
const LAST_NAMES = ['Almeida', 'Barbosa', 'Cardoso', 'Duarte', 'Esteves', 'Ferreira', 'Gomes', 'Henriques', 'Lopes', 'Moreira', 'Nogueira', 'Oliveira', 'Ramos', 'Silva', 'Teixeira'];
const CITIES = ['Belo Horizonte', 'Contagem', 'Betim', 'Sabará', 'Nova Lima', 'Ibirité', 'Santa Luzia', 'Vespasiano', 'Lagoa Santa'];
const STATUSES: OrderStatus[] = ['RECEBIDO', 'EM_ANALISE', 'EM_TRANSPORTE', 'CONCLUIDO'];
const SERVICES: ServiceType[] = ['FRETE_AVULSO', 'MUDANCA_RESIDENCIAL'];
const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'; // sem 0/O e 1/I, que se confundem

/** Gera pedidos fictícios sempre iguais (semente fixa), para os testes serem repetíveis. */
function buildMock(extra: number): Order[] {
  let seed = 7;
  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
  const pick = <T>(list: readonly T[]): T => list[Math.floor(next() * list.length)];

  const orders = SEED.map((o) => ({ ...o }));
  const used = new Set(orders.map((o) => o.code));
  while (orders.length < SEED.length + extra) {
    let code = '';
    do {
      code = 'EB-' + Array.from({ length: 5 }, () => pick([...CODE_CHARS])).join('');
    } while (used.has(code));
    used.add(code);

    const service = pick(SERVICES);
    const origin = pick(CITIES);
    let destination = pick(CITIES);
    while (destination === origin) destination = pick(CITIES);
    const day = String(1 + Math.floor(next() * 28)).padStart(2, '0');

    orders.push({
      code,
      customerName: `${pick(FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      service,
      origin,
      destination,
      volumeM3: service === 'MUDANCA_RESIDENCIAL' ? 10 + Math.floor(next() * 20) : 2 + Math.floor(next() * 8),
      desiredDate: next() < 0.5 ? null : `2026-12-${day}`,
      status: pick(STATUSES),
    });
  }
  return orders;
}

@Service()
export class Orders {
  private readonly http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/pedidos`;
  private readonly mockDb: Order[] = buildMock(40);

  list(query: OrderQuery): Observable<Page<Order>> {
    if (environment.useMock) return of(this.mockPage(query)).pipe(delay(350));

    let params = new HttpParams().set('pagina', String(query.page)).set('tamanho', String(query.pageSize));
    if (query.status) params = params.set('status', query.status);
    const search = query.search.trim();
    if (search) params = params.set('busca', search);
    return this.http.get<Page<Order>>(this.api, { params });
  }

  summary(): Observable<OrderSummary> {
    if (environment.useMock) {
      const count = (...s: OrderStatus[]) => this.mockDb.filter((o) => s.includes(o.status)).length;
      return of({ novos: count('RECEBIDO'), andamento: count('EM_ANALISE', 'EM_TRANSPORTE'), concluidos: count('CONCLUIDO') }).pipe(delay(200));
    }
    return this.http.get<OrderSummary>(`${this.api}/resumo`);
  }

  get(code: string): Observable<Order> {
    if (environment.useMock) {
      const order = this.mockDb.find((o) => o.code === code);
      return order ? of({ ...order }).pipe(delay(250)) : throwError(() => new HttpErrorResponse({ status: 404 }));
    }
    return this.http.get<Order>(`${this.api}/${encodeURIComponent(code)}`);
  }

  updateStatus(code: string, status: OrderStatus): Observable<Order> {
    if (environment.useMock) {
      const order = this.mockDb.find((o) => o.code === code);
      if (!order) return throwError(() => new HttpErrorResponse({ status: 404 }));
      order.status = status;
      return of({ ...order }).pipe(delay(350));
    }
    return this.http.patch<Order>(`${this.api}/${encodeURIComponent(code)}/status`, { status });
  }

  private mockPage(query: OrderQuery): Page<Order> {
    const search = normalize(query.search).trim();
    const matches = this.mockDb.filter(
      (o) =>
        (!query.status || o.status === query.status) &&
        (!search || normalize(o.code).includes(search) || normalize(o.customerName).includes(search)),
    );
    const start = (query.page - 1) * query.pageSize;
    return { items: matches.slice(start, start + query.pageSize).map((o) => ({ ...o })), total: matches.length };
  }
}
