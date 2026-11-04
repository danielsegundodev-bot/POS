import { TestBed } from '@angular/core/testing';
import { DashboardReport, ReportsApi } from '@pos/data-access';
import { ReportsStore } from './reports_store';

describe('ReportsStore', () => {
  const report: DashboardReport = {
    from: null,
    to: null,
    totals: {
      tickets: 2,
      revenue: 3320,
      tax: 320,
      discount: 100,
      avgTicket: 1660,
    },
    byDay: [{ date: '2026-11-04', tickets: 2, revenue: 3320 }],
    byProduct: [
      {
        productId: 'p1',
        productName: 'Refresco',
        quantity: 3,
        revenue: 3000,
      },
    ],
    byPayment: [
      { method: 'cash', tickets: 1, revenue: 2320 },
      { method: 'card', tickets: 1, revenue: 1000 },
    ],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ReportsApi,
          useValue: {
            dashboard: jest.fn().mockResolvedValue(report),
          },
        },
      ],
    });
  });

  it('load llena el reporte', async () => {
    const store = TestBed.inject(ReportsStore);
    await store.load();
    expect(store.totals()?.revenue).toBe(3320);
    expect(store.byDay()).toHaveLength(1);
    expect(store.hasData()).toBe(true);
  });

  it('expone error cuando falla', async () => {
    const api = TestBed.inject(ReportsApi);
    (api.dashboard as jest.Mock).mockRejectedValue(new Error('boom'));
    const store = TestBed.inject(ReportsStore);
    await store.load();
    expect(store.loadError()).toBe('boom');
  });

  it('applyRange recarga con el rango', async () => {
    const store = TestBed.inject(ReportsStore);
    const api = TestBed.inject(ReportsApi);
    store.setFrom('2026-11-01');
    store.setTo('2026-11-04');
    await store.applyRange();
    expect(api.dashboard).toHaveBeenCalledWith({
      from: '2026-11-01',
      to: '2026-11-04',
    });
  });
});
