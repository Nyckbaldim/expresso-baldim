import { Routes } from '@angular/router';

import { AdminLayout } from '../../components/admin-layout/admin-layout';
import { guardaAutenticacao } from '../../guards/guarda-autenticacao';
import { guardaVisitante } from '../../guards/guarda-visitante';

const carregarPaginaPedidos = () => import('./pedidos/pedidos').then((modulo) => modulo.Pedidos);
const carregarPaginaAvaliacoes = () => import('./avaliacoes/avaliacoes').then((modulo) => modulo.Avaliacoes);
const carregarAdicionarPedido = () => import('./adicionar-pedido/adicionar-pedido').then((modulo) => modulo.AdicionarPedido);
const carregarEditarPedido = () => import('./editar-pedido/editar-pedido').then((modulo) => modulo.EditarPedido);

export const ROTAS_ADMIN: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: 'login',
        canActivate: [guardaVisitante],
        title: 'Acesso administrativo | Expresso Baldim',
        loadComponent: () => import('./login/login').then((m) => m.Login),
      },
      { path: 'pedidos', canActivate: [guardaAutenticacao], title: 'Painel de pedidos | Expresso Baldim', loadComponent: carregarPaginaPedidos },
      { path: 'pedidos/adicionar', canActivate: [guardaAutenticacao], title: 'Adicionar pedido | Expresso Baldim', loadComponent: carregarAdicionarPedido },
      { path: 'pedidos/:codigo/editar', canActivate: [guardaAutenticacao], title: 'Editar pedido | Expresso Baldim', loadComponent: carregarEditarPedido },
      { path: 'pedidos/:codigo', canActivate: [guardaAutenticacao], title: 'Pedido | Expresso Baldim', loadComponent: carregarPaginaPedidos },
      { path: 'avaliacoes', canActivate: [guardaAutenticacao], title: 'Avaliações | Expresso Baldim', loadComponent: carregarPaginaAvaliacoes },
      { path: '', pathMatch: 'full', redirectTo: 'pedidos' },
      { path: '**', redirectTo: 'pedidos' },
    ],
  },
];
