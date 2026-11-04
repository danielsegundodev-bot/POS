import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma_service';
import { CreateSaleDto } from './dto/create_sale_dto';
import { SalesService } from './sales_service';

describe('SalesService', () => {
  let service: SalesService;

  const product = {
    id: 'p1',
    sku: 'SKU-1',
    name: 'Refresco',
    price: 1000,
    taxRate: 0.16,
    trackStock: true,
    stock: 10,
    active: true,
  };

  const createdSale = {
    id: 's1',
    folio: 'T-000001',
    subtotal: 2000,
    tax: 320,
    discount: 0,
    total: 2320,
    paymentMethod: 'cash',
    paymentReceived: 2500,
    paymentChange: 180,
    userId: null,
    createdAt: new Date(),
    lines: [
      {
        id: 'l1',
        saleId: 's1',
        productId: 'p1',
        productName: 'Refresco',
        quantity: 2,
        unitPrice: 1000,
        discount: 0,
        taxRate: 0.16,
        subtotal: 2000,
        tax: 320,
        total: 2320,
      },
    ],
  };

  const txMock = {
    product: {
      findMany: jest.fn().mockResolvedValue([product]),
      findUnique: jest.fn().mockResolvedValue(product),
      update: jest.fn().mockResolvedValue(product),
    },
    sale: {
      create: jest.fn().mockResolvedValue(createdSale),
      count: jest.fn().mockResolvedValue(0),
      findMany: jest.fn().mockResolvedValue([createdSale]),
      findUnique: jest.fn().mockResolvedValue(createdSale),
    },
    stockMovement: {
      create: jest.fn().mockResolvedValue({}),
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

  const validDto: CreateSaleDto = {
    lines: [{ productId: 'p1', quantity: 2 }],
    payment: { method: 'cash', received: 2500 },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    txMock.product.findMany.mockResolvedValue([product]);
    txMock.product.findUnique.mockResolvedValue(product);
    txMock.sale.count.mockResolvedValue(0);
    txMock.sale.create.mockResolvedValue(createdSale);

    const module = await Test.createTestingModule({
      providers: [
        SalesService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(SalesService);
  });

  it('crea una venta con totales calculados en el servidor', async () => {
    const sale = await service.create(validDto, 'user-1');
    expect(sale.folio).toBe('T-000001');
    expect(txMock.sale.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          subtotal: 2000,
          tax: 320,
          total: 2320,
          paymentReceived: 2500,
          paymentChange: 180,
          userId: 'user-1',
        }),
      }),
    );
    expect(txMock.stockMovement.create).toHaveBeenCalledWith({
      data: {
        productId: 'p1',
        type: 'out',
        quantity: 2,
        reason: 'Venta',
      },
    });
  });

  it('rechaza efectivo recibido menor que el total', async () => {
    const dto: CreateSaleDto = {
      lines: [{ productId: 'p1', quantity: 2 }],
      payment: { method: 'cash', received: 100 },
    };
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
    expect(txMock.sale.create).not.toHaveBeenCalled();
  });

  it('rechaza stock insuficiente', async () => {
    txMock.product.findMany.mockResolvedValue([{ ...product, stock: 1 }]);
    txMock.product.findUnique.mockResolvedValue({ ...product, stock: 1 });
    const dto: CreateSaleDto = {
      lines: [{ productId: 'p1', quantity: 5 }],
      payment: { method: 'card' },
    };
    await expect(service.create(dto)).rejects.toThrow(BadRequestException);
  });

  it('rechaza producto inexistente', async () => {
    txMock.product.findMany.mockResolvedValue([]);
    const dto: CreateSaleDto = {
      lines: [{ productId: 'nope', quantity: 1 }],
      payment: { method: 'card' },
    };
    await expect(service.create(dto)).rejects.toThrow(NotFoundException);
  });

  it('lista ventas paginadas', async () => {
    txMock.sale.findMany.mockResolvedValue([createdSale]);
    txMock.sale.count.mockResolvedValue(1);
    const page = await service.findAll({ page: 1, pageSize: 10 });
    expect(page.items).toHaveLength(1);
    expect(page.total).toBe(1);
  });
});
