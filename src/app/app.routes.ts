import { Routes } from '@angular/router';
import { PublicLayout } from './components/public-layout/public-layout';
import { SobreNos } from './pages/sobre-nos/sobre-nos';
import { Homepage } from './pages/homepage/homepage';
import { FrotaEServicos } from './pages/frota-e-servicos/frota-e-servicos';
import { Orcamento } from './pages/orcamento/orcamento';
import { Avaliar } from './pages/avaliar/avaliar';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Homepage },            /* Início carrega a página sem redirecionar */
      { path: 'sobre-nos', component: SobreNos },
      { path: 'frota-e-servicos', component: FrotaEServicos },
      { path: 'orcamento', component: Orcamento },
      { path: 'avaliar', component: Avaliar },
    ],
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' }
];
