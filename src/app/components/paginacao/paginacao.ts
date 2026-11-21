import { Component, computed, input, output } from '@angular/core';

type ItemPagina = number | 'lacuna-inicio' | 'lacuna-fim';

@Component({
  selector: 'eb-paginacao',
  templateUrl: './paginacao.html',
  styleUrl: './paginacao.css',
})
export class Paginacao {
  readonly pagina = input.required<number>();
  readonly tamanhoPagina = input.required<number>();
  readonly total = input.required<number>();
  readonly tamanhos = input<readonly number[]>([10, 20, 50]);
  readonly substantivo = input('pedidos');

  readonly mudouPagina = output<number>();
  readonly mudouTamanho = output<number>();

  protected readonly totalPaginas = computed(() => Math.max(1, Math.ceil(this.total() / this.tamanhoPagina())));
  protected readonly inicio = computed(() => (this.total() === 0 ? 0 : (this.pagina() - 1) * this.tamanhoPagina() + 1));
  protected readonly fim = computed(() => Math.min(this.pagina() * this.tamanhoPagina(), this.total()));

  protected readonly itens = computed<ItemPagina[]>(() => {
    const ultima = this.totalPaginas();
    const atual = this.pagina();
    if (ultima <= 7) return Array.from({ length: ultima }, (_, i) => i + 1);

    const conjunto = new Set([1, ultima, atual - 1, atual, atual + 1]);
    if (atual <= 3) [2, 3, 4].forEach((n) => conjunto.add(n));
    if (atual >= ultima - 2) [ultima - 3, ultima - 2, ultima - 1].forEach((n) => conjunto.add(n));

    const paginas = [...conjunto].filter((n) => n >= 1 && n <= ultima).sort((a, b) => a - b);
    const resultado: ItemPagina[] = [];
    paginas.forEach((n, i) => {
      if (i > 0 && n - paginas[i - 1] > 1) resultado.push(i === 1 ? 'lacuna-inicio' : 'lacuna-fim');
      resultado.push(n);
    });
    return resultado;
  });

  protected aoMudarTamanho(event: Event): void {
    this.mudouTamanho.emit(Number((event.target as HTMLSelectElement).value));
  }
}
