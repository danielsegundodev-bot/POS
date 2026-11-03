import { TaxRate } from './category';

export interface PosSettings {
  storeName: string;
  /** Código ISO 4217, p. ej. "MXN". */
  currency: string;
  taxRateDefault: TaxRate;
  ticketPrefix: string;
  lowStockThreshold: number;
}
