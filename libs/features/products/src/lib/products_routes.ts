import { Route } from '@angular/router';
import { ProductFormPageComponent } from './product_form_page/product_form_page';
import { ProductsPageComponent } from './products_page/products_page';

export const productsRoutes: Route[] = [
  {
    path: '',
    component: ProductsPageComponent,
    data: { title: 'Productos' },
  },
  {
    path: 'nuevo',
    component: ProductFormPageComponent,
    data: { title: 'Nuevo producto' },
  },
  {
    path: ':id',
    component: ProductFormPageComponent,
    data: { title: 'Editar producto' },
  },
];
