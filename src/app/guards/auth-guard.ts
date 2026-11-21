import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { ADMIN_LOGIN } from '../constants';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(Auth);
  const router = inject(Router);
  return auth.isLoggedIn()
    ? true
    : router.createUrlTree([ADMIN_LOGIN], { queryParams: { returnUrl: state.url } });
};
