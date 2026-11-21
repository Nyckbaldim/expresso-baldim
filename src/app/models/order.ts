/** Os valores abaixo são sugestões: alinhe com a API de rastreio e a tabela SQL. */
export type OrderStatus = 'RECEBIDO' | 'EM_ANALISE' | 'EM_TRANSPORTE' | 'CONCLUIDO';
export type ServiceType = 'FRETE_AVULSO' | 'MUDANCA_RESIDENCIAL';

export const ORDER_STATUSES: OrderStatus[] = ['RECEBIDO', 'EM_ANALISE', 'EM_TRANSPORTE', 'CONCLUIDO'];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  RECEBIDO: 'Recebido',
  EM_ANALISE: 'Em análise',
  EM_TRANSPORTE: 'Em transporte',
  CONCLUIDO: 'Concluído',
};

export const SERVICE_LABEL: Record<ServiceType, string> = {
  FRETE_AVULSO: 'Frete avulso',
  MUDANCA_RESIDENCIAL: 'Mudança residencial',
};

export interface Order {
  /** Código alfanumérico mostrado ao cliente, ex.: EB-7K4M2 */
  code: string;
  customerName: string;
  service: ServiceType;
  origin: string;
  destination: string;
  volumeM3: number | null;
  /** Data no formato ISO (AAAA-MM-DD). Opcional: o cliente pode não informar. */
  desiredDate: string | null;
  status: OrderStatus;
}

export const PAGE_SIZES = [10, 20, 50] as const;
export const DEFAULT_PAGE_SIZE = 10;

/** Parâmetros da listagem. Vão para a API como ?pagina=&tamanho=&status=&busca= */
export interface OrderQuery {
  page: number;
  pageSize: number;
  status: OrderStatus | null;
  search: string;
}

/** total = quantidade de resultados do filtro, não só os da página. */
export interface Page<T> {
  items: T[];
  total: number;
}

/** Contadores do topo: contam todos os pedidos, independente da página e do filtro. */
export interface OrderSummary {
  novos: number;
  andamento: number;
  concluidos: number;
}
