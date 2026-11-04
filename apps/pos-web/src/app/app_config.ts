import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {
  API_BASE_URL,
  AuthApi,
  HttpAuthApi,
  HttpInventoryApi,
  HttpProductsApi,
  InventoryApi,
  ProductsApi,
  USE_MOCKS,
  authInterceptor,
} from '@pos/data-access';
import { appRoutes } from './app_routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(appRoutes),
    provideAnimationsAsync(),
    provideHttpClient(withInterceptors([authInterceptor])),
    { provide: API_BASE_URL, useValue: '/api' },
    { provide: USE_MOCKS, useValue: false },
    { provide: AuthApi, useExisting: HttpAuthApi },
    { provide: ProductsApi, useExisting: HttpProductsApi },
    { provide: InventoryApi, useExisting: HttpInventoryApi },
  ],
};
