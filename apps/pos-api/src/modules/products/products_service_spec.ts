import { NotFoundException, ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma_service';
import { ProductsService } from './products_service';
import { CreateProductDto } from './dto/create_product_dto';

describe('ProductsService', () => {
  let service: ProductsService;
  const product = {
    id: 'p1',
    sku: 'SKU-1',
    name: 'Refresco',
    description: null,
    categoryId: null,
    category: null,
    price: 1500,
    taxRate: 0.16,
    trackStock: false,
    stock: 0,
    active: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const prismaMock = {
    product: {
      findMany: jest.fn().mockResolvedValue([product]),
      findUnique: jest.fn().mockResolvedValue(product),
      count: jest.fn().mockResolvedValue(1),
      create: jest.fn().mockResolvedValue(product),
      update: jest.fn().mockResolvedValue(product),
    },
    category: {
      findUnique: jest.fn().mockResolvedValue({ id: 'c1', name: 'Bebidas' }),
    },
    $transaction: jest.fn().mockResolvedValue([[product], 1]),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(ProductsService);
  });

  it('lista productos paginados', async () => {
    const page = await service.findAll({ page: 1, pageSize: 10 });
    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(1);
    expect(page.page).toBe(1);
  });

  it('crea un producto con valores por defecto', async () => {
    prismaMock.product.findUnique.mockResolvedValueOnce(null);
    const dto: CreateProductDto = {
      sku: 'SKU-1',
      name: 'Refresco',
      price: 1500,
      taxRate: 0.16,
    };
    const created = await service.create(dto);
    expect(created.sku).toBe('SKU-1');
    expect(prismaMock.product.create).toHaveBeenCalled();
  });

  it('lanza ConflictException si el SKU ya existe', async () => {
    prismaMock.product.findUnique.mockResolvedValueOnce({
      ...product,
      id: 'otro',
    });
    const dto: CreateProductDto = {
      sku: 'SKU-1',
      name: 'Otro',
      price: 100,
      taxRate: 0,
    };
    await expect(service.create(dto)).rejects.toThrow(ConflictException);
  });

  it('lanza NotFoundException si el producto no existe', async () => {
    prismaMock.product.findUnique.mockResolvedValueOnce(null);
    await expect(service.findOne('nope')).rejects.toThrow(NotFoundException);
  });

  it('remove desactiva el producto (borrado lógico)', async () => {
    const result = await service.remove('p1');
    expect(result).toEqual({ id: 'p1' });
    expect(prismaMock.product.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'p1' },
        data: { active: false },
      }),
    );
  });
});
