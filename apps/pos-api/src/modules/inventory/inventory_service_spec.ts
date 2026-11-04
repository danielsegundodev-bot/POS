import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma_service';
import { InventoryService } from './inventory_service';
import { CreateMovementDto } from './dto/create_movement_dto';

describe('InventoryService', () => {
  let service: InventoryService;

  const product = {
    id: 'p1',
    sku: 'SKU-1',
    name: 'Refresco',
    stock: 10,
    trackStock: true,
    active: true,
  };

  const movement = {
    id: 'm1',
    productId: 'p1',
    type: 'in',
    quantity: 5,
    reason: null,
    createdAt: new Date(),
    product: { id: 'p1', sku: 'SKU-1', name: 'Refresco' },
  };

  const txMock = {
    product: {
      findUnique: jest.fn().mockResolvedValue(product),
      update: jest.fn().mockResolvedValue(product),
    },
    stockMovement: {
      create: jest.fn().mockResolvedValue(movement),
      findMany: jest.fn().mockResolvedValue([movement]),
      count: jest.fn().mockResolvedValue(1),
    },
  };

  const prismaMock = {
    ...txMock,
    $transaction: jest.fn(async (arg: unknown) => {
      if (typeof arg === 'function') {
        return (arg as (tx: typeof txMock) => unknown)(txMock);
      }
      return (arg as Promise<unknown>[]).reduce(
        async (acc, p) => [...(await acc), await p],
        Promise.resolve([] as unknown[]),
      );
    }),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(InventoryService);
  });

  it('lista movimientos paginados', async () => {
    const page = await service.findAll({ page: 1, pageSize: 10 });
    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(1);
  });

  it('entrada incrementa el stock', async () => {
    const dto: CreateMovementDto = {
      productId: 'p1',
      type: 'in',
      quantity: 5,
      reason: 'Compra',
    };
    await service.create(dto);
    expect(txMock.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stock: 15 } }),
    );
    expect(txMock.stockMovement.create).toHaveBeenCalled();
  });

  it('salida decrementa el stock', async () => {
    const dto: CreateMovementDto = {
      productId: 'p1',
      type: 'out',
      quantity: 3,
      reason: 'Merma',
    };
    await service.create(dto);
    expect(txMock.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stock: 7 } }),
    );
  });

  it('salida con stock insuficiente lanza BadRequest', async () => {
    const dto: CreateMovementDto = {
      productId: 'p1',
      type: 'out',
      quantity: 99,
    };
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(txMock.stockMovement.create).not.toHaveBeenCalled();
  });

  it('ajuste fija el stock al valor indicado', async () => {
    const dto: CreateMovementDto = {
      productId: 'p1',
      type: 'adjustment',
      quantity: 42,
      reason: 'Inventario físico',
    };
    await service.create(dto);
    expect(txMock.product.update).toHaveBeenCalledWith(
      expect.objectContaining({ data: { stock: 42 } }),
    );
  });

  it('producto inexistente lanza NotFound', async () => {
    txMock.product.findUnique.mockResolvedValueOnce(null);
    const dto: CreateMovementDto = {
      productId: 'nope',
      type: 'in',
      quantity: 1,
    };
    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });
});
