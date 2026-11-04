import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma_service';
import { ReportsService } from './reports_service';

describe('ReportsService', () => {
  let service: ReportsService;

  const day = new Date('2026-11-04T12:00:00.000Z');
  const sales = [
    {
      total: 2320,
      tax: 320,
      discount: 0,
      paymentMethod: 'cash',
      createdAt: day,
    },
    {
      total: 1000,
      tax: 0,
      discount: 100,
      paymentMethod: 'card',
      createdAt: day,
    },
  ];

  const lines = [
    {
      productId: 'p1',
      productName: 'Refresco',
      quantity: 2,
      subtotal: 2000,
    },
    {
      productId: 'p1',
      productName: 'Refresco',
      quantity: 1,
      subtotal: 1000,
    },
    {
      productId: 'p2',
      productName: 'Pan',
      quantity: 5,
      subtotal: 500,
    },
  ];

  const prismaMock = {
    sale: {
      findMany: jest.fn().mockResolvedValue(sales),
    },
    saleLine: {
      findMany: jest.fn().mockResolvedValue(lines),
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    prismaMock.sale.findMany.mockResolvedValue(sales);
    prismaMock.saleLine.findMany.mockResolvedValue(lines);

    const module = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: PrismaService, useValue: prismaMock },
      ],
    }).compile();
    service = module.get(ReportsService);
  });

  it('calcula totales del dashboard', async () => {
    const report = await service.dashboard({});
    expect(report.totals.tickets).toBe(2);
    expect(report.totals.revenue).toBe(3320);
    expect(report.totals.tax).toBe(320);
    expect(report.totals.discount).toBe(100);
    expect(report.totals.avgTicket).toBe(1660);
  });

  it('agrupa por día', async () => {
    const report = await service.dashboard({});
    expect(report.byDay).toHaveLength(1);
    expect(report.byDay[0].date).toBe('2026-11-04');
    expect(report.byDay[0].tickets).toBe(2);
    expect(report.byDay[0].revenue).toBe(3320);
  });

  it('agrupa por producto ordenado por ingreso', async () => {
    const report = await service.dashboard({});
    expect(report.byProduct[0].productId).toBe('p1');
    expect(report.byProduct[0].quantity).toBe(3);
    expect(report.byProduct[0].revenue).toBe(3000);
    expect(report.byProduct[1].productId).toBe('p2');
  });

  it('agrupa por método de pago', async () => {
    const report = await service.dashboard({});
    const cash = report.byPayment.find((row) => row.method === 'cash');
    const card = report.byPayment.find((row) => row.method === 'card');
    expect(cash?.tickets).toBe(1);
    expect(card?.tickets).toBe(1);
    expect(card?.revenue).toBe(1000);
  });

  it('devuelve ceros sin ventas', async () => {
    prismaMock.sale.findMany.mockResolvedValueOnce([]);
    prismaMock.saleLine.findMany.mockResolvedValueOnce([]);
    const report = await service.dashboard({});
    expect(report.totals.tickets).toBe(0);
    expect(report.totals.avgTicket).toBe(0);
    expect(report.byDay).toHaveLength(0);
  });
});
