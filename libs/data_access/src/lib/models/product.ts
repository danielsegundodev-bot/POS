import { Money } from '@pos/core';
import { TaxRate } from './category';

export interface Product {
  id: string;
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  /** Precio de venta en la unidad mínima (centavos). */
  price: Money;
  taxRate: TaxRate;
  trackStock: boolean;
  /** Existencias actuales (solo enteros). */
  stock: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductQuery {
  search?: string;
  categoryId?: string;
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}
