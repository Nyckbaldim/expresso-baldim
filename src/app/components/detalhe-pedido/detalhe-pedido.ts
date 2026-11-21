import { Component, effect, inject, input, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ROTULO_STATUS, ROTULO_TIPO, STATUS_PEDIDO, Pedido, StatusPedido, cidadeDe, volumeDe } from '../../models/pedido';
import { DataBr } from '../../pipes/data-br';
import { EstadoPedidos } from '../../services/estado-pedidos';
import { EtiquetaStatus } from '../etiqueta-status/etiqueta-status';

@Component({
  imports: [ReactiveFormsModule, RouterLink, DataBr, EtiquetaStatus],
  selector: 'eb-detalhe-pedido',
  styleUrl: './detalhe-pedido.css',
  templateUrl: './detalhe-pedido.html',
})
export class DetalhePedido {
  protected readonly estado = inject(EstadoPedidos);
  protected readonly rotuloTipo = ROTULO_TIPO;
  protected readonly status = STATUS_PEDIDO.map((valor) => ({ valor, rotulo: ROTULO_STATUS[valor] }));
  protected readonly cidadeDe = cidadeDe;
  protected readonly volumeDe = volumeDe;

  readonly pedido = input<Pedido | null>(null);
  readonly naoEncontrado = input(false);
  readonly erro = input<string | null>(null);

  protected readonly controleStatus = new FormControl<StatusPedido>('recebido', { nonNullable: true });

  private ultimoCodigo: string | null = null;

  constructor() {
    effect(() => {
      const pedido = this.pedido();
      untracked(() => {
        if (pedido) this.controleStatus.setValue(pedido.status, { emitEvent: false });
        const codigo = pedido?.codigo ?? null;
        if (codigo !== this.ultimoCodigo) {
          this.ultimoCodigo = codigo;
          this.estado.limparEstadoSalvar();
        }
      });
    });

    this.controleStatus.valueChanges.pipe(takeUntilDestroyed()).subscribe(() => {
      if (this.estado.estadoSalvar() !== 'salvando') this.estado.limparEstadoSalvar();
    });
  }

  protected salvar(): void {
    const pedido = this.pedido();
    if (pedido) this.estado.atualizarStatus(pedido.codigo, this.controleStatus.value);
  }
}
