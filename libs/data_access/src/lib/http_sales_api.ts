import { Injectable, inject } from '@angular/core';
import { firstValueFrom, map } from 'rxjs';
import { ApiHttp, QueryParams } from './api_http';
import {
  CreateSaleInput,
  Page,
  PaymentInfo,
  Sale,
  SaleLine,
  SaleQuery,
} from './models';
import { SalesApi } from './sales_api';

interface SaleResponse {
  id: string;
  folio: string;
  customerId?: string | null;
  lines: SaleLine[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: string;
  paymentReceived?: number | null;
  paymentChange?: number | null;
  userId?: string | null;
  createdAt: string;
}

function toSale(response: SaleResponse): Sale {
  const payment: PaymentInfo = {
    method: response.paymentMethod as PaymentInfo['method'],
    received: response.paymentReceived ?? undefined,
    change: response.paymentChange ?? undefined,
  };
  return {
    id: response.id,
    folio: response.folio,
    customerId: response.customerId ?? undefined,
    lines: response.lines,
    subtotal: response.subtotal,
    tax: response.tax,
    discount: response.discount,
    total: response.total,
    payment,
    userId: response.userId ?? undefined,
    createdAt: response.createdAt,
  };
}

@Injectable({ providedIn: 'root' })
export class HttpSalesApi extends SalesApi {
  private readonly http = inject(ApiHttp);

  override list(query: SaleQuery): Promise<Page<Sale>> {
    const params: QueryParams = {
      from: query.from,
      to: query.to,
      page: query.page,
      pageSize: query.pageSize,
    };
    return firstValueFrom(
      this.http
        .get<Page<SaleResponse>>('sales', params)
        .pipe(map((page) => ({ ...page, items: page.items.map(toSale) }))),
    );
  }

  override get(id: string): Promise<Sale> {
    return firstValueFrom(
      this.http.get<SaleResponse>(`sales/${id}`).pipe(map(toSale)),
    );
  }

  override create(input: CreateSaleInput): Promise<Sale> {
    const body = {
      lines: input.lines.map((line) => ({
        productId: line.productId,
        quantity: line.quantity,
        discount: line.discount,
      })),
      payment: {
        method: input.payment.method,
        received: input.payment.received,
      },
    };
    return firstValueFrom(
      this.http.post<SaleResponse>('sales', body).pipe(map(toSale)),
    );
  }
}
