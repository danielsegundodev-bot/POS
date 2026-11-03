import { HttpErrorResponse } from '@angular/common/http';
import { ApiError } from './api_error';

describe('ApiError.from', () => {
  it('mapea fallos de red (status 0)', () => {
    const error = ApiError.from(new HttpErrorResponse({ status: 0 }));
    expect(error.code).toBe('network');
  });

  it('mapea errores 4xx como client con el mensaje del backend', () => {
    const error = ApiError.from(
      new HttpErrorResponse({
        status: 400,
        error: { message: 'SKU duplicado' },
      }),
    );
    expect(error.code).toBe('client');
    expect(error.status).toBe(400);
    expect(error.message).toBe('SKU duplicado');
  });

  it('mapea errores 5xx como server', () => {
    const error = ApiError.from(new HttpErrorResponse({ status: 500 }));
    expect(error.code).toBe('server');
  });

  it('mapea errores genéricos como unknown', () => {
    const error = ApiError.from('boom');
    expect(error.code).toBe('unknown');
  });

  it('preserva ApiError ya normalizado', () => {
    const original = new ApiError('client', 'dup', 409);
    expect(ApiError.from(original)).toBe(original);
  });
});
