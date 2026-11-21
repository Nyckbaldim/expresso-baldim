import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ROTA_INICIO_ADMIN } from '../configuracao';
import { Autenticacao } from '../services/autenticacao';

export const guardaVisitante: CanActivateFn = () => {
  const autenticacao = inject(Autenticacao);
  const roteador = inject(Router);
  return autenticacao.autenticado() ? roteador.createUrlTree([ROTA_INICIO_ADMIN]) : true;
};
