import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { PedidoService } from '../../../services/pedido';
import { Autenticacao } from '../../../services/autenticacao';
import { Endereco, MovelPedido, NovoPedido, ROTULO_STATUS, ROTULO_TIPO, STATUS_PEDIDO, TipoPedido, StatusPedido } from '../../../models/pedido';

@Component({
  selector: 'eb-adicionar-pedido',
  imports: [ReactiveFormsModule, RouterLink, DecimalPipe],
  templateUrl: './adicionar-pedido.html',
  styleUrl: './adicionar-pedido.css',
})
export class AdicionarPedido {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly pedidos = inject(PedidoService);
  private readonly autenticacao = inject(Autenticacao);
  private readonly router = inject(Router);

  readonly tipos = [
    { valor: 'frete' as TipoPedido, rotulo: ROTULO_TIPO.frete },
    { valor: 'mudanca' as TipoPedido, rotulo: ROTULO_TIPO.mudanca },
  ];
  readonly status = STATUS_PEDIDO.map((valor) => ({
    valor,
    rotulo: ROTULO_STATUS[valor],
  }));
  readonly ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

  readonly salvando = signal(false);
  readonly sucesso = signal<PedidoCriado | null>(null);
  readonly erro = signal('');
  readonly aba = signal<'status' | 'dados'>('status');
  readonly mudancaItens = signal<MovelPedido[]>([]);

  readonly form = this.fb.group({
    codigo: [''],
    tipo: ['frete' as TipoPedido],
    status: ['recebido' as StatusPedido],
    criadoEm: [''],
    observacoesAdmin: [''],
    contato: this.fb.group({
      nome: [''],
      whatsapp: [''],
      email: [''],
    }),
    origem: this.endereco(),
    destino: this.endereco(),
    carga: this.fb.group({
      tipo: [''],
      descricao: [''],
      comprimento: [null as number | null],
      largura: [null as number | null],
      altura: [null as number | null],
      peso: [null as number | null],
    }),
    mudanca: this.fb.group({
      moveis: this.fb.control<MovelPedido[]>([]),
      volumeM3: [null as number | null],
      extras: [''],
    }),
    planejamento: this.fb.group({
      data: [''],
      vistoria: [false],
      observacoes: [''],
    }),
    fotos: [''],
  });

  private endereco() {
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

  private gerarCodigo(): string {
    const aleatorio = Math.random().toString(36).slice(2, 7).toUpperCase();
    return `EB-${aleatorio.padEnd(5, '0')}`;
  }

  readonly volumeMudanca = signal(0);

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
    if (this.salvando()) return;
    this.salvando.set(true);
    this.erro.set('');
    this.sucesso.set(null);

    const v = this.form.getRawValue();
    const agora = new Date();
    const codigo = v.codigo.trim() || this.gerarCodigo();
    const responsavel = this.responsavel();
    const pedido: NovoPedido = {
      codigo,
      tipo: v.tipo,
      status: v.status,
      criadoEm: v.criadoEm ? new Date(`${v.criadoEm}T12:00:00`).toISOString() : agora.toISOString(),
      atualizadoEm: agora.toISOString(),
      criadoPor: responsavel,
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
      fotos: v.fotos
        .split(/[\n,]/)
        .map((foto) => foto.trim())
        .filter(Boolean),
    };

    if (v.tipo === 'frete') {
      const preenchido = v.carga.tipo || v.carga.descricao ||
        v.carga.comprimento !== null || v.carga.largura !== null ||
        v.carga.altura !== null || v.carga.peso !== null;
      if (preenchido) {
        pedido.carga = {
          tipo: v.carga.tipo,
          descricao: v.carga.descricao,
          comprimento: Number(v.carga.comprimento ?? 0),
          largura: Number(v.carga.largura ?? 0),
          altura: Number(v.carga.altura ?? 0),
          peso: Number(v.carga.peso ?? 0),
        };
      }
    } else {
      const moveis = this.mudancaItens().filter((item) =>
        item.nome.trim() && item.quantidade > 0 && (item.volumeM3 ?? 0) > 0,
      );
      const extras = v.mudanca.extras
        .split(/[\n,]/)
        .map((extra) => extra.trim())
        .filter(Boolean);
      if (moveis.length || v.mudanca.volumeM3 !== null || extras.length) {
        pedido.mudanca = {
          moveis,
          volumeM3: Number(this.volumeMudanca()),
          extras,
        };
      }
    }

    try {
      const criado = await firstValueFrom(this.pedidos.criar(pedido));
      this.sucesso.set({ codigo: criado.codigo, id: criado.id });
    } catch {
      this.erro.set('Não foi possível adicionar o pedido. Verifique os dados e tente novamente.');
    } finally {
      this.salvando.set(false);
    }
  }

  verPedido(): void {
    const codigo = this.sucesso()?.codigo;
    if (codigo) void this.router.navigate(['/admin/pedidos', codigo]);
  }

  novoPedido(): void {
    this.form.reset();
    this.mudancaItens.set([]);
    this.volumeMudanca.set(0);
    this.form.controls.tipo.setValue('frete');
    this.form.controls.status.setValue('recebido');
    this.sucesso.set(null);
  }

  private responsavel(): string {
    if (this.autenticacao.email?.trim()) return this.autenticacao.email.trim();
    try {
      return sessionStorage.getItem('eb_admin_email')?.trim() || 'SISTEMA';
    } catch {
      return 'SISTEMA';
    }
  }

  private montarEndereco(
    valor: {
      cep: string;
      rua: string;
      numero: string;
      complemento: string;
      bairro: string;
      cidade: string;
      uf: string;
      andar: string;
      elevador: string;
    },
  ): Endereco {
    return {
      cep: valor.cep.trim(),
      rua: valor.rua.trim(),
      numero: valor.numero.trim(),
      complemento: valor.complemento.trim(),
      bairro: valor.bairro.trim(),
      cidade: valor.cidade.trim(),
      uf: valor.uf,
      andar: valor.andar.trim(),
      elevador: valor.elevador.trim(),
    };
  }

}

interface PedidoCriado {
  codigo: string;
  id?: string;
}
