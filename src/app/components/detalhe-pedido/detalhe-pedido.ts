import { Component, effect, inject, input, signal, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { ROTULO_STATUS, ROTULO_TIPO, STATUS_PEDIDO, Pedido, StatusPedido, volumeDe } from '../../models/pedido';
import { DataBr } from '../../pipes/data-br';
import { EstadoPedidos } from '../../services/estado-pedidos';
import { EtiquetaStatus } from '../etiqueta-status/etiqueta-status';
import { ImagemAmpliavelDirective } from '../../directives/imagem-ampliavel';
import { Endereco } from '../../models/pedido';
import { Autenticacao } from '../../services/autenticacao';

@Component({
  imports: [ReactiveFormsModule, RouterLink, DataBr, EtiquetaStatus, ImagemAmpliavelDirective],
  selector: 'eb-detalhe-pedido',
  styleUrl: './detalhe-pedido.css',
  templateUrl: './detalhe-pedido.html',
})
export class DetalhePedido {
  protected readonly estado = inject(EstadoPedidos);
  private readonly autenticacao = inject(Autenticacao);
  private readonly fb = inject(NonNullableFormBuilder);
  readonly editando = signal(false);
  readonly erroEdicao = signal('');
  private snapshotConteudo = '';

  readonly formEdicao = this.fb.group({
    tipo: this.fb.control<Pedido['tipo']>('frete'),
    contato: this.fb.group({
      nome: [''],
      whatsapp: [''],
      email: [''],
    }),
    origem: this.formEndereco(),
    destino: this.formEndereco(),
    carga: this.fb.group({
      tipo: [''],
      descricao: [''],
      comprimento: [0],
      largura: [0],
      altura: [0],
      peso: [0],
    }),
    mudanca: this.fb.group({
      moveis: [''],
      volumeM3: [0],
      extras: [''],
    }),
    planejamento: this.fb.group({
      data: [''],
      vistoria: [false],
      observacoes: [''],
    }),
    fotos: [''],
    observacoesAdmin: [''],
  });
  protected readonly rotuloTipo = ROTULO_TIPO;
  protected readonly status = STATUS_PEDIDO.map((valor) => ({ valor, rotulo: ROTULO_STATUS[valor] }));
  protected readonly rotuloStatus = ROTULO_STATUS;
  protected readonly volumeDe = volumeDe;
  protected readonly texto = (valor: unknown): string =>
    valor === null || valor === undefined || valor === '' ? '—' : String(valor);
  protected readonly booleano = (valor: boolean | undefined): string =>
    valor === undefined ? '—' : valor ? 'Sim' : 'Não';
  protected readonly enderecoCompleto = (endereco: Endereco | undefined): string => {
    if (!endereco) return '—';
    const linha = [
      endereco.rua,
      endereco.numero ? `nº ${endereco.numero}` : '',
      endereco.complemento,
    ].filter(Boolean).join(', ');
    const bairro = endereco.bairro ? `${endereco.bairro}` : '';
    const local = [endereco.cidade, endereco.uf].filter(Boolean).join('/');
    return [
      linha || 'Logradouro não informado',
      bairro,
      [local, endereco.cep ? `CEP ${endereco.cep}` : ''].filter(Boolean).join(' - '),
    ].filter(Boolean).join(' · ');
  };
  protected readonly formatarCriadoEm = (valor: string): string => {
    if (!valor) return '—';
    const data = new Date(valor);
    if (Number.isNaN(data.getTime())) return valor;
    return new Intl.DateTimeFormat('pt-BR', {
      dateStyle: 'short',
      timeStyle: 'short',
    }).format(data);
  };

  private formEndereco() {
    return this.fb.group({
      cep: [''],
      rua: [''],
      numero: [''],
      complemento: [''],
      bairro: [''],
      cidade: [''],
      uf: [''],
      andar: [''],
      elevador: [''],
    });
  }

  readonly pedido = input<Pedido | null>(null);
  readonly naoEncontrado = input(false);
  readonly erro = input<string | null>(null);

  protected readonly controleStatus = new FormControl<StatusPedido>('recebido', { nonNullable: true });

  private ultimoCodigo: string | null = null;

  constructor() {
    effect(() => {
      const pedido = this.pedido();
      untracked(() => {
        if (pedido) {
          this.controleStatus.setValue(pedido.status, { emitEvent: false });
          if (!this.editando()) this.preencherEdicao(pedido);
        }
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

  protected iniciarEdicao(): void {
    const pedido = this.pedido();
    if (!pedido) return;
    this.preencherEdicao(pedido);
    this.editando.set(true);
  }

  protected cancelarEdicao(): void {
    const pedido = this.pedido();
    if (pedido) this.preencherEdicao(pedido);
    this.erroEdicao.set('');
    this.editando.set(false);
  }

  private preencherEdicao(pedido: Pedido): void {
    const carga = pedido.carga;
    const mudanca = pedido.mudanca;
    this.formEdicao.reset({
      tipo: pedido.tipo,
      contato: {
        nome: pedido.contato?.nome ?? '',
        whatsapp: pedido.contato?.whatsapp ?? '',
        email: pedido.contato?.email ?? '',
      },
      origem: {
        cep: pedido.origem?.cep ?? '',
        rua: pedido.origem?.rua ?? '',
        numero: pedido.origem?.numero ?? '',
        complemento: pedido.origem?.complemento ?? '',
        bairro: pedido.origem?.bairro ?? '',
        cidade: pedido.origem?.cidade ?? '',
        uf: pedido.origem?.uf ?? '',
        andar: pedido.origem?.andar ?? '',
        elevador: pedido.origem?.elevador ?? '',
      },
      destino: {
        cep: pedido.destino?.cep ?? '',
        rua: pedido.destino?.rua ?? '',
        numero: pedido.destino?.numero ?? '',
        complemento: pedido.destino?.complemento ?? '',
        bairro: pedido.destino?.bairro ?? '',
        cidade: pedido.destino?.cidade ?? '',
        uf: pedido.destino?.uf ?? '',
        andar: pedido.destino?.andar ?? '',
        elevador: pedido.destino?.elevador ?? '',
      },
      carga: {
        tipo: carga?.tipo ?? '',
        descricao: carga?.descricao ?? '',
        comprimento: carga?.comprimento ?? 0,
        largura: carga?.largura ?? 0,
        altura: carga?.altura ?? 0,
        peso: carga?.peso ?? 0,
      },
      mudanca: {
        moveis: (mudanca?.moveis ?? [])
          .map((movel) => `${movel.nome} x${movel.quantidade}`)
          .join('\n'),
        volumeM3: mudanca?.volumeM3 ?? 0,
        extras: (mudanca?.extras ?? []).join(', '),
      },
      planejamento: {
        data: pedido.planejamento?.data ?? '',
        vistoria: pedido.planejamento?.vistoria ?? false,
        observacoes: pedido.planejamento?.observacoes ?? '',
      },
      fotos: (pedido.fotos ?? []).join('\n'),
      observacoesAdmin: pedido.observacoesAdmin ?? '',
    });

    const snapshot = this.formEdicao.getRawValue();
    this.snapshotConteudo = JSON.stringify({
      tipo: snapshot.tipo,
      contato: snapshot.contato,
      origem: snapshot.origem,
      destino: snapshot.destino,
      carga: snapshot.carga,
      mudanca: snapshot.mudanca,
      planejamento: snapshot.planejamento,
      fotos: snapshot.fotos,
    });
  }

  protected salvarEdicao(): void {
    const pedido = this.pedido();
    if (!pedido?.id) {
      this.erroEdicao.set('Este pedido não possui ID válido para edição.');
      return;
    }

    const v = this.formEdicao.getRawValue();
    const conteudoAtual = JSON.stringify({
      tipo: v.tipo,
      contato: v.contato,
      origem: v.origem,
      destino: v.destino,
      carga: v.carga,
      mudanca: v.mudanca,
      planejamento: v.planejamento,
      fotos: v.fotos,
    });

    if (conteudoAtual !== this.snapshotConteudo) {
      const confirmou = typeof window === 'undefined'
        ? true
        : window.confirm('Você está alterando informações importantes do pedido. Deseja continuar?');
      if (!confirmou) return;
    }

    const moveis = v.mudanca.moveis
      .split(/[\n;]/)
      .map((linha) => linha.trim())
      .filter(Boolean)
      .map((linha, indice) => {
        const correspondencia = linha.match(/^(.+?)(?:\s*[x×]\s*(\d+))?$/i);
        return {
          id: `movel-${indice + 1}`,
          nome: correspondencia?.[1].trim() || linha,
          quantidade: Number(correspondencia?.[2] ?? 1),
        };
      });

    const alteracoes: Partial<Pedido> = {
      tipo: v.tipo,
      contato: {
        nome: v.contato.nome.trim(),
        whatsapp: v.contato.whatsapp.trim(),
        email: v.contato.email.trim(),
      },
      origem: {
        cep: v.origem.cep.trim(),
        rua: v.origem.rua.trim(),
        numero: v.origem.numero.trim(),
        complemento: v.origem.complemento.trim(),
        bairro: v.origem.bairro.trim(),
        cidade: v.origem.cidade.trim(),
        uf: v.origem.uf,
        andar: v.origem.andar.trim(),
        elevador: v.origem.elevador.trim(),
      },
      destino: {
        cep: v.destino.cep.trim(),
        rua: v.destino.rua.trim(),
        numero: v.destino.numero.trim(),
        complemento: v.destino.complemento.trim(),
        bairro: v.destino.bairro.trim(),
        cidade: v.destino.cidade.trim(),
        uf: v.destino.uf,
        andar: v.destino.andar.trim(),
        elevador: v.destino.elevador.trim(),
      },
      planejamento: {
        data: v.planejamento.data,
        vistoria: v.planejamento.vistoria,
        observacoes: v.planejamento.observacoes,
      },
      fotos: v.fotos.split(/[\n,]/).map((foto) => foto.trim()).filter(Boolean),
      observacoesAdmin: v.observacoesAdmin,
    };

    if (v.tipo === 'frete') {
      alteracoes.carga = {
        tipo: v.carga.tipo,
        descricao: v.carga.descricao,
        comprimento: Number(v.carga.comprimento ?? 0),
        largura: Number(v.carga.largura ?? 0),
        altura: Number(v.carga.altura ?? 0),
        peso: Number(v.carga.peso ?? 0),
      };
      alteracoes.mudanca = undefined;
    } else {
      alteracoes.mudanca = {
        moveis,
        volumeM3: Number(v.mudanca.volumeM3 ?? 0),
        extras: v.mudanca.extras.split(/[\n,]/).map((extra) => extra.trim()).filter(Boolean),
      };
      alteracoes.carga = undefined;
    }

    this.erroEdicao.set('');
    this.estado.atualizarPedido(
      pedido,
      alteracoes,
      this.autenticacao.email ?? 'SISTEMA',
    );
    this.editando.set(false);
  }

  protected salvar(): void {
    const pedido = this.pedido();
    if (pedido) {
      this.estado.atualizarStatus(
        pedido.codigo,
        this.controleStatus.value,
        this.autenticacao.email ?? 'SISTEMA',
      );
    }
  }
}
