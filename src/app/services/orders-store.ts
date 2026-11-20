import { Service, computed, inject, signal } from '@angular/core';
import { Subject, debounceTime, filter } from 'rxjs';

import { DEFAULT_PAGE_SIZE, Order, OrderStatus, OrderSummary, PAGE_SIZES } from '../models/order';
import { Orders } from './orders';

export type StatusFilter = 'TODOS' | OrderStatus;
export type SaveState = 'idle' | 'saving' | 'saved' | 'error';

/**
 * Estado compartilhado do painel de pedidos.
 * Filtros e página ficam aqui (e não no componente) para não se perderem ao abrir um pedido e voltar:
 * no celular, lista e detalhe são rotas diferentes.
 */
@Service()
export class OrdersStore {
  private readonly api = inject(Orders);

  readonly orders = signal<Order[]>([]);
  readonly total = signal(0);
  readonly loaded = signal(false);
  readonly loading = signal(false);
  readonly loadError = signal<string | null>(null);

  readonly query = signal('');
  readonly statusFilter = signal<StatusFilter>('TODOS');
  readonly page = signal(1);
  readonly pageSize = signal<number>(DEFAULT_PAGE_SIZE);

  readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));

  readonly summary = signal<OrderSummary>({ novos: 0, andamento: 0, concluidos: 0 });

  readonly saveState = signal<SaveState>('idle');

  /** Último pedido aberto: no celular, destaca o cartão ao voltar do detalhe para a lista. */
  readonly lastOpened = signal<string | null>(null);

  /** Pedido buscado à parte, quando o código da URL não está na página atual (ex.: abrir um link direto). */
  readonly fetched = signal<Order | null>(null);
  readonly fetching = signal(false);

  private requestId = 0;
  private pendingCode: string | null = null;
  private readonly search$ = new Subject<string>();

  constructor() {
    // Espera a pessoa parar de digitar antes de chamar a API; busca nova volta para a página 1.
    this.search$
      .pipe(
        debounceTime(300),
        filter((value) => value !== this.query()),
      )
      .subscribe((value) => {
        this.query.set(value);
        this.page.set(1);
        this.reload();
      });
  }

  init(): void {
    if (this.loaded() || this.loading()) return;
    this.reload();
    this.loadSummary();
  }

  reload(): void {
    const id = ++this.requestId;
    this.loading.set(true);
    this.loadError.set(null);
    const status = this.statusFilter();

    this.api
      .list({ page: this.page(), pageSize: this.pageSize(), status: status === 'TODOS' ? null : status, search: this.query() })
      .subscribe({
        next: (res) => {
          if (id !== this.requestId) return; // descarta resposta de uma busca antiga que chegou atrasada
          const pages = Math.max(1, Math.ceil(res.total / this.pageSize()));
          if (this.page() > pages) {
            // A página pedida deixou de existir (ex.: URL antiga): vai para a última.
            this.page.set(pages);
            this.reload();
            return;
          }
          this.orders.set(res.items);
          this.total.set(res.total);
          this.loaded.set(true);
          this.loading.set(false);
          this.resolvePending();
        },
        error: () => {
          if (id !== this.requestId) return;
          this.loadError.set('Não foi possível carregar os pedidos.');
          this.loading.set(false);
        },
      });
  }

  setQuery(text: string): void {
    this.search$.next(text);
  }

  setStatus(status: StatusFilter): void {
    if (status === this.statusFilter()) return;
    this.statusFilter.set(status);
    this.page.set(1);
    this.reload();
  }

  setPage(page: number): void {
    const next = Math.min(Math.max(1, Math.trunc(page)), this.totalPages());
    if (next === this.page()) return;
    this.page.set(next);
    this.reload();
  }

  setPageSize(size: number): void {
    if (!(PAGE_SIZES as readonly number[]).includes(size) || size === this.pageSize()) return;
    this.pageSize.set(size);
    this.page.set(1);
    this.reload();
  }

  applyParams(page: number, size: number): void {
    const validSize = (PAGE_SIZES as readonly number[]).includes(size) ? size : DEFAULT_PAGE_SIZE;
    const validPage = Number.isInteger(page) && page >= 1 ? page : 1;
    if (validPage === this.page() && validSize === this.pageSize()) return;
    this.page.set(validPage);
    this.pageSize.set(validSize);
    if (this.loaded()) this.reload();
  }

  openOrder(code: string | null): void {
    this.pendingCode = code;
    if (!code) return;
    this.lastOpened.set(code);
    if (this.loaded()) this.resolvePending();
  }

  private resolvePending(): void {
    const code = this.pendingCode;
    if (!code) return;
    if (this.orders().some((o) => o.code === code) || this.fetched()?.code === code) return;
    this.fetching.set(true);
    this.api.get(code).subscribe({
      next: (order) => {
        this.fetched.set(order);
        this.fetching.set(false);
      },
      error: () => {
        this.fetched.set(null);
        this.fetching.set(false);
      },
    });
  }

  updateStatus(code: string, status: OrderStatus): void {
    this.saveState.set('saving');
    this.api.updateStatus(code, status).subscribe({
      next: (updated) => {
        this.orders.update((list) => list.map((o) => (o.code === code ? updated : o)));
        if (this.fetched()?.code === code) this.fetched.set(updated);
        this.saveState.set('saved');
        this.loadSummary();
      },
      error: () => this.saveState.set('error'),
    });
  }

  resetSaveState(): void {
    this.saveState.set('idle');
  }

  private loadSummary(): void {
    this.api.summary().subscribe({ next: (s) => this.summary.set(s), error: () => undefined });
  }

  /** Limpa tudo ao sair, para o próximo usuário não ver dados do anterior. */
  reset(): void {
    this.requestId++;
    this.orders.set([]);
    this.total.set(0);
    this.loaded.set(false);
    this.loading.set(false);
    this.loadError.set(null);
    this.query.set('');
    this.statusFilter.set('TODOS');
    this.page.set(1);
    this.pageSize.set(DEFAULT_PAGE_SIZE);
    this.summary.set({ novos: 0, andamento: 0, concluidos: 0 });
    this.saveState.set('idle');
    this.lastOpened.set(null);
    this.fetched.set(null);
    this.fetching.set(false);
    this.pendingCode = null;
  }
}
