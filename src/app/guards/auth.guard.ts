import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  // Verificar si la ruta requiere un rol específico
  const requiredRoles = route.data?.['roles'] as string[];

  return authService.appUser$.pipe(
    take(1),
    map(user => {
      // Si no hay usuario, redirigir al login
      if (!user) {
        return router.createUrlTree(['/login']);
      }

      // Si la ruta no requiere roles específicos, permitir acceso
      if (!requiredRoles || requiredRoles.length === 0) {
        return true;
      }

      // Verificar si el usuario tiene alguno de los roles requeridos
      const hasRequiredRole = requiredRoles.some(role => user.role === role);
      
      if (hasRequiredRole) {
        return true;
      }

      // Si el usuario no tiene el rol requerido, redirigir a una página de no autorizado o al home
      return router.createUrlTree(['/home']);
    })
  );
};
