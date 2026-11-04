import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { StockMovement } from '@prisma/client';
import { PrismaService } from '../prisma/prisma_service';
import { CreateMovementDto } from './dto/create_movement_dto';
import { MovementQueryDto } from './dto/movement_query_dto';

export interface MovementPage {
  items: (StockMovement & {
    product: { id: string; sku: string; name: string };
  })[];
  total: number;
  page: number;
  pageSize: number;
}

const movementInclude = {
  product: { select: { id: true, sku: true, name: true } },
} as const;

@Injectable()
export class InventoryService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: MovementQueryDto): Promise<MovementPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = query.productId ? { productId: query.productId } : {};

    const [items, total] = await this.prisma.$transaction([
      this.prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: movementInclude,
      }),
      this.prisma.stockMovement.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async create(dto: CreateMovementDto): Promise<StockMovement> {
    return this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });
      if (!product) {
        throw new NotFoundException('Producto no encontrado');
      }

      const nextStock = this.computeNextStock(
        product.stock,
        dto.type,
        dto.quantity,
      );

      const movement = await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          type: dto.type,
          quantity: dto.quantity,
          reason: dto.reason,
        },
        include: movementInclude,
      });

      await tx.product.update({
        where: { id: dto.productId },
        data: { stock: nextStock },
      });

      return movement;
    });
  }

  private computeNextStock(
    current: number,
    type: CreateMovementDto['type'],
    quantity: number,
  ): number {
    if (type === 'in') {
      if (quantity <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor a cero');
      }
      return current + quantity;
    }
    if (type === 'out') {
      if (quantity <= 0) {
        throw new BadRequestException('La cantidad debe ser mayor a cero');
      }
      if (quantity > current) {
        throw new BadRequestException(
          'Stock insuficiente para la salida solicitada',
        );
      }
      return current - quantity;
    }
    return quantity;
  }
}
