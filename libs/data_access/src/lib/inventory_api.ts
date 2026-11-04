import { MovementInput, MovementQuery, Page, StockMovement } from './models';

export abstract class InventoryApi {
  abstract listMovements(query: MovementQuery): Promise<Page<StockMovement>>;
  abstract createMovement(input: MovementInput): Promise<StockMovement>;
}
