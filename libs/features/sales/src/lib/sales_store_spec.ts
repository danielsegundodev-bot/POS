import { TestBed } from '@angular/core/testing';
import { SalesApi, Sale } from '@pos/data-access';
import { Product } from '@pos/data-access';
import { SalesStore } from './sales_store';

describe('SalesStore', () => {
  const product: Product = {
    id: 'p1',
    sku: 'SKU-1',
    name: 'Refresco',
    price: 1000,
    taxRate: 0.16,
    trackStock: true,
    stock: 10,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const sale: Sale = {
    id: 's1',
    folio: 'T-000001',
    lines: [],
    subtotal: 2000,
    tax: 320,
    discount: 0,
    total: 2320,
    payment: { method: 'cash', received: 2500, change: 180 },
    createdAt: '2026-01-01T00:00:00.000Z',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SalesApi,
          useValue: {
            create: jest.fn().mockResolvedValue(sale),
            list: jest.fn(),
            get: jest.fn(),
          },
        },
      ],
    });
  });

  it('agrega productos al carrito', () => {
    const store = TestBed.inject(SalesStore);
    store.addProduct(product);
    store.addProduct(product);
    expect(store.lines()).toHaveLength(1);
    expect(store.lines()[0].quantity).toBe(2);
    expect(store.itemCount()).toBe(2);
  });

  it('calcula subtotal, impuesto y total en enteros', () => {
    const store = TestBed.inject(SalesStore);
    store.addProduct(product);
    store.setQuantity('p1', 2);
    expect(store.subtotal()).toBe(2000);
    expect(store.tax()).toBe(320);
    expect(store.total()).toBe(2320);
  });

  it('checkout limpia el carrito y deja el folio', async () => {
    const store = TestBed.inject(SalesStore);
    const api = TestBed.inject(SalesApi);
    store.addProduct(product);
    const ok = await store.checkout('cash', 2500);
    expect(ok).toBe(true);
    expect(api.create).toHaveBeenCalled();
    expect(store.lines()).toHaveLength(0);
    expect(store.lastSale()?.folio).toBe('T-000001');
    expect(store.hasTicket()).toBe(true);
  });

  it('rechaza checkout con carrito vacío', async () => {
    const store = TestBed.inject(SalesStore);
    const ok = await store.checkout('cash', 0);
    expect(ok).toBe(false);
    expect(store.cartError()).toBe('El carrito está vacío');
  });

  it('aplica descuento de línea', () => {
    const store = TestBed.inject(SalesStore);
    store.addProduct(product);
    store.setQuantity('p1', 2);
    store.setDiscount('p1', 200);
    expect(store.subtotal()).toBe(1800);
    expect(store.tax()).toBe(288);
    expect(store.total()).toBe(2088);
  });
});
