import { Pipe, PipeTransform } from '@angular/core';

/** Não usa o DatePipe porque ele converte "2026-11-28" com fuso horário e pode mostrar o dia anterior. */
@Pipe({
  name: 'brDate',
})
export class BrDatePipe implements PipeTransform {
  transform(value: string | null | undefined, empty = '—'): string {
    if (!value) return empty;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
  }
}
