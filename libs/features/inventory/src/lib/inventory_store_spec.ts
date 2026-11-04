import { TestBed } from '@angular/core/testing';
import { InventoryApi, Page, StockMovement } from '@pos/data-access';
import { InventoryStore } from './inventory_store';

describe('InventoryStore', () => {
  const movement: StockMovement = {
    id: 'm1',
    productId: 'p1',
    product: { id: 'p1', sku: 'SKU-1', name: 'Refresco' },
    type: 'in',
    quantity: 5,
    reason: 'Compra',
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  const page: Page<StockMovement> = {
    items: [movement],
    total: 1,
    page: 1,
    pageSize: 20,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: InventoryApi,
          useValue: {
            listMovements: jest.fn().mockResolvedValue(page),
            createMovement: jest.fn().mockResolvedValue(movement),
          },
        },
      ],
    });
  });

  it('load llena los movimientos', async () => {
    const store = TestBed.inject(InventoryStore);
    await store.load();
    expect(store.movements()).toHaveLength(1);
    expect(store.total()).toBe(1);
  });

  it('save registra y recarga la lista', async () => {
    const store = TestBed.inject(InventoryStore);
    const api = TestBed.inject(InventoryApi);
    const ok = await store.save({
      productId: 'p1',
      type: 'in',
      quantity: 5,
      reason: 'Compra',
    });
    expect(ok).toBe(true);
    expect(api.createMovement).toHaveBeenCalled();
    expect(store.movements()).toHaveLength(1);
  });

  it('expone error cuando la carga falla', async () => {
    const api = TestBed.inject(InventoryApi);
    (api.listMovements as jest.Mock).mockRejectedValue(new Error('boom'));
    const store = TestBed.inject(InventoryStore);
    await store.load();
    expect(store.loadError()).toBe('boom');
    expect(store.isLoading()).toBe(false);
  });
});
