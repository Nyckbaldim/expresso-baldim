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
      { path: '', component: Homepage, title: 'Expresso Baldim | Transportes e Mudanças' },
      { path: 'sobre-nos', component: SobreNos, title: 'Sobre nós | Expresso Baldim' },
      { path: 'frota-e-servicos', component: FrotaEServicos, title: 'Frota e serviços | Expresso Baldim' },
      { path: 'orcamento', component: Orcamento, title: 'Orçamento | Expresso Baldim' },
      { path: 'orcamento/frete', component: Frete, title: 'Orçamento de frete avulso | Expresso Baldim' },
      { path: 'orcamento/mudanca', component: Mudanca, title: 'Orçamento de mudança residencial | Expresso Baldim' },
      { path: 'avaliar', component: Avaliar, title: 'Avaliar serviço | Expresso Baldim' },
      { path: 'rastrear-pedido', component: RastrearPedido, title: 'Rastrear pedido | Expresso Baldim' }
    ]
  },
  {
    path: 'admin',
    loadChildren: () => import('./pages/admin/admin.routes').then((modulo) => modulo.ROTAS_ADMIN),
  },
  { path: '**', redirectTo: '' }
];
