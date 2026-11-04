import { Route } from '@angular/router';
import { MovementFormPageComponent } from './movement_form_page/movement_form_page';
import { MovementsPageComponent } from './movements_page/movements_page';

export const inventoryRoutes: Route[] = [
  {
    path: '',
    component: MovementsPageComponent,
    data: { title: 'Inventario' },
  },
  {
    path: 'nuevo',
    component: MovementFormPageComponent,
    data: { title: 'Registrar movimiento' },
  },
];
