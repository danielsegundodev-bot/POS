import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma_service';
import { ReportQueryDto } from './dto/report_query_dto';

export interface DashboardTotals {
  tickets: number;
  /** Suma de totales de venta en centavos. */
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
  /** Suma de subtotales de línea en centavos. */
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

function toDateBound(
  value: string | undefined,
  endOfDay: boolean,
): Date | undefined {
  if (!value) {
    return undefined;
  }
  const base = value.length === 10 ? `${value}T` : value;
  if (value.length === 10) {
    return endOfDay
      ? new Date(`${value}T23:59:59.999`)
      : new Date(`${value}T00:00:00.000`);
  }
  return new Date(base);
}

function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(query: ReportQueryDto): Promise<DashboardReport> {
    const from = toDateBound(query.from, false);
    const to = toDateBound(query.to, true);

    const where: Prisma.SaleWhereInput = {
      ...(from || to
        ? {
            createdAt: {
              ...(from ? { gte: from } : {}),
              ...(to ? { lte: to } : {}),
            },
          }
        : {}),
    };

    const sales = await this.prisma.sale.findMany({
      where,
      select: {
        total: true,
        tax: true,
        discount: true,
        paymentMethod: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    const lines = await this.prisma.saleLine.findMany({
      where: { sale: where },
      select: {
        productId: true,
        productName: true,
        quantity: true,
        subtotal: true,
      },
    });

    const tickets = sales.length;
    const revenue = sales.reduce((sum, sale) => sum + sale.total, 0);
    const tax = sales.reduce((sum, sale) => sum + sale.tax, 0);
    const discount = sales.reduce((sum, sale) => sum + sale.discount, 0);
    const avgTicket = tickets > 0 ? Math.round(revenue / tickets) : 0;

    const dayMap = new Map<string, DayRow>();
    const paymentMap = new Map<string, PaymentRow>();
    for (const sale of sales) {
      const key = toIsoDate(sale.createdAt);
      const day = dayMap.get(key) ?? { date: key, tickets: 0, revenue: 0 };
      day.tickets += 1;
      day.revenue += sale.total;
      dayMap.set(key, day);

      const pay = paymentMap.get(sale.paymentMethod) ?? {
        method: sale.paymentMethod,
        tickets: 0,
        revenue: 0,
      };
      pay.tickets += 1;
      pay.revenue += sale.total;
      paymentMap.set(sale.paymentMethod, pay);
    }

    const productMap = new Map<string, ProductRow>();
    for (const line of lines) {
      const row = productMap.get(line.productId) ?? {
        productId: line.productId,
        productName: line.productName,
        quantity: 0,
        revenue: 0,
      };
      row.quantity += line.quantity;
      row.revenue += line.subtotal;
      productMap.set(line.productId, row);
    }

    return {
      from: query.from ?? null,
      to: query.to ?? null,
      totals: { tickets, revenue, tax, discount, avgTicket },
      byDay: [...dayMap.values()].reverse(),
      byProduct: [...productMap.values()].sort((a, b) => b.revenue - a.revenue),
      byPayment: [...paymentMap.values()].sort((a, b) => b.revenue - a.revenue),
    };
  }
}
