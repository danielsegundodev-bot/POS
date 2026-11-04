export type PaymentMethod = 'cash' | 'card' | 'transfer' | 'other';

export interface PaymentInfo {
  method: PaymentMethod;
  /** Importe recibido en efectivo (centavos); solo aplica para `cash`. */
  received?: number;
  change?: number;
}

export interface SaleLine {
  id: string;
  productId: string;
  /** Nombre del producto al momento de la venta (snapshot). */
  productName: string;
  quantity: number;
  unitPrice: number;
  /** Descuento total de la línea en centavos. */
  discount: number;
  /** Fracción impositiva al momento de la venta. */
  taxRate: number;
  subtotal: number;
  tax: number;
  total: number;
}

export interface Sale {
  id: string;
  /** Folio legible del ticket, p. ej. "T-000123". */
  folio: string;
  customerId?: string;
  customer?: { id: string; name: string };
  lines: SaleLine[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
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

export interface SaleLineInput {
  productId: string;
  quantity: number;
  /** Descuento total de la línea en centavos. */
  discount?: number;
}

export interface CreateSaleInput {
  lines: SaleLineInput[];
  payment: PaymentInfo;
  customerId?: string;
}
