import { Component, computed, input, output } from '@angular/core';

type PageItem = number | 'gap-start' | 'gap-end';

/** Mesmo HTML no desktop e no mobile: o CSS decide se aparecem as páginas numeradas ou a barra Anterior/Próxima. */
@Component({
  imports: [],
  selector: 'eb-pagination',
  templateUrl: './pagination.html',
  styleUrl: './pagination.css',
})
export class Pagination {
  readonly page = input.required<number>();
  readonly pageSize = input.required<number>();
  readonly total = input.required<number>();
  readonly sizes = input<readonly number[]>([10, 20, 50]);
  readonly noun = input('pedidos');

  readonly pageChange = output<number>();
  readonly sizeChange = output<number>();

  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.total() / this.pageSize())));
  protected readonly from = computed(() => (this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1));
  protected readonly to = computed(() => Math.min(this.page() * this.pageSize(), this.total()));

  /** 1 … 4 5 6 … 12: sempre mostra a primeira, a última e a vizinhança da página atual. */
  protected readonly items = computed<PageItem[]>(() => {
    const last = this.totalPages();
    const current = this.page();
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);

    const set = new Set([1, last, current - 1, current, current + 1]);
    if (current <= 3) [2, 3, 4].forEach((n) => set.add(n));
    if (current >= last - 2) [last - 3, last - 2, last - 1].forEach((n) => set.add(n));

    const pages = [...set].filter((n) => n >= 1 && n <= last).sort((a, b) => a - b);
    const result: PageItem[] = [];
    pages.forEach((n, i) => {
      if (i > 0 && n - pages[i - 1] > 1) result.push(i === 1 ? 'gap-start' : 'gap-end');
      result.push(n);
    });
    return result;
  });

  protected onSize(event: Event): void {
    this.sizeChange.emit(Number((event.target as HTMLSelectElement).value));
  }
}
