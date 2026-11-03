import { Money } from '@pos/core';
import { TaxRate } from './category';

export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

export interface PaymentInfo {
  method: PaymentMethod;
  /** Importe recibido en efectivo (centavos); solo aplica para `cash`. */
  received?: Money;
  change?: Money;
}

export interface SaleLine {
  id: string;
  productId: string;
  /** Nombre del producto al momento de la venta (snapshot). */
  productName: string;
  quantity: number;
  unitPrice: Money;
  /** Descuento total de la línea en centavos. */
  discount: Money;
  taxRate: TaxRate;
  subtotal: Money;
  tax: Money;
  total: Money;
}

export interface Sale {
  id: string;
  /** Folio legible del ticket, p. ej. "T-000123". */
  folio: string;
  customerId?: string;
  lines: SaleLine[];
  subtotal: Money;
  tax: Money;
  discount: Money;
  total: Money;
  payment: PaymentInfo;
  userId?: string;
  createdAt: string;
}

export interface SaleQuery {
  from?: string;
  to?: string;
  customerId?: string;
  page?: number;
  pageSize?: number;
}
