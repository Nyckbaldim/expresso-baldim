import { Routes } from '@angular/router';

import { AdminLayout } from '../../components/admin-layout/admin-layout';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayout,
    children: [
      {
        path: 'login',
        title: 'Acesso administrativo | Expresso Baldim',
        loadComponent: () => import('./login/login').then((m) => m.Login),
      },
      { path: '', pathMatch: 'full', redirectTo: 'login' },
      { path: '**', redirectTo: 'login' },
    ],
  },
];
