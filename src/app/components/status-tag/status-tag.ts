import { Component, computed, input } from '@angular/core';

import { ORDER_STATUS_LABEL, OrderStatus } from '../../models/order';

@Component({
  imports: [],
  selector: 'eb-status-tag',
  styleUrl: './status-tag.css',
  templateUrl: './status-tag.html',
})
export class StatusTag {
  readonly status = input.required<OrderStatus>();
  protected readonly label = computed(() => ORDER_STATUS_LABEL[this.status()]);
}
