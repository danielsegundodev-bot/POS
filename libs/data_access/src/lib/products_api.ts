import { Page, Product, ProductQuery } from './models';

export interface ProductInput {
  sku: string;
  name: string;
  description?: string;
  categoryId?: string;
  price: number;
  taxRate: number;
  trackStock?: boolean;
  stock?: number;
  active?: boolean;
}

export abstract class ProductsApi {
  abstract list(query: ProductQuery): Promise<Page<Product>>;
  abstract get(id: string): Promise<Product>;
  abstract create(input: ProductInput): Promise<Product>;
  abstract update(id: string, input: ProductInput): Promise<Product>;
  abstract remove(id: string): Promise<void>;
}
