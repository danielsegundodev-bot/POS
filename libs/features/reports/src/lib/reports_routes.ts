import { Route } from '@angular/router';
import { DashboardPageComponent } from './dashboard_page/dashboard_page';

export const reportsRoutes: Route[] = [
  {
    path: '',
    component: DashboardPageComponent,
    data: { title: 'Reportes' },
  },
];
