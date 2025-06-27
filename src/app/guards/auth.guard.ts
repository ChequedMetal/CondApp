import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const usuario = localStorage.getItem('usuario');

  if (!usuario) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
