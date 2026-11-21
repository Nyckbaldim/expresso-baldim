export interface Movel {
  id: string;
  nome: string;
  volume: number;
}

export interface Comodo {
  titulo: string;
  itens: Movel[];
}

export const COMODOS: Comodo[] = [
  {
    titulo: 'Sala de estar e jantar',
    itens: [
      { id: 'sofa', nome: 'Sofá', volume: 1.5 },
      { id: 'mesa-jantar', nome: 'Mesa de jantar', volume: 0.8 },
      { id: 'cadeira', nome: 'Cadeira', volume: 0.15 },
      { id: 'rack', nome: 'Rack / estante', volume: 0.6 },
    ],
  },
  {
    titulo: 'Quartos',
    itens: [
      { id: 'cama', nome: 'Cama', volume: 1.2 },
      { id: 'guarda-roupa', nome: 'Guarda-roupa', volume: 1.5 },
      { id: 'comoda', nome: 'Cômoda', volume: 0.5 },
      { id: 'mesa-cabeceira', nome: 'Mesa de cabeceira', volume: 0.15 },
    ],
  },
  {
    titulo: 'Cozinha',
    itens: [
      { id: 'geladeira', nome: 'Geladeira', volume: 1.0 },
      { id: 'fogao', nome: 'Fogão', volume: 0.5 },
      { id: 'armario-cozinha', nome: 'Armário', volume: 0.8 },
      { id: 'mesa-cozinha', nome: 'Mesa', volume: 0.6 },
    ],
  },
  {
    titulo: 'Lavanderia e outros',
    itens: [
      { id: 'maquina-lavar', nome: 'Máquina de lavar', volume: 0.6 },
      { id: 'armario-multiuso', nome: 'Armário multiuso', volume: 0.9 },
      { id: 'escrivaninha', nome: 'Escrivaninha', volume: 0.5 },
      { id: 'caixas', nome: 'Caixas de pertences', volume: 0.1 },
    ],
  },
];

export const TODOS_OS_MOVEIS: Movel[] = COMODOS.flatMap((c) => c.itens);

export function calcularVolume(quantidades: Record<string, number>): number {
  return TODOS_OS_MOVEIS.reduce((soma, m) => soma + (quantidades[m.id] ?? 0) * m.volume, 0);
}

export function contarItens(quantidades: Record<string, number>): number {
  return TODOS_OS_MOVEIS.reduce((soma, m) => soma + (quantidades[m.id] ?? 0), 0);
}