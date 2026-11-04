import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Sale, SaleLine } from '@prisma/client';
import { PrismaService } from '../prisma/prisma_service';
import { CreateSaleDto, SaleQueryDto } from './dto/create_sale_dto';

export interface SalePage {
  items: Sale[];
  total: number;
  page: number;
  pageSize: number;
}

type ComputedLine = Omit<Prisma.SaleLineUncheckedCreateInput, 'saleId' | 'id'>;

export interface SaleDetail extends Sale {
  lines: SaleLine[];
  customer?: { id: string; name: string } | null;
}

const saleWithLines = {
  lines: true,
  customer: { select: { id: true, name: true } },
} as const;

@Injectable()
export class SalesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: SaleQueryDto): Promise<SalePage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.SaleWhereInput = {
      customerId: query.customerId,
      ...(query.from || query.to
        ? {
            createdAt: {
              ...(query.from ? { gte: new Date(query.from) } : {}),
              ...(query.to ? { lte: new Date(query.to) } : {}),
            },
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.sale.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.sale.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: string): Promise<SaleDetail> {
    const sale = await this.prisma.sale.findUnique({
      where: { id },
      include: saleWithLines,
    });
    if (!sale) {
      throw new NotFoundException('Venta no encontrada');
    }
    return sale;
  }

  async create(dto: CreateSaleDto, userId?: string): Promise<SaleDetail> {
    if (dto.customerId) {
      const customer = await this.prisma.customer.findUnique({
        where: { id: dto.customerId },
      });
      if (!customer || !customer.active) {
        throw new NotFoundException('Cliente no encontrado o inactivo');
      }
    }

    const productIds = [...new Set(dto.lines.map((line) => line.productId))];
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });
    const byId = new Map(products.map((product) => [product.id, product]));

    const computedLines: ComputedLine[] = [];
    let subtotal = 0;
    let tax = 0;
    let discount = 0;

    for (const line of dto.lines) {
      const product = byId.get(line.productId);
      if (!product) {
        throw new NotFoundException(
          `Producto no encontrado: ${line.productId}`,
        );
      }
      if (!product.active) {
        throw new BadRequestException(
          `El producto "${product.name}" no está activo`,
        );
      }

      const lineDiscount = line.discount ?? 0;
      const lineSubtotalBeforeTax = product.price * line.quantity;
      const lineSubtotal = lineSubtotalBeforeTax - lineDiscount;
      if (lineSubtotal < 0) {
        throw new BadRequestException(
          `Descuento inválido para el producto "${product.name}"`,
        );
      }
      const lineTax = Math.round(lineSubtotal * product.taxRate);
      const lineTotal = lineSubtotal + lineTax;

      subtotal += lineSubtotal;
      tax += lineTax;
      discount += lineDiscount;

      computedLines.push({
        productId: product.id,
        productName: product.name,
        quantity: line.quantity,
        unitPrice: product.price,
        discount: lineDiscount,
        taxRate: product.taxRate,
        subtotal: lineSubtotal,
        tax: lineTax,
        total: lineTotal,
      });
    }

    const total = subtotal + tax;

    if (dto.payment.method === 'cash') {
      if (dto.payment.received === undefined) {
        throw new BadRequestException(
          'El importe recibido es obligatorio en efectivo',
        );
      }
      if (dto.payment.received < total) {
        throw new BadRequestException(
          'El importe recibido es menor que el total',
        );
      }
    }

    await this.assertStock(productIds, dto.lines);

    return this.prisma.$transaction(async (tx) => {
      await this.decrementStock(tx, dto.lines);

      const count = await tx.sale.count();
      const folio = `T-${String(count + 1).padStart(6, '0')}`;
      const received = dto.payment.received ?? null;
      const change =
        dto.payment.method === 'cash' && received !== null
          ? received - total
          : null;

      const sale = await tx.sale.create({
        data: {
          folio,
          subtotal,
          tax,
          discount,
          total,
          paymentMethod: dto.payment.method,
          paymentReceived: received,
          paymentChange: change,
          userId: userId ?? null,
          customerId: dto.customerId ?? null,
          lines: { create: computedLines },
        },
        include: saleWithLines,
      });

      return sale;
    });
  }

  private async assertStock(
    productIds: string[],
    lines: CreateSaleDto['lines'],
  ): Promise<void> {
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: { id: true, name: true, trackStock: true, stock: true },
    });
    const byId = new Map(products.map((product) => [product.id, product]));

    for (const line of lines) {
      const product = byId.get(line.productId);
      if (product?.trackStock && product.stock < line.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.name}" (disponible: ${product.stock})`,
        );
      }
    }
  }

  private async decrementStock(
    tx: Prisma.TransactionClient,
    lines: CreateSaleDto['lines'],
  ): Promise<void> {
    for (const line of lines) {
      const product = await tx.product.findUnique({
        where: { id: line.productId },
      });
      if (!product || !product.trackStock) {
        continue;
      }
      if (product.stock < line.quantity) {
        throw new BadRequestException(
          `Stock insuficiente para "${product.name}"`,
        );
      }
      await tx.product.update({
        where: { id: product.id },
        data: { stock: product.stock - line.quantity },
      });
      await tx.stockMovement.create({
        data: {
          productId: product.id,
          type: 'out',
          quantity: line.quantity,
          reason: 'Venta',
        },
      });
    }
  }
}
