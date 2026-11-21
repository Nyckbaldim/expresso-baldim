import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ROTA_LOGIN_ADMIN } from '../configuracao';
import { Autenticacao } from '../services/autenticacao';

export const guardaAutenticacao: CanActivateFn = (_route, state) => {
  const autenticacao = inject(Autenticacao);
  const roteador = inject(Router);
  return autenticacao.autenticado()
    ? true
    : roteador.createUrlTree([ROTA_LOGIN_ADMIN], { queryParams: { urlRetorno: state.url } });
};
