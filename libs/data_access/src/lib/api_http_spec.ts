import { HttpErrorResponse, provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { ApiError } from './api_error';
import { ApiHttp } from './api_http';
import { API_BASE_URL } from './tokens';

describe('ApiHttp', () => {
  let api: ApiHttp;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_BASE_URL, useValue: '/api' },
      ],
    });
    api = TestBed.inject(ApiHttp);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('resuelve la URL base y los query params', async () => {
    const promise = firstValueFrom(
      api.get('/products', { search: 'cafe', page: 1, inactive: undefined }),
    );
    const req = httpMock.expectOne('/api/products?search=cafe&page=1');
    expect(req.request.method).toBe('GET');
    req.flush({ items: [] });
    await promise;
  });

  it('normaliza errores HTTP a ApiError', async () => {
    const promise = firstValueFrom(api.post('/products', { name: 'x' }));
    const req = httpMock.expectOne('/api/products');
    req.flush(
      { message: 'SKU duplicado' },
      { status: 409, statusText: 'Conflict' },
    );
    await expect(promise).rejects.toMatchObject({
      name: 'ApiError',
      code: 'client',
      status: 409,
      message: 'SKU duplicado',
    } satisfies Partial<ApiError>);
  });
});
