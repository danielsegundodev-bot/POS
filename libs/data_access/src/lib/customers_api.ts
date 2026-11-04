import { Customer, CustomerQuery, Page } from './models';

export interface CustomerInput {
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  notes?: string;
  active?: boolean;
}

export abstract class CustomersApi {
  abstract list(query: CustomerQuery): Promise<Page<Customer>>;
  abstract get(id: string): Promise<Customer>;
  abstract create(input: CustomerInput): Promise<Customer>;
  abstract update(id: string, input: CustomerInput): Promise<Customer>;
  abstract remove(id: string): Promise<void>;
}
