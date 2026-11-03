export interface Customer {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  address?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerQuery {
  search?: string;
  includeInactive?: boolean;
  page?: number;
  pageSize?: number;
}
