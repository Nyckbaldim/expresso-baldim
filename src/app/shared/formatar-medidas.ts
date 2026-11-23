// Formatação de números no padrão brasileiro (vírgula decimal, ponto de milhar).

const INTEIRO = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const METROS = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 13000 → "13.000 kg" */
export function formatarPeso(kg: number): string {
  return `${INTEIRO.format(kg)} kg`;
}

/** 84 → "84 m³" */
export function formatarVolume(m3: number): string {
  return `${INTEIRO.format(m3)} m³`;
}

/** (11.6, 2.35, 2.96) → "11,60 × 2,35 × 2,96 m" */
export function formatarDimensoes(comprimentoM: number, larguraM: number, alturaM: number): string {
  return `${[comprimentoM, larguraM, alturaM].map((m) => METROS.format(m)).join(' × ')} m`;
}
