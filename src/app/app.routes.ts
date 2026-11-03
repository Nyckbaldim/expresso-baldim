import { Routes } from '@angular/router';
import { SobreNos } from './pages/sobre-nos/sobre-nos';
import { Homepage } from './pages/homepage/homepage';

export const routes: Routes = [
  { path: '', component: Homepage },            /* Início carrega a página sem redirecionar */
  { path: 'sobre-nos', component: SobreNos },
  { path: 'frota-e-servicos', component: SobreNos },
  { path: 'orcamento', component: SobreNos },
  { path: 'avaliacoes', component: SobreNos },
  { path: '**', redirectTo: '' }
];