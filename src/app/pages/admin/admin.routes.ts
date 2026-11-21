import { Routes } from '@angular/router';

import { AdminLayout } from '../../components/admin-layout/admin-layout';
import { guardaAutenticacao } from '../../guards/guarda-autenticacao';
import { guardaVisitante } from '../../guards/guarda-visitante';

const carregarPaginaPedidos = () => import('./pedidos/pedidos').then((modulo) => modulo.Pedidos);

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
      { path: 'pedidos/:codigo', canActivate: [guardaAutenticacao], title: 'Pedido | Expresso Baldim', loadComponent: carregarPaginaPedidos },
      { path: '', pathMatch: 'full', redirectTo: 'pedidos' },
      { path: '**', redirectTo: 'pedidos' },
    ],
  },
];
