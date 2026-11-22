import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { firstValueFrom } from 'rxjs';

import { PedidoService } from '../../../services/pedido';
import { Autenticacao } from '../../../services/autenticacao';
import { Endereco, MovelPedido, Pedido as PedidoModel, ROTULO_STATUS, ROTULO_TIPO, STATUS_PEDIDO, StatusPedido, TipoPedido } from '../../../models/pedido';

@Component({
  selector: 'eb-editar-pedido',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './editar-pedido.html',
  styleUrl: './editar-pedido.css',
})
export class EditarPedido {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly rota = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly pedidos = inject(PedidoService);
  private readonly autenticacao = inject(Autenticacao);

  readonly aba = signal<'status' | 'dados'>('status');
  readonly carregando = signal(true);
  readonly salvando = signal(false);
  readonly erro = signal('');
  readonly pedido = signal<PedidoModel | null>(null);
  readonly mudancaItens = signal<MovelPedido[]>([]);
  readonly volumeMudanca = signal(0);
  readonly status = STATUS_PEDIDO.map((valor) => ({ valor, rotulo: ROTULO_STATUS[valor] }));
  readonly tipos = [
    { valor: 'frete' as TipoPedido, rotulo: ROTULO_TIPO.frete },
    { valor: 'mudanca' as TipoPedido, rotulo: ROTULO_TIPO.mudanca },
  ];
  readonly ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

  readonly form = this.fb.group({
    codigo: [''],
    tipo: ['frete' as TipoPedido],
    status: ['recebido' as StatusPedido],
    criadoEm: [''],
    observacoesAdmin: [''],
    contato: this.fb.group({ nome: [''], whatsapp: [''], email: [''] }),
    origem: this.endereco(),
    destino: this.endereco(),
    carga: this.fb.group({
      tipo: [''],
      descricao: [''],
      comprimento: [0],
      largura: [0],
      altura: [0],
      peso: [0],
    }),
    mudanca: this.fb.group({
      moveis: this.fb.control<MovelPedido[]>([]),
      volumeM3: [0],
      extras: [''],
    }),
    planejamento: this.fb.group({ data: [''], vistoria: [false], observacoes: [''] }),
    fotos: [''],
  });

  private snapshotConteudo = '';

  constructor() {
    void this.carregar();
  }

  private async carregar(): Promise<void> {
    const codigo = this.rota.snapshot.paramMap.get('codigo');
    if (!codigo) {
      this.erro.set('Código do pedido não informado.');
      this.carregando.set(false);
      return;
    }
    try {
      const pedido = await firstValueFrom(this.pedidos.obter(codigo));
      this.pedido.set(pedido);
      this.preencher(pedido);
    } catch {
      this.erro.set('Não foi possível carregar este pedido.');
    } finally {
      this.carregando.set(false);
    }
  }

  private endereco() {
    return this.fb.group({
      cep: [''], rua: [''], numero: [''], complemento: [''], bairro: [''],
      cidade: [''], uf: [''], andar: [''], elevador: [''],
    });
  }

  private preencher(pedido: PedidoModel): void {
    const carga = pedido.carga;
    const mudanca = pedido.mudanca;
    const itens = (mudanca?.moveis ?? []).map((item) => ({
      id: item.id,
      nome: item.nome,
      quantidade: item.quantidade,
      volumeM3: item.volumeM3 ?? 0,
    }));
    this.mudancaItens.set(itens);
    this.sincronizarMudanca();
    this.form.reset({
      codigo: pedido.codigo,
      tipo: pedido.tipo,
      status: pedido.status,
      criadoEm: pedido.criadoEm?.slice(0, 10) ?? '',
      observacoesAdmin: pedido.observacoesAdmin ?? '',
      contato: {
        nome: pedido.contato?.nome ?? '',
        whatsapp: pedido.contato?.whatsapp ?? '',
        email: pedido.contato?.email ?? '',
      },
      origem: this.valorEndereco(pedido.origem),
      destino: this.valorEndereco(pedido.destino),
      carga: {
        tipo: carga?.tipo ?? '',
        descricao: carga?.descricao ?? '',
        comprimento: carga?.comprimento ?? 0,
        largura: carga?.largura ?? 0,
        altura: carga?.altura ?? 0,
        peso: carga?.peso ?? 0,
      },
      mudanca: {
        moveis: itens,
        volumeM3: mudanca?.volumeM3 ?? 0,
        extras: (mudanca?.extras ?? []).join(', '),
      },
      planejamento: {
        data: pedido.planejamento?.data ?? '',
        vistoria: pedido.planejamento?.vistoria ?? false,
        observacoes: pedido.planejamento?.observacoes ?? '',
      },
      fotos: (pedido.fotos ?? []).join('\n'),
    });

    this.snapshotConteudo = JSON.stringify(this.conteudoDoForm());
  }

  private valorEndereco(endereco: Endereco | undefined) {
    return {
      cep: endereco?.cep ?? '', rua: endereco?.rua ?? '', numero: endereco?.numero ?? '',
      complemento: endereco?.complemento ?? '', bairro: endereco?.bairro ?? '',
      cidade: endereco?.cidade ?? '', uf: endereco?.uf ?? '',
      andar: endereco?.andar ?? '', elevador: endereco?.elevador ?? '',
    };
  }

