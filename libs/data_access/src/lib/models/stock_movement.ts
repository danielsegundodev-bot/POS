export type StockMovementType =
  'purchase' | 'sale' | 'adjustment' | 'return' | 'transfer';

export interface StockMovement {
  id: string;
  productId: string;
  type: StockMovementType;
  /** Cantidad con signo: positiva entra, negativa sale. */
  quantity: number;
  reason?: string;
  /** Referencia externa: folio de venta, orden de compra, etc. */
  reference?: string;
  userId?: string;
  createdAt: string;
}
