import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { Product } from '@prisma/client';
import { PrismaService } from '../prisma/prisma_service';
import { CreateProductDto } from './dto/create_product_dto';
import { ProductQueryDto } from './dto/product_query_dto';
import { UpdateProductDto } from './dto/update_product_dto';

export interface ProductPage {
  items: Product[];
  total: number;
  page: number;
  pageSize: number;
}

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ProductQueryDto): Promise<ProductPage> {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where = {
      active: query.includeInactive ? undefined : true,
      categoryId: query.categoryId,
      ...(query.search
        ? {
            OR: [
              { name: { contains: query.search } },
              { sku: { contains: query.search } },
            ],
          }
        : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({
        where,
        orderBy: { name: 'asc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: { category: true },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, pageSize };
  }

  async findOne(id: string): Promise<Product> {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { category: true },
    });
    if (!product) {
      throw new NotFoundException('Producto no encontrado');
    }
    return product;
  }

  async create(dto: CreateProductDto): Promise<Product> {
    await this.assertSkuFree(dto.sku);
    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId);
    }
    return this.prisma.product.create({
      data: {
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        price: dto.price,
        taxRate: dto.taxRate,
        trackStock: dto.trackStock ?? false,
        stock: dto.stock ?? 0,
        active: dto.active ?? true,
      },
      include: { category: true },
    });
  }

  async update(id: string, dto: UpdateProductDto): Promise<Product> {
    await this.findOne(id);
    if (dto.sku) {
      await this.assertSkuFree(dto.sku, id);
    }
    if (dto.categoryId) {
      await this.assertCategoryExists(dto.categoryId);
    }
    return this.prisma.product.update({
      where: { id },
      data: {
        sku: dto.sku,
        name: dto.name,
        description: dto.description,
        categoryId: dto.categoryId,
        price: dto.price,
        taxRate: dto.taxRate,
        trackStock: dto.trackStock,
        stock: dto.stock,
        active: dto.active,
      },
      include: { category: true },
    });
  }

  async remove(id: string): Promise<{ id: string }> {
    await this.findOne(id);
    await this.prisma.product.update({
      where: { id },
      data: { active: false },
    });
    return { id };
  }

  private async assertSkuFree(sku: string, ignoreId?: string): Promise<void> {
    const existing = await this.prisma.product.findUnique({
      where: { sku },
    });
    if (existing && existing.id !== ignoreId) {
      throw new ConflictException('Ya existe un producto con ese SKU');
    }
  }

  private async assertCategoryExists(categoryId: string): Promise<void> {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });
    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }
  }
}