  adicionarMudancaItem(): void {
    this.mudancaItens.update((lista) => [
      ...lista,
      { id: `movel-${Date.now()}-${lista.length + 1}`, nome: '', quantidade: 1, volumeM3: 0 },
    ]);
  }

  atualizarMudancaItem(indice: number, campo: 'nome' | 'quantidade' | 'volumeM3', evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const valor = campo === 'nome' ? input.value : Math.max(0, Number(input.value) || 0);
    this.mudancaItens.update((lista) =>
      lista.map((item, posicao) =>
        posicao === indice ? { ...item, [campo]: valor } : item,
      ),
    );
    this.sincronizarMudanca();
  }

  removerMudancaItem(indice: number): void {
    this.mudancaItens.update((lista) => lista.filter((_, posicao) => posicao !== indice));
    this.sincronizarMudanca();
  }

  private sincronizarMudanca(): void {
    this.form.controls.mudanca.controls.moveis.setValue(this.mudancaItens());
    this.volumeMudanca.set(
      this.mudancaItens().reduce(
        (total, item) => total + item.quantidade * (item.volumeM3 ?? 0),
        0,
      ),
    );
  }

  async salvar(): Promise<void> {
    const atual = this.pedido();
    if (!atual?.id) {
      this.erro.set('Pedido inválido.');
      return;
    }

    const conteudoAtual = JSON.stringify(this.conteudoDoForm());
    if (conteudoAtual !== this.snapshotConteudo) {
      const mudouOutraCoisa = JSON.stringify({
        ...this.conteudoDoForm(),
        observacoesAdmin: undefined,
      }) !== JSON.stringify({
        ...JSON.parse(this.snapshotConteudo),
        observacoesAdmin: undefined,
      });
      if (mudouOutraCoisa && !window.confirm('Você está alterando informações importantes do pedido. Deseja continuar?')) return;
    }

    this.salvando.set(true);
    this.erro.set('');
    const v = this.form.getRawValue();
    const responsavel = this.responsavel();
    const alteracoes: Partial<PedidoModel> = {
      codigo: v.codigo.trim(),
      tipo: v.tipo,
      status: v.status,
      criadoEm: v.criadoEm ? new Date(`${v.criadoEm}T12:00:00`).toISOString() : atual.criadoEm,
      atualizadoEm: new Date().toISOString(),
      atualizadoPor: responsavel,
      observacoesAdmin: v.observacoesAdmin,
      contato: {
        nome: v.contato.nome.trim(),
        whatsapp: v.contato.whatsapp.trim(),
        email: v.contato.email.trim(),
      },
      origem: this.montarEndereco(v.origem),
      destino: this.montarEndereco(v.destino),
      planejamento: {
        data: v.planejamento.data,
        vistoria: v.planejamento.vistoria,
        observacoes: v.planejamento.observacoes,
      },
      fotos: v.fotos.split(/[\n,]/).map((foto) => foto.trim()).filter(Boolean),
    };

    if (v.tipo === 'frete') {
      alteracoes.carga = {
        tipo: v.carga.tipo,
        descricao: v.carga.descricao,
        comprimento: Number(v.carga.comprimento),
        largura: Number(v.carga.largura),
        altura: Number(v.carga.altura),
        peso: Number(v.carga.peso),
      };
      alteracoes.mudanca = undefined;
    } else {
      alteracoes.mudanca = {
        moveis: this.mudancaItens().filter((item) =>
          item.nome.trim() && item.quantidade > 0 && (item.volumeM3 ?? 0) > 0,
        ),
        volumeM3: this.volumeMudanca(),
        extras: v.mudanca.extras.split(/[\n,]/).map((extra) => extra.trim()).filter(Boolean),
      };
      alteracoes.carga = undefined;
    }

    try {
      await firstValueFrom(this.pedidos.atualizarPedido(atual.id, alteracoes));
      void this.router.navigate(['/admin/pedidos', v.codigo.trim()]);
    } catch {
      this.erro.set('Não foi possível salvar as alterações.');
    } finally {
      this.salvando.set(false);
    }
  }

  private conteudoDoForm() {
    const v = this.form.getRawValue();
    return {
      codigo: v.codigo, tipo: v.tipo, status: v.status, criadoEm: v.criadoEm,
      observacoesAdmin: v.observacoesAdmin,
      contato: v.contato, origem: v.origem, destino: v.destino,
      carga: v.carga, mudanca: v.mudanca, planejamento: v.planejamento, fotos: v.fotos,
    };
  }

  private montarEndereco(valor: {
    cep: string; rua: string; numero: string; complemento: string; bairro: string;
    cidade: string; uf: string; andar: string; elevador: string;
  }): Endereco {
    return {
      cep: valor.cep.trim(), rua: valor.rua.trim(), numero: valor.numero.trim(),
      complemento: valor.complemento.trim(), bairro: valor.bairro.trim(),
      cidade: valor.cidade.trim(), uf: valor.uf,
      andar: valor.andar.trim(), elevador: valor.elevador.trim(),
    };
  }

  private responsavel(): string {
    return this.autenticacao.email?.trim()
      || (typeof sessionStorage !== 'undefined' ? sessionStorage.getItem('eb_admin_email')?.trim() : '')
      || 'SISTEMA';
  }
}
