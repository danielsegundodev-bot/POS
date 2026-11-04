import { Route } from '@angular/router';
import { SettingsPageComponent } from './settings_page/settings_page';

export const settingsRoutes: Route[] = [
  {
    path: '',
    component: SettingsPageComponent,
    data: { title: 'Configuración' },
  },
];
