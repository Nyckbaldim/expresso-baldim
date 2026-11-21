import { Component, effect, inject, input, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ORDER_STATUSES, ORDER_STATUS_LABEL, Order, OrderStatus, SERVICE_LABEL } from '../../models/order';
import { BrDatePipe } from '../../pipes/br-date-pipe';
import { OrdersStore } from '../../services/orders-store';
import { StatusTag } from '../status-tag/status-tag';

@Component({
  imports: [ReactiveFormsModule, RouterLink, BrDatePipe, StatusTag],
  selector: 'eb-order-detail',
  styleUrl: './order-detail.css',
  templateUrl: './order-detail.html',
})
export class OrderDetail {
  protected readonly store = inject(OrdersStore);
  protected readonly serviceLabel = SERVICE_LABEL;
  protected readonly statuses = ORDER_STATUSES.map((value) => ({ value, label: ORDER_STATUS_LABEL[value] }));

  readonly order = input<Order | null>(null);

  readonly notFound = input(false);

  protected readonly statusCtrl = new FormControl<OrderStatus>('RECEBIDO', { nonNullable: true });

  private lastCode: string | null = null;

  constructor() {
    effect(() => {
      const value = this.order();
      untracked(() => {
        if (value) this.statusCtrl.setValue(value.status, { emitEvent: false });

        // Só limpa a mensagem de "salvo" ao trocar de pedido (não quando o próprio salvamento atualiza o pedido).
        const code = value?.code ?? null;
        if (code !== this.lastCode) {
          this.lastCode = code;
          this.store.resetSaveState();
        }
      });
    });

    this.statusCtrl.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.store.saveState() !== 'saving') this.store.resetSaveState();
    });
  }

  protected save(): void {
    const order = this.order();
    if (order) this.store.updateStatus(order.code, this.statusCtrl.value);
  }
}
