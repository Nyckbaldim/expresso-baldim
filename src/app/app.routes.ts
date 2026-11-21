import { Routes } from '@angular/router';
import { SobreNos } from './pages/sobre-nos/sobre-nos';
import { Homepage } from './pages/homepage/homepage';
import { FrotaEServicos } from './pages/frota-e-servicos/frota-e-servicos';
import { Orcamento } from './pages/orcamento/orcamento';
import { Avaliar } from './pages/avaliar/avaliar';
import { Mudanca } from './pages/orcamento/mudanca/mudanca';
import { Frete } from './pages/orcamento/frete/frete';
import { PublicLayout } from './components/public-layout/public-layout';

export const routes: Routes = [
  {
    path: '',
    component: PublicLayout,
    children: [
      { path: '', component: Homepage },
      { path: 'sobre-nos', component: SobreNos },
      { path: 'frota-e-servicos', component: FrotaEServicos },
      { path: 'orcamento', component: Orcamento },
      { path: 'orcamento/frete', component: Frete},
      { path: 'orcamento/mudanca', component: Mudanca},
      { path: 'avaliar', component: Avaliar }
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then((m) => m.ADMIN_ROUTES),
  },
  { path: '**', redirectTo: '' }
];