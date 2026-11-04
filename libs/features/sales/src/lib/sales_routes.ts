import { Route } from '@angular/router';
import { TerminalPageComponent } from './terminal_page/terminal_page';

export const salesRoutes: Route[] = [
  { path: '', pathMatch: 'full', redirectTo: 'terminal' },
  {
    path: 'terminal',
    component: TerminalPageComponent,
    data: { title: 'Terminal POS' },
  },
];
