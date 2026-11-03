import { HttpErrorResponse } from '@angular/common/http';

export type ApiErrorCode =
  'network' | 'timeout' | 'client' | 'server' | 'unknown';

export class ApiError extends Error {
  constructor(
    readonly code: ApiErrorCode,
    message: string,
    readonly status?: number,
    readonly details?: unknown,
  ) {
    super(message);
    this.name = 'ApiError';
  }

  static from(error: unknown): ApiError {
    if (error instanceof ApiError) {
      return error;
    }
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return new ApiError('network', 'No se pudo conectar con el servidor');
      }
      if (error.status === 408 || error.status === 504) {
        return new ApiError(
          'timeout',
          'La solicitud tardó demasiado',
          error.status,
        );
      }
      if (error.status >= 400 && error.status < 500) {
        const message =
          typeof error.error === 'object' &&
          error.error !== null &&
          'message' in error.error
            ? String((error.error as { message: unknown }).message)
            : 'Solicitud inválida';
        return new ApiError('client', message, error.status, error.error);
      }
      return new ApiError('server', 'Error interno del servidor', error.status);
    }
    if (error instanceof Error) {
      return new ApiError('unknown', error.message, undefined, error);
    }
    return new ApiError('unknown', 'Error desconocido', undefined, error);
  }
}
