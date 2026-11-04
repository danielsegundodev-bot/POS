export type MovementType = 'in' | 'out' | 'adjustment';

export interface StockMovement {
  id: string;
  productId: string;
  product?: { id: string; sku: string; name: string };
  type: MovementType;
  quantity: number;
  reason?: string | null;
  createdAt: string;
}

export interface MovementQuery {
  productId?: string;
  page?: number;
  pageSize?: number;
}

export interface MovementInput {
  productId: string;
  type: MovementType;
  quantity: number;
  reason?: string;
}
