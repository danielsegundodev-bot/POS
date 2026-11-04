import { Route } from '@angular/router';
import { CustomerFormPageComponent } from './customer_form_page/customer_form_page';
import { CustomersPageComponent } from './customers_page/customers_page';

export const customersRoutes: Route[] = [
  {
    path: '',
    component: CustomersPageComponent,
    data: { title: 'Clientes' },
  },
  {
    path: 'nuevo',
    component: CustomerFormPageComponent,
    data: { title: 'Nuevo cliente' },
  },
  {
    path: ':id',
    component: CustomerFormPageComponent,
    data: { title: 'Editar cliente' },
  },
];
