import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiHttp, QueryParams } from './api_http';
import { Page, Product, ProductQuery } from './models';
import { ProductInput, ProductsApi } from './products_api';

@Injectable({ providedIn: 'root' })
export class HttpProductsApi extends ProductsApi {
  private readonly http = inject(ApiHttp);

  override list(query: ProductQuery): Promise<Page<Product>> {
    const params: QueryParams = {
      search: query.search,
      categoryId: query.categoryId,
      includeInactive: query.includeInactive ? 'true' : undefined,
      page: query.page,
      pageSize: query.pageSize,
    };
    return firstValueFrom(this.http.get<Page<Product>>('products', params));
  }

  override get(id: string): Promise<Product> {
    return firstValueFrom(this.http.get<Product>(`products/${id}`));
  }

  override create(input: ProductInput): Promise<Product> {
    return firstValueFrom(this.http.post<Product>('products', input));
  }

  override update(id: string, input: ProductInput): Promise<Product> {
    return firstValueFrom(this.http.patch<Product>(`products/${id}`, input));
  }

  override async remove(id: string): Promise<void> {
    await firstValueFrom(this.http.delete<{ id: string }>(`products/${id}`));
  }
}
