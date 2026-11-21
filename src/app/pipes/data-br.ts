import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'dataBr',
})
export class DataBr implements PipeTransform {
  transform(value: string | null | undefined, vazio = '—'): string {
    if (!value) return vazio;
    const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    return match ? `${match[3]}/${match[2]}/${match[1]}` : value;
  }
}
