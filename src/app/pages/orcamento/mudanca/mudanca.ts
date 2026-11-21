import { Component, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { startWith } from 'rxjs';

import { NovoPedido } from '../../../models/pedido';
import { FormularioPedido } from '../../../shared/formulario-pedido';
import { formatarData } from '../../../shared/mascaras';
import { COMODOS, TODOS_OS_MOVEIS, calcularVolume, contarItens } from '../../../shared/moveis';
import { aoMenosUmMovel, dataNaoPassada, digitos } from '../../../shared/validadores';

@Component({
  selector: 'app-mudanca',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './mudanca.html',
  styleUrl: './mudanca.css',
})
export class Mudanca extends FormularioPedido {
  readonly blocos = [
    { chave: 'origem' as const, titulo: 'Origem / endereço atual' },
    { chave: 'destino' as const, titulo: 'Destino • novo endereço' },
  ];

  readonly comodos = COMODOS;

  readonly extrasDisponiveis = [
    { chave: 'embalagem', rotulo: 'Consultar embalagem e proteção dos pertences' },
    { chave: 'montagem', rotulo: 'Consultar desmontagem e montagem de móveis' },
    { chave: 'especiais', rotulo: 'Preciso de orientação para itens especiais ou frágeis' },
  ];

  readonly form = this.fb.group({
    contato: this.fb.nonNullable.group({
      nome: ['', [Validators.required, Validators.minLength(3)]],
      whatsapp: ['', [Validators.required, digitos(10, 11)]],
      email: ['', [Validators.required, Validators.email]],
    }),
    origem: this.grupoEndereco(true),
    destino: this.grupoEndereco(true),
    moveis: this.fb.group(
      Object.fromEntries(
        TODOS_OS_MOVEIS.map((m) => [
          m.id,
          this.fb.nonNullable.group({ selecionado: false, quantidade: 0 }),
        ]),
      ),
      { validators: aoMenosUmMovel },
    ),
    extras: this.fb.nonNullable.group({ embalagem: false, montagem: false, especiais: false }),
    planejamento: this.fb.nonNullable.group({
      data: ['', [Validators.required, dataNaoPassada]],
      vistoria: [false],
      observacoes: [''],
    }),
  });

  private readonly alteracoes = toSignal(this.form.valueChanges.pipe(startWith(null)));

  private readonly quantidades = computed(() => {
    this.alteracoes();
    const v = this.form.getRawValue().moveis as Record<string, { quantidade: number }>;
    return Object.fromEntries(Object.entries(v).map(([id, m]) => [id, m.quantidade]));
  });

  readonly volume = computed(() => calcularVolume(this.quantidades()));
  readonly itens = computed(() => contarItens(this.quantidades()));

  readonly volumeTexto = computed(
    () =>
      this.volume().toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) +
      ' m³',
  );

  readonly itensTexto = computed(() => {
    const n = this.itens();
    if (n === 0) return 'nenhum item';
    return n === 1 ? '1 item' : `${n} itens`;
  });

  readonly resumo = computed(() => {
    this.alteracoes();
    const v = this.form.getRawValue();
    return {
      origem: this.cidadeUf(v.origem),
      destino: this.cidadeUf(v.destino),
      data: v.planejamento.data ? formatarData(v.planejamento.data) : 'A definir',
      volume: `${this.volumeTexto()} • ${this.itensTexto()}`,
    };
  });

  quantidade(id: string): number {
    return this.form.get(['moveis', id, 'quantidade'])?.value ?? 0;
  }

  aoMarcar(id: string, evento: Event): void {
    const grupo = this.form.get(['moveis', id]);
    if (!grupo) return;
    const marcado = (evento.target as HTMLInputElement).checked;
    grupo.get('selecionado')?.setValue(marcado);
    grupo.get('quantidade')?.setValue(marcado ? Math.max(1, this.quantidade(id)) : 0);
    this.form.get('moveis')?.markAsTouched();
  }

  alterarQuantidade(id: string, delta: number): void {
    const grupo = this.form.get(['moveis', id]);
    if (!grupo) return;
    const nova = Math.min(99, Math.max(0, this.quantidade(id) + delta));
    grupo.get('quantidade')?.setValue(nova);
    grupo.get('selecionado')?.setValue(nova > 0);
    this.form.get('moveis')?.markAsTouched();
  }

  get semMoveis(): boolean {
    const g = this.form.get('moveis');
    return !!g && g.hasError('semMoveis') && g.touched;
  }


  protected montarPedido(codigo: string, fotos: string[]): NovoPedido {
    const v = this.form.getRawValue();
    const moveis = TODOS_OS_MOVEIS.map((m) => ({
      id: m.id,
      nome: m.nome,
      quantidade: this.quantidade(m.id),
    })).filter((m) => m.quantidade > 0);

    const extras = this.extrasDisponiveis
      .filter((e) => v.extras[e.chave as keyof typeof v.extras])
      .map((e) => e.rotulo);

    return {
      codigo,
      tipo: 'mudanca',
      status: 'recebido',
      criadoEm: new Date().toISOString(),
      contato: v.contato,
      origem: this.endereco(v.origem, true),
      destino: this.endereco(v.destino, true),
      mudanca: { moveis, volumeM3: Number(this.volume().toFixed(2)), extras },
      planejamento: v.planejamento,
      fotos,
    };
  }

  protected montarMensagemWhatsapp(p: NovoPedido): string {
    const m = p.mudanca!;
    const linhas = [
      'Olá! Fiz uma solicitação de orçamento de *mudança residencial* no site da Expresso Baldim.',
      '',
      `*Código:* ${p.codigo}`,
      `*Nome:* ${p.contato.nome}`,
      `*Origem:* ${this.linhaEndereco(p.origem)} — andar: ${p.origem.andar}, elevador: ${p.origem.elevador}`,
      `*Destino:* ${this.linhaEndereco(p.destino)} — andar: ${p.destino.andar}, elevador: ${p.destino.elevador}`,
      `*Móveis:* ${m.moveis.map((x) => `${x.quantidade}x ${x.nome}`).join(', ')}`,
      `*Volume estimado:* ${m.volumeM3.toLocaleString('pt-BR')} m³`,
      `*Data desejada:* ${formatarData(p.planejamento.data)}`,
      `*Vistoria:* ${p.planejamento.vistoria ? 'quero solicitar' : 'não'}`,
    ];
    if (m.extras.length) linhas.push(`*Serviços extras:* ${m.extras.join('; ')}`);
    if (p.planejamento.observacoes) linhas.push(`*Observações:* ${p.planejamento.observacoes}`);
    if (p.fotos.length) linhas.push(`*Fotos enviadas pelo site:* ${p.fotos.length}`);
    return linhas.join('\n');
  }
}