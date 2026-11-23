import { Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { startWith } from 'rxjs';

import { MovelPedido, NovoPedido } from '../../../models/pedido';
import { FormularioPedido } from '../../../shared/formulario-pedido';
import { formatarData } from '../../../shared/mascaras';
import { dataNaoPassada, digitos } from '../../../shared/validadores';

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

  readonly moveis = signal<MovelPedido[]>([]);
  readonly erroMoveis = signal('');

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
    moveis: this.fb.nonNullable.control<MovelPedido[]>([]),
    extras: this.fb.nonNullable.group({ embalagem: false, montagem: false, especiais: false }),
    planejamento: this.fb.nonNullable.group({
      data: ['', [Validators.required, dataNaoPassada]],
      vistoria: [false],
      observacoes: [''],
    }),
  });

  private readonly alteracoes = toSignal(this.form.valueChanges.pipe(startWith(null)));

  readonly volume = computed(() =>
    this.moveis().reduce(
      (total, movel) => total + (movel.quantidade * (movel.volumeM3 ?? 0)),
      0,
    ),
  );
  readonly itens = computed(() =>
    this.moveis().reduce((total, movel) => total + movel.quantidade, 0),
  );

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

  adicionarMovel(): void {
    const indice = this.moveis().length + 1;
    this.moveis.update((lista) => [
      ...lista,
      { id: `movel-${Date.now()}-${indice}`, nome: '', quantidade: 1, volumeM3: 0 },
    ]);
    this.sincronizarMoveis();
  }

  atualizarMovel(indice: number, campo: 'nome' | 'quantidade' | 'volumeM3', evento: Event): void {
    const input = evento.target as HTMLInputElement;
    const valor = campo === 'nome' ? input.value : Math.max(0, Number(input.value) || 0);
    this.moveis.update((lista) =>
      lista.map((movel, posicao) =>
        posicao === indice ? { ...movel, [campo]: valor } : movel,
      ),
    );
    this.sincronizarMoveis();
  }

  removerMovel(indice: number): void {
    this.moveis.update((lista) => lista.filter((_, posicao) => posicao !== indice));
    this.sincronizarMoveis();
  }

  private sincronizarMoveis(): void {
    this.form.controls.moveis.setValue(this.moveis());
    this.form.controls.moveis.markAsTouched();
    this.erroMoveis.set('');
  }



  protected montarPedido(codigo: string, fotos: string[]): NovoPedido {
    const v = this.form.getRawValue();
    const moveis = this.moveis().filter((movel) =>
      movel.nome.trim() && movel.quantidade > 0,
    );

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

  override async enviar(continuarNoWhatsapp = false): Promise<void> {
    if (this.enviando()) return;

    const problema = this.validarMoveis();
    this.erroMoveis.set(problema?.mensagem ?? '');
    if (!problema) {
      await super.enviar(continuarNoWhatsapp);
      return;
    }

    // Mostra os erros de todos os campos junto com o dos móveis e leva o foco ao primeiro problema da página.
    this.erroEnvio.set('');
    this.form.markAllAsTouched();
    const primeiroCampoInvalido = document.querySelector<HTMLElement>('.campo__controle.ng-invalid');
    (primeiroCampoInvalido ?? document.getElementById(problema.idFoco))?.focus();
  }

  /** Retorna o problema da lista de móveis (mensagem e campo a focar) ou `null` se estiver tudo certo. */
  private validarMoveis(): { mensagem: string; idFoco: string } | null {
    const lista = this.moveis();
    if (lista.length === 0) {
      return { mensagem: 'Adicione ao menos um item à mudança.', idFoco: 'moveis-adicionar' };
    }

    const indice = lista.findIndex(
      (movel) => !movel.nome.trim() || movel.quantidade < 1 || !movel.volumeM3 || movel.volumeM3 <= 0,
    );
    if (indice === -1) return null;

    const movel = lista[indice];
    const campo = !movel.nome.trim() ? 'nome' : movel.quantidade < 1 ? 'quantidade' : 'volume';
    return {
      mensagem: 'Preencha nome, quantidade e volume aproximado de todos os itens.',
      idFoco: `movel-${campo}-${indice}`,
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