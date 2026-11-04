import { Route } from '@angular/router';
import { LoginPageComponent, authGuard, guestGuard } from '@pos/features/auth';
import { PosShellComponent } from '@pos/shell';
import { PlaceholderPageComponent } from './pages/placeholder_page';

export const appRoutes: Route[] = [
  {
    path: 'login',
    component: LoginPageComponent,
    canActivate: [guestGuard],
    data: { title: 'Iniciar sesión' },
  },
  {
    path: '',
    component: PosShellComponent,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'inicio' },
      {
        path: 'inicio',
        component: PlaceholderPageComponent,
        data: { title: 'Inicio' },
      },
      {
        path: 'productos',
        loadChildren: () =>
          import('@pos/features/products').then((m) => m.productsRoutes),
      },
      {
        path: 'inventario',
        loadChildren: () =>
          import('@pos/features/inventory').then((m) => m.inventoryRoutes),
      },
      {
        path: 'ventas',
        loadChildren: () =>
          import('@pos/features/sales').then((m) => m.salesRoutes),
      },
      {
        path: 'clientes',
        loadChildren: () =>
          import('@pos/features/customers').then((m) => m.customersRoutes),
      },
      {
        path: 'reportes',
        component: PlaceholderPageComponent,
        data: { title: 'Reportes' },
      },
      {
        path: 'configuracion',
        component: PlaceholderPageComponent,
        data: { title: 'Configuración' },
      },
      { path: '**', redirectTo: 'inicio' },
    ],
  },
];
