import { CreateSaleInput, Page, Sale, SaleQuery } from './models';

export abstract class SalesApi {
  abstract list(query: SaleQuery): Promise<Page<Sale>>;
  abstract get(id: string): Promise<Sale>;
  abstract create(input: CreateSaleInput): Promise<Sale>;
}
