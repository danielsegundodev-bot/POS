import { InjectionToken } from '@angular/core';

/** Prefijo base de la API, p. ej. "/api". */
export const API_BASE_URL = new InjectionToken<string>('API_BASE_URL');

/** Cambia a `true` para servir datos de mocks sin backend. */
export const USE_MOCKS = new InjectionToken<boolean>('USE_MOCKS');
