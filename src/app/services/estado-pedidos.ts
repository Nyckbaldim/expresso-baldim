import { Service, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Subject, debounceTime, filter } from 'rxjs';

import {
  Pedido,
  ResumoPedidos,
  StatusPedido,
  TAMANHO_PADRAO,
  TAMANHOS_PAGINA,
} from '../models/pedido';
import { PedidoService } from './pedido';

export type FiltroStatus = 'todos' | StatusPedido;
export type EstadoSalvar = 'ocioso' | 'salvando' | 'salvo' | 'erro';

@Service()
export class EstadoPedidos {
  private readonly pedidosApi = inject(PedidoService);

  readonly pedidos = signal<Pedido[]>([]);
  readonly total = signal(0);
  readonly carregado = signal(false);
  readonly carregando = signal(false);
  readonly erroCarga = signal<string | null>(null);
  readonly erroResumo = signal<string | null>(null);
  readonly erroPedido = signal<string | null>(null);

  readonly busca = signal('');
  readonly filtroStatus = signal<FiltroStatus>('todos');
  readonly pagina = signal(1);
  readonly tamanhoPagina = signal<number>(TAMANHO_PADRAO);

  readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.tamanhoPagina())));

  readonly resumo = signal<ResumoPedidos>({ novos: 0, andamento: 0, concluidos: 0 });

  readonly estadoSalvar = signal<EstadoSalvar>('ocioso');

  readonly ultimoAberto = signal<string | null>(null);

  readonly buscado = signal<Pedido | null>(null);
  readonly buscando = signal(false);

  private idRequisicao = 0;
  private idBuscaPedido = 0;
  private codigoPendente: string | null = null;
  private readonly busca$ = new Subject<string>();

  constructor() {
    this.busca$
      .pipe(
        debounceTime(300),
        filter((valor) => valor !== this.busca()),
      )
      .subscribe((valor) => {
        this.busca.set(valor);
        this.pagina.set(1);
        this.recarregar();
      });
  }

  iniciar(): void {
    if (this.carregado() || this.carregando()) return;
    this.recarregar();
    this.carregarResumo();
  }

  recarregar(): void {
    const id = ++this.idRequisicao;
    this.carregando.set(true);
    this.erroCarga.set(null);
    const status = this.filtroStatus();

    this.pedidosApi
      .consultar({
        pagina: this.pagina(),
        tamanho: this.tamanhoPagina(),
        status: status === 'todos' ? null : status,
        busca: this.busca(),
      })
      .subscribe({
        next: (resposta) => {
          if (id !== this.idRequisicao) return;
          const paginas = Math.max(1, Math.ceil(resposta.total / this.tamanhoPagina()));
          if (this.pagina() > paginas) {
            this.pagina.set(paginas);
            this.recarregar();
            return;
          }
          this.pedidos.set(resposta.itens);
          this.total.set(resposta.total);
          this.carregado.set(true);
          this.carregando.set(false);
          this.resolverPendente();
        },
        error: () => {
          if (id !== this.idRequisicao) return;
          this.erroCarga.set('Não foi possível carregar os pedidos.');
          this.carregando.set(false);
        },
      });
  }

  definirBusca(texto: string): void {
    this.busca$.next(texto);
  }

  definirStatus(status: FiltroStatus): void {
    if (status === this.filtroStatus()) return;
    this.filtroStatus.set(status);
    this.pagina.set(1);
    this.recarregar();
  }

  definirPagina(pagina: number): void {
    const proxima = Math.min(Math.max(1, Math.trunc(pagina)), this.totalPaginas());
    if (proxima === this.pagina()) return;
    this.pagina.set(proxima);
    this.recarregar();
  }

  definirTamanho(tamanho: number): void {
    if (!(TAMANHOS_PAGINA as readonly number[]).includes(tamanho) || tamanho === this.tamanhoPagina()) return;
    this.tamanhoPagina.set(tamanho);
    this.pagina.set(1);
    this.recarregar();
  }

  aplicarParametros(pagina: number, tamanho: number): void {
    const tamanhoValido = (TAMANHOS_PAGINA as readonly number[]).includes(tamanho) ? tamanho : TAMANHO_PADRAO;
    const paginaValida = Number.isInteger(pagina) && pagina >= 1 ? pagina : 1;
    if (paginaValida === this.pagina() && tamanhoValido === this.tamanhoPagina()) return;
    this.pagina.set(paginaValida);
    this.tamanhoPagina.set(tamanhoValido);
    if (this.carregado()) this.recarregar();
  }

  abrirPedido(codigo: string | null): void {
    this.codigoPendente = codigo;
    this.idBuscaPedido++;
    this.buscando.set(false);
    this.erroPedido.set(null);
    if (!codigo) {
      this.buscado.set(null);
      return;
    }
    this.ultimoAberto.set(codigo);
    if (this.pedidos().some((pedido) => pedido.codigo === codigo)) {
      this.buscado.set(null);
      return;
    }
    if (this.buscado()?.codigo !== codigo) this.buscado.set(null);
    if (this.carregado()) this.resolverPendente();
  }

  private resolverPendente(): void {
    const codigo = this.codigoPendente;
    if (!codigo) return;
    if (this.pedidos().some((pedido) => pedido.codigo === codigo)) {
      this.buscado.set(null);
      return;
    }
    if (this.buscado()?.codigo === codigo) return;
    const id = ++this.idBuscaPedido;
    this.buscando.set(true);
    this.erroPedido.set(null);
    this.pedidosApi.obter(codigo).subscribe({
      next: (pedido) => {
        if (id !== this.idBuscaPedido) return;
        this.buscado.set(pedido);
        this.buscando.set(false);
      },
      error: (erro: HttpErrorResponse) => {
        if (id !== this.idBuscaPedido) return;
        this.buscado.set(null);
        this.buscando.set(false);
        if (erro.status !== 404) this.erroPedido.set('Não foi possível carregar os detalhes do pedido.');
      },
    });
  }

  atualizarStatus(codigo: string, status: StatusPedido): void {
    const pedido = this.pedidos().find((item) => item.codigo === codigo) ?? this.buscado();
    if (!pedido?.id) {
      this.estadoSalvar.set('erro');
      return;
    }
    this.estadoSalvar.set('salvando');
    this.pedidosApi.atualizarStatus(pedido.id, status).subscribe({
      next: (atualizado) => {
        this.pedidos.update((lista) => lista.map((item) => (item.codigo === codigo ? atualizado : item)));
        if (this.buscado()?.codigo === codigo) this.buscado.set(atualizado);
        this.estadoSalvar.set('salvo');
        this.carregarResumo();
      },
      error: () => this.estadoSalvar.set('erro'),
    });
  }

  limparEstadoSalvar(): void {
    this.estadoSalvar.set('ocioso');
  }

  private carregarResumo(): void {
    this.erroResumo.set(null);
    this.pedidosApi.resumo().subscribe({
      next: (resumo) => this.resumo.set(resumo),
      error: () => this.erroResumo.set('Não foi possível carregar o resumo dos pedidos.'),
    });
  }

  limpar(): void {
    this.idRequisicao++;
    this.pedidos.set([]);
    this.total.set(0);
    this.carregado.set(false);
    this.carregando.set(false);
    this.erroCarga.set(null);
    this.erroResumo.set(null);
    this.erroPedido.set(null);
    this.busca.set('');
    this.filtroStatus.set('todos');
    this.pagina.set(1);
    this.tamanhoPagina.set(TAMANHO_PADRAO);
    this.resumo.set({ novos: 0, andamento: 0, concluidos: 0 });
    this.estadoSalvar.set('ocioso');
    this.ultimoAberto.set(null);
    this.buscado.set(null);
    this.buscando.set(false);
    this.codigoPendente = null;
    this.idBuscaPedido++;
  }
}
