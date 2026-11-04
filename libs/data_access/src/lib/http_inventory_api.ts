import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { ApiHttp, QueryParams } from './api_http';
import { InventoryApi } from './inventory_api';
import { MovementInput, MovementQuery, Page, StockMovement } from './models';

@Injectable({ providedIn: 'root' })
export class HttpInventoryApi extends InventoryApi {
  private readonly http = inject(ApiHttp);

  override listMovements(query: MovementQuery): Promise<Page<StockMovement>> {
    const params: QueryParams = {
      productId: query.productId,
      page: query.page,
      pageSize: query.pageSize,
    };
    return firstValueFrom(
      this.http.get<Page<StockMovement>>('inventory/movements', params),
    );
  }

  override createMovement(input: MovementInput): Promise<StockMovement> {
    return firstValueFrom(
      this.http.post<StockMovement>('inventory/movements', input),
    );
  }
}
