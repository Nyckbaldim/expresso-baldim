import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  ConsultaPedidos,
  NovoPedido,
  Pagina,
  Pedido,
  ResumoPedidos,
  StatusPedido,
} from '../models/pedido';

const normalizar = (texto: string) =>
  texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

const EM_ANDAMENTO: StatusPedido[] = ['em_analise', 'orcamento_enviado', 'agendado'];

@Service()
export class PedidoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/pedidos`;

  listar() {
    return this.http.get<Pedido[]>(this.url, {
      params: new HttpParams().set('_sort', '-criadoEm'),
    });
  }

  consultar(consulta: ConsultaPedidos): Observable<Pagina<Pedido>> {
    return this.listar().pipe(map((lista) => this.paginar(lista, consulta)));
  }

  resumo(): Observable<ResumoPedidos> {
    return this.listar().pipe(
      map((lista) => ({
        novos: lista.filter((pedido) => pedido.status === 'recebido').length,
        andamento: lista.filter((pedido) => EM_ANDAMENTO.includes(pedido.status)).length,
        concluidos: lista.filter((pedido) => pedido.status === 'concluido').length,
      })),
    );
  }

  buscarPorCodigo(codigo: string) {
    return this.http.get<Pedido[]>(this.url, {
      params: new HttpParams().set('codigo', codigo),
    });
  }

  obter(codigo: string): Observable<Pedido> {
    return this.buscarPorCodigo(codigo).pipe(
      map((lista) => {
        const pedido = lista[0];
        if (!pedido) throw new HttpErrorResponse({ status: 404 });
        return pedido;
      }),
    );
  }

  criar(pedido: NovoPedido) {
    return this.http.post<Pedido>(this.url, pedido);
  }

  atualizarStatus(id: string, status: StatusPedido, atualizadoPor?: string) {
    let responsavel = atualizadoPor?.trim();
    if (!responsavel) {
      try {
        responsavel = sessionStorage.getItem('eb_admin_email')?.trim() || 'SISTEMA';
      } catch {
        responsavel = 'SISTEMA';
      }
    }
    return this.http.patch<Pedido>(`${this.url}/${encodeURIComponent(id)}`, {
      status,
      atualizadoEm: new Date().toISOString(),
      atualizadoPor: responsavel,
    });
  }

  atualizarPedido(id: string, alteracoes: Partial<Pedido>) {
    return this.http.patch<Pedido>(`${this.url}/${encodeURIComponent(id)}`, alteracoes);
  }

  private paginar(lista: Pedido[], consulta: ConsultaPedidos): Pagina<Pedido> {
    const busca = normalizar(consulta.busca).trim();
    const filtrados = lista.filter((pedido) => {
      const statusOk = !consulta.status || pedido.status === consulta.status;
      const nome = normalizar(pedido.contato.nome);
      const codigo = normalizar(pedido.codigo);
      const buscaOk = !busca || codigo.includes(busca) || nome.includes(busca);
      return statusOk && buscaOk;
    });
    const inicio = (consulta.pagina - 1) * consulta.tamanho;
    return { itens: filtrados.slice(inicio, inicio + consulta.tamanho), total: filtrados.length };
  }
}
