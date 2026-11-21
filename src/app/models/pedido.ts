export type TipoPedido = 'frete' | 'mudanca';

export type StatusPedido =
  | 'recebido'
  | 'em_analise'
  | 'orcamento_enviado'
  | 'agendado'
  | 'concluido'
  | 'cancelado';

export const STATUS_PEDIDO: StatusPedido[] = [
  'recebido',
  'em_analise',
  'orcamento_enviado',
  'agendado',
  'concluido',
  'cancelado',
];

export const ROTULO_STATUS: Record<StatusPedido, string> = {
  recebido: 'Recebido',
  em_analise: 'Em análise',
  orcamento_enviado: 'Orçamento enviado',
  agendado: 'Agendado',
  concluido: 'Concluído',
  cancelado: 'Cancelado',
};

export const ROTULO_TIPO: Record<TipoPedido, string> = {
  frete: 'Frete',
  mudanca: 'Mudança',
};

export const TAMANHOS_PAGINA = [10, 20, 50] as const;
export const TAMANHO_PADRAO = 10;

export interface ConsultaPedidos {
  pagina: number;
  tamanho: number;
  status: StatusPedido | null;
  busca: string;
}

export interface Pagina<T> {
  itens: T[];
  total: number;
}

export interface ResumoPedidos {
  novos: number;
  andamento: number;
  concluidos: number;
}

export interface Contato {
  nome: string;
  whatsapp: string;
  email: string;
}

export interface Endereco {
  cep: string;
  rua: string;
  numero: string;
  complemento: string;
  bairro: string;
  cidade: string;
  uf: string;
  andar?: string;
  elevador?: string;
}

export interface Planejamento {
  data: string;
  vistoria: boolean;
  observacoes: string;
}

export interface CargaFrete {
  tipo: string;
  descricao: string;
  comprimento: number;
  largura: number;
  altura: number;
  peso: number;
}

export interface MovelPedido {
  id: string;
  nome: string;
  quantidade: number;
}

export interface DadosMudanca {
  moveis: MovelPedido[];
  volumeM3: number;
  extras: string[];
}

export interface Pedido {
  id?: string;
  codigo: string;
  tipo: TipoPedido;
  status: StatusPedido;
  criadoEm: string;
  contato: Contato;
  origem: Endereco;
  destino: Endereco;
  planejamento: Planejamento;
  fotos: string[];
  carga?: CargaFrete;
  mudanca?: DadosMudanca;
}

export type NovoPedido = Omit<Pedido, 'id'>;

export function cidadeDe(endereco: Endereco | undefined): string {
  return endereco?.cidade || '—';
}

export function volumeDe(pedido: Pedido): number | null {
  return pedido.mudanca?.volumeM3 ?? null;
}
