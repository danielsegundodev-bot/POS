export interface DashboardTotals {
  tickets: number;
  revenue: number;
  tax: number;
  discount: number;
  avgTicket: number;
}

export interface DayRow {
  date: string;
  tickets: number;
  revenue: number;
}

export interface ProductRow {
  productId: string;
  productName: string;
  quantity: number;
  revenue: number;
}

export interface PaymentRow {
  method: string;
  tickets: number;
  revenue: number;
}

export interface DashboardReport {
  from: string | null;
  to: string | null;
  totals: DashboardTotals;
  byDay: DayRow[];
  byProduct: ProductRow[];
  byPayment: PaymentRow[];
}

export interface ReportQuery {
  from?: string;
  to?: string;
}
