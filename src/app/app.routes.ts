import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
    canActivate: [authGuard]
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then( m => m.LoginPage)
  },
  {
    path: 'gestionar-reclamos',
    loadComponent: () => import('./pages/gestionar-reclamos/gestionar-reclamos.page').then( m => m.GestionarReclamosPage)
  },
  {
    path: 'crear-usuarios',
    loadComponent: () => import('./pages/crear-usuarios/crear-usuarios.page').then( m => m.CrearUsuariosPage),
    canActivate: [authGuard]
  },
  {
    path: 'panel-admin',
    loadComponent: () => import('./pages/panel-admin/panel-admin.page').then( m => m.PanelAdminPage),
    canActivate: [authGuard]
  },
  {
    path: 'crear-anuncio',
    loadComponent: () => import('./pages/crear-anuncio/crear-anuncio.page').then( m => m.CrearAnuncioPage)
  },
  {
    path: 'crear-producto',
    loadComponent: () => import('./pages/crear-producto/crear-producto.page').then( m => m.CrearProductoPage)
  },
  {
    path: 'crear-reclamo',
    loadComponent: () => import('./pages/crear-reclamo/crear-reclamo.page').then( m => m.CrearReclamoPage)
  },
];

