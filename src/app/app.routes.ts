import { Routes } from '@angular/router';
import { PublicLayout } from './components/public-layout/public-layout';
import { SobreNos } from './pages/sobre-nos/sobre-nos';
import { Homepage } from './pages/homepage/homepage';
import { FrotaEServicos } from './pages/frota-e-servicos/frota-e-servicos';
import { Orcamento } from './pages/orcamento/orcamento';
import { Avaliar } from './pages/avaliar/avaliar';
import { Mudanca } from './pages/orcamento/mudanca/mudanca';
import { Frete } from './pages/orcamento/frete/frete';
import { RastrearPedido } from './pages/rastrear-pedido/rastrear-pedido';

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
      { path: 'avaliar', component: Avaliar },
      { path: 'rastrear-pedido', component: RastrearPedido }
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then((modulo) => modulo.ROTAS_ADMIN),
  },
  { path: '**', redirectTo: '' }
];
