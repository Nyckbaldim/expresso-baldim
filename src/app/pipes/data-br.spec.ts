import { DataBr } from './data-br';

describe('DataBr', () => {
  const pipe = new DataBr();

  it('formata datas ISO para o padrão brasileiro', () => {
    expect(pipe.transform('2025-03-15')).toBe('15/03/2025');
  });

  it('usa o traço para datas ausentes', () => {
    expect(pipe.transform(null)).toBe('—');
  });
});
