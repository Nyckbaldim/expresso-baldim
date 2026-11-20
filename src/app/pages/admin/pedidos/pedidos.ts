import { Component, OnInit, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { OrderDetail } from '../../../components/order-detail/order-detail';
import { Pagination } from '../../../components/pagination/pagination';
import { StatusTag } from '../../../components/status-tag/status-tag';
import {
  DEFAULT_PAGE_SIZE,
  ORDER_STATUSES,
  ORDER_STATUS_LABEL,
  PAGE_SIZES,
  SERVICE_LABEL,
} from '../../../models/order';
import { BrDatePipe } from '../../../pipes/br-date-pipe';
import { Auth } from '../../../services/auth';
import { OrdersStore, StatusFilter } from '../../../services/orders-store';

@Component({
  imports: [RouterLink, BrDatePipe, StatusTag, OrderDetail, Pagination],
  selector: 'eb-pedidos',
  styleUrl: './pedidos.css',
  templateUrl: './pedidos.html',
})
export class Pedidos implements OnInit {
  protected readonly store = inject(OrdersStore);
  private readonly auth = inject(Auth);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly pageSizes = PAGE_SIZES;

  protected readonly serviceLabel = SERVICE_LABEL;
  protected readonly filters: { value: StatusFilter; label: string }[] = [
    { value: 'TODOS', label: 'Todos' },
    ...ORDER_STATUSES.map((s) => ({ value: s as StatusFilter, label: ORDER_STATUS_LABEL[s] })),
  ];

  protected readonly code = toSignal(this.route.paramMap.pipe(map((p) => p.get('codigo'))), {
    initialValue: this.route.snapshot.paramMap.get('codigo'),
  });

  protected readonly selected = computed(() => {
    const code = this.code();
    if (!code) return null;
    // Link direto para um pedido fora da página atual: o store busca à parte.
    return this.store.orders().find((o) => o.code === code) ?? this.store.fetched();
  });

  /** Sem código na URL, o painel do desktop mostra o primeiro pedido da página. */
  protected readonly panelOrder = computed(() =>
    this.code() ? this.selected() : (this.store.orders()[0] ?? null),
  );

  protected readonly notFound = computed(
    () =>
      !!this.code() &&
      this.store.loaded() &&
      !this.store.fetching() &&
      !this.store.loadError() &&
      !this.selected(),
  );

  constructor() {
    // untracked: só o código da URL deve disparar o efeito, não os signals que o store lê por dentro.
    effect(() => {
      const code = this.code();
      untracked(() => this.store.openOrder(code));
    });

    // O store é a fonte da verdade; a URL só espelha página e tamanho para o F5 e o "voltar" não perderem o lugar.
    effect(() => {
      const page = this.store.page();
      const size = this.store.pageSize();
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: {
          pagina: page === 1 ? null : page,
          tamanho: size === DEFAULT_PAGE_SIZE ? null : size,
        },
        queryParamsHandling: 'merge',
      });
    });
  }

  ngOnInit(): void {
    // E o contrário: se a URL mudar (botão voltar, link com ?pagina=3), o store acompanha.
    this.route.queryParamMap.subscribe((q) => {
      this.store.applyParams(Number(q.get('pagina') ?? 1), Number(q.get('tamanho') ?? DEFAULT_PAGE_SIZE));
      this.store.init();
    });
  }

  protected onSearch(event: Event): void {
    this.store.setQuery((event.target as HTMLInputElement).value);
  }

  protected logout(): void {
    this.auth.logout();
  }
}
