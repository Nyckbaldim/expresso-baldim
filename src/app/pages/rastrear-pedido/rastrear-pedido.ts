import { HttpErrorResponse } from '@angular/common/http';
import { Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { finalize } from 'rxjs';

import { EtiquetaStatus } from '../../components/etiqueta-status/etiqueta-status';
import { Pedido } from '../../models/pedido';
import { PedidoService } from '../../services/pedido';

@Component({
  selector: 'app-rastrear-pedido',
  imports: [ReactiveFormsModule, EtiquetaStatus],
  templateUrl: './rastrear-pedido.html',
  styleUrl: './rastrear-pedido.css',
})
export class RastrearPedido {
  private readonly construtorFormulario = inject(NonNullableFormBuilder);
  private readonly rota = inject(ActivatedRoute);
  private readonly pedidos = inject(PedidoService);

  readonly formulario = this.construtorFormulario.group({
    codigo: ['', Validators.required],
  });

  readonly pedido = signal<Pedido | null>(null);
  readonly carregando = signal(false);
  readonly erro = signal<string | null>(null);

  formatarAtualizacao(valor: string | undefined): string {
    if (!valor) return 'Aguardando primeira atualização pela equipe.';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(data);
  }

  private idConsulta = 0;

  constructor() {
    this.rota.queryParamMap.pipe(takeUntilDestroyed()).subscribe((parametros) => {
      const codigo = parametros.get('codigo');
      if (!codigo) return;
      this.formulario.controls.codigo.setValue(codigo);
      this.consultar();
    });
  }

  codigoInvalido(): boolean {
    const controle = this.formulario.controls.codigo;
    return controle.invalid && (controle.touched || controle.dirty);
  }

  consultar(): void {
    const id = ++this.idConsulta;
    const controle = this.formulario.controls.codigo;
    const codigo = controle.value.trim();
    controle.setValue(codigo);

    if (this.formulario.invalid) {
      this.formulario.markAllAsTouched();
      this.pedido.set(null);
      this.erro.set(null);
      this.carregando.set(false);
      return;
    }

    this.pedido.set(null);
    this.erro.set(null);
    this.carregando.set(true);

    this.pedidos
      .obter(codigo)
      .pipe(finalize(() => {
        if (id === this.idConsulta) this.carregando.set(false);
      }))
      .subscribe({
        next: (pedido) => {
          if (id === this.idConsulta) this.pedido.set(pedido);
        },
        error: (resposta: HttpErrorResponse) => {
          if (id !== this.idConsulta) return;
          this.erro.set(
            resposta.status === 404
              ? 'Não encontramos um pedido com esse código. Confira e tente novamente.'
              : 'Não foi possível consultar o pedido agora. Tente novamente em instantes.',
          );
        },
      });
  }
}
