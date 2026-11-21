import { Component, OnInit, computed, effect, inject, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { map } from 'rxjs';

import { DetalhePedido } from '../../../components/detalhe-pedido/detalhe-pedido';
import { EtiquetaStatus } from '../../../components/etiqueta-status/etiqueta-status';
import { Paginacao } from '../../../components/paginacao/paginacao';
import {
  STATUS_PEDIDO,
  ROTULO_STATUS,
  ROTULO_TIPO,
  TAMANHO_PADRAO,
  TAMANHOS_PAGINA,
  cidadeDe,
} from '../../../models/pedido';
import { DataBr } from '../../../pipes/data-br';
import { Autenticacao } from '../../../services/autenticacao';
import { EstadoPedidos, FiltroStatus } from '../../../services/estado-pedidos';

@Component({
  imports: [RouterLink, DataBr, EtiquetaStatus, DetalhePedido, Paginacao],
  selector: 'eb-pedidos',
  styleUrl: './pedidos.css',
  templateUrl: './pedidos.html',
})
export class Pedidos implements OnInit {
  protected readonly estado = inject(EstadoPedidos);
  private readonly autenticacao = inject(Autenticacao);
  private readonly rota = inject(ActivatedRoute);
  private readonly roteador = inject(Router);

  protected readonly tamanhosPagina = TAMANHOS_PAGINA;
  protected readonly rotuloTipo = ROTULO_TIPO;
  protected readonly filtros: { valor: FiltroStatus; rotulo: string }[] = [
    { valor: 'todos', rotulo: 'Todos' },
    ...STATUS_PEDIDO.map((status) => ({ valor: status as FiltroStatus, rotulo: ROTULO_STATUS[status] })),
  ];

  protected readonly codigo = toSignal(this.rota.paramMap.pipe(map((parametros) => parametros.get('codigo'))), {
    initialValue: this.rota.snapshot.paramMap.get('codigo'),
  });

  protected readonly selecionado = computed(() => {
    const codigo = this.codigo();
    if (!codigo) return null;
    return this.estado.pedidos().find((pedido) => pedido.codigo === codigo) ?? this.estado.buscado();
  });

  protected readonly pedidoPainel = computed(() =>
    this.codigo() ? this.selecionado() : (this.estado.pedidos()[0] ?? null),
  );

  protected readonly naoEncontrado = computed(
    () =>
      !!this.codigo() &&
      this.estado.carregado() &&
      !this.estado.buscando() &&
      !this.estado.erroCarga() &&
      !this.estado.erroPedido() &&
      !this.selecionado(),
  );

  protected readonly cidadeDe = cidadeDe;

  constructor() {
    effect(() => {
      const codigo = this.codigo();
      untracked(() => this.estado.abrirPedido(codigo));
    });

    effect(() => {
      const pagina = this.estado.pagina();
      const tamanho = this.estado.tamanhoPagina();
      void this.roteador.navigate([], {
        relativeTo: this.rota,
        queryParams: {
          pagina: pagina === 1 ? null : pagina,
          tamanho: tamanho === TAMANHO_PADRAO ? null : tamanho,
        },
        queryParamsHandling: 'merge',
      });
    });
  }

  ngOnInit(): void {
    this.rota.queryParamMap.subscribe((parametros) => {
      this.estado.aplicarParametros(
        Number(parametros.get('pagina') ?? 1),
        Number(parametros.get('tamanho') ?? TAMANHO_PADRAO),
      );
      this.estado.iniciar();
    });
  }

  protected aoBuscar(evento: Event): void {
    this.estado.definirBusca((evento.target as HTMLInputElement).value);
  }

  protected sair(): void {
    this.autenticacao.sair();
  }
}
