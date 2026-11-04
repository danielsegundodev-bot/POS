import { TaxRate } from './category';

export interface PosSettings {
  storeName: string;
  /** Código ISO 4217, p. ej. "MXN". */
  currency: string;
  taxRateDefault: TaxRate;
  ticketPrefix: string;
  lowStockThreshold: number;
}

export interface AppSettings {
  storeName: string;
  storeAddress: string;
  currency: string;
  taxLabel: string;
}

export type SettingsInput = Partial<AppSettings>;

export interface PublicUser {
  id: string;
  email: string;
  name: string;
  role: string;
  active?: boolean;
  createdAt?: string;
}

export interface UserInput {
  email: string;
  name: string;
  password?: string;
  role: string;
  active?: boolean;
}
