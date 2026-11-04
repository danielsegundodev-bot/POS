import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiHttp, QueryParams } from './api_http';
import { Customer, CustomerQuery, Page } from './models';
import { CustomerInput, CustomersApi } from './customers_api';

@Injectable({ providedIn: 'root' })
export class HttpCustomersApi extends CustomersApi {
  private readonly http = inject(ApiHttp);

  override list(query: CustomerQuery): Promise<Page<Customer>> {
    const params: QueryParams = {
      search: query.search,
      includeInactive: query.includeInactive,
      page: query.page,
      pageSize: query.pageSize,
    };
    return firstValueFrom(this.http.get<Page<Customer>>('customers', params));
  }

  override get(id: string): Promise<Customer> {
    return firstValueFrom(this.http.get<Customer>(`customers/${id}`));
  }

  override create(input: CustomerInput): Promise<Customer> {
    return firstValueFrom(this.http.post<Customer>('customers', input));
  }

  override update(id: string, input: CustomerInput): Promise<Customer> {
    return firstValueFrom(this.http.patch<Customer>(`customers/${id}`, input));
  }

  override remove(id: string): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`customers/${id}`));
  }
}
