import { Routes } from '@angular/router';

import { AdminLayout } from '../../components/admin-layout/admin-layout';
import { authGuard } from '../../guards/auth-guard';
import { guestGuard } from '../../guards/guest-guard';

const pedidosPage = () => import('./pedidos/pedidos').then((m) => m.Pedidos);

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: 'login',
        canActivate: [guestGuard],
        title: 'Acesso administrativo | Expresso Baldim',
        loadComponent: () => import('./login/login').then((m) => m.Login),
      },
      { path: 'pedidos', canActivate: [authGuard], title: 'Painel de pedidos | Expresso Baldim', loadComponent: pedidosPage },
      { path: 'pedidos/:codigo', canActivate: [authGuard], title: 'Pedido | Expresso Baldim', loadComponent: pedidosPage },
      { path: '', pathMatch: 'full', redirectTo: 'pedidos' },
      { path: '**', redirectTo: 'pedidos' },
    ],
  },
];
