import { TestBed } from '@angular/core/testing';
import { Page, Product, ProductsApi } from '@pos/data-access';
import { ProductsStore } from './products_store';

describe('ProductsStore', () => {
  const product: Product = {
    id: 'p1',
    sku: 'SKU-1',
    name: 'Refresco',
    price: 1500,
    taxRate: 0.16,
    trackStock: false,
    stock: 0,
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const page: Page<Product> = {
    items: [product],
    total: 1,
    page: 1,
    pageSize: 20,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: ProductsApi,
          useValue: {
            list: jest.fn().mockResolvedValue(page),
            get: jest.fn().mockResolvedValue(product),
            create: jest.fn().mockResolvedValue(product),
            update: jest.fn().mockResolvedValue(product),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    });
  });

  it('load llena la lista', async () => {
    const store = TestBed.inject(ProductsStore);
    await store.load();
    expect(store.items()).toHaveLength(1);
    expect(store.total()).toBe(1);
    expect(store.isLoading()).toBe(false);
  });

  it('save crea cuando no hay id', async () => {
    const store = TestBed.inject(ProductsStore);
    const api = TestBed.inject(ProductsApi);
    const ok = await store.save(null, {
      sku: 'SKU-1',
      name: 'Refresco',
      price: 1500,
      taxRate: 0.16,
    });
    expect(ok).toBe(true);
    expect(api.create).toHaveBeenCalled();
    expect(api.update).not.toHaveBeenCalled();
  });

  it('save actualiza cuando hay id', async () => {
    const store = TestBed.inject(ProductsStore);
    const api = TestBed.inject(ProductsApi);
    const ok = await store.save('p1', {
      sku: 'SKU-1',
      name: 'Refresco',
      price: 1500,
      taxRate: 0.16,
    });
    expect(ok).toBe(true);
    expect(api.update).toHaveBeenCalledWith('p1', expect.anything());
  });

  it('remove recarga la lista', async () => {
    const store = TestBed.inject(ProductsStore);
    const ok = await store.remove('p1');
    expect(ok).toBe(true);
    expect(store.items()).toHaveLength(1);
  });

  it('expone error cuando la carga falla', async () => {
    const api = TestBed.inject(ProductsApi);
    (api.list as jest.Mock).mockRejectedValue(new Error('boom'));
    const store = TestBed.inject(ProductsStore);
    await store.load();
    expect(store.loadError()).toBe('boom');
    expect(store.isLoading()).toBe(false);
  });
});
