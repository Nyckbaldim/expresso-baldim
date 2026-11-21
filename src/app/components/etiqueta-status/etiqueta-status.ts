import { Component, computed, input } from '@angular/core';

import { ROTULO_STATUS, StatusPedido } from '../../models/pedido';

@Component({
  selector: 'eb-etiqueta-status',
  styleUrl: './etiqueta-status.css',
  templateUrl: './etiqueta-status.html',
})
export class EtiquetaStatus {
  readonly status = input.required<StatusPedido>();
  protected readonly rotulo = computed(() => ROTULO_STATUS[this.status()]);
}
