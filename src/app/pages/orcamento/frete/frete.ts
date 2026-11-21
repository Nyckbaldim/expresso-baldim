import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { startWith } from 'rxjs';

import { NovoPedido } from '../../../models/pedido';
import { FormularioPedido } from '../../../shared/formulario-pedido';
import { formatarData } from '../../../shared/mascaras';
import { dataNaoPassada, digitos } from '../../../shared/validadores';

@Component({
  selector: 'app-frete',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './frete.html',
  styleUrl: './frete.css',
})
export class Frete extends FormularioPedido {
  readonly blocos = [
    { chave: 'origem' as const, titulo: 'Origem / onde buscar a carga' },
    { chave: 'destino' as const, titulo: 'Destino / onde entregar a carga' },
  ];

  readonly tiposCarga = [
    'Móveis e eletrodomésticos',
    'Eletrônicos',
    'Materiais de construção',
    'Caixas e volumes',
    'Mercadorias diversas',
    'Outro',
  ];

  readonly form = this.fb.group({
    contato: this.fb.nonNullable.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      whatsapp: ['', [Validators.required, digitos(10, 11)]],
      email: ['', [Validators.required, Validators.email]],
    }),
    carga: this.fb.group({
      tipo: this.fb.nonNullable.control('', Validators.required),
      descricao: this.fb.nonNullable.control('', Validators.required),
      comprimento: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.1)]),
      largura: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.1)]),
      altura: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.1)]),
      peso: this.fb.control<number | null>(null, [Validators.required, Validators.min(0.1)]),
    }),
    origem: this.grupoEndereco(),
    destino: this.grupoEndereco(),
    planejamento: this.fb.nonNullable.group({
      data: ['', [Validators.required, dataNaoPassada]],
      vistoria: [false],
      observacoes: [''],
    }),
  });

  private readonly alteracoes = toSignal(this.form.valueChanges.pipe(startWith(null)));

  readonly resumo = computed(() => {
    this.alteracoes();
    const v = this.form.getRawValue();
    return {
      origem: this.cidadeUf(v.origem),
      destino: this.cidadeUf(v.destino),
      data: v.planejamento.data ? formatarData(v.planejamento.data) : 'A definir',
      carga: v.carga.tipo || 'A descrever',
    };
  });

  protected montarPedido(codigo: string, fotos: string[]): NovoPedido {
    const v = this.form.getRawValue();
    return {
      codigo,
      tipo: 'frete',
      status: 'recebido',
      criadoEm: new Date().toISOString(),
      contato: v.contato,
      carga: {
        tipo: v.carga.tipo,
        descricao: v.carga.descricao,
        comprimento: Number(v.carga.comprimento),
        largura: Number(v.carga.largura),
        altura: Number(v.carga.altura),
        peso: Number(v.carga.peso),
      },
      origem: this.endereco(v.origem),
      destino: this.endereco(v.destino),
      planejamento: v.planejamento,
      fotos,
    };
  }

  protected montarMensagemWhatsapp(p: NovoPedido): string {
    const c = p.carga!;
    const linhas = [
      'Olá! Fiz uma solicitação de orçamento de *frete avulso* no site da Expresso Baldim.',
      '',
      `*Código:* ${p.codigo}`,
      `*Nome:* ${p.contato.nome}`,
      `*Carga:* ${c.tipo} — ${c.descricao}`,
      `*Medidas:* ${c.comprimento} x ${c.largura} x ${c.altura} cm, ${c.peso} kg`,
      `*Origem:* ${this.linhaEndereco(p.origem)}`,
      `*Destino:* ${this.linhaEndereco(p.destino)}`,
      `*Data desejada:* ${formatarData(p.planejamento.data)}`,
      `*Vistoria:* ${p.planejamento.vistoria ? 'quero solicitar' : 'não'}`,
    ];
    if (p.planejamento.observacoes) linhas.push(`*Observações:* ${p.planejamento.observacoes}`);
    if (p.fotos.length) linhas.push(`*Fotos enviadas pelo site:* ${p.fotos.length}`);
    return linhas.join('\n');
  }
}