import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { API_BASE_URL, USE_MOCKS } from '@pos/data-access';
import { appRoutes } from './app_routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    { provide: API_BASE_URL, useValue: '/api' },
    { provide: USE_MOCKS, useValue: false },
  ],
};
