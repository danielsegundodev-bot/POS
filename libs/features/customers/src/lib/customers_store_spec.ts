import { TestBed } from '@angular/core/testing';
import { Customer, CustomersApi, Page } from '@pos/data-access';
import { CustomersStore } from './customers_store';

describe('CustomersStore', () => {
  const customer: Customer = {
    id: 'c1',
    name: 'Ana López',
    email: 'ana@example.com',
    active: true,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  };

  const page: Page<Customer> = {
    items: [customer],
    total: 1,
    page: 1,
    pageSize: 20,
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: CustomersApi,
          useValue: {
            list: jest.fn().mockResolvedValue(page),
            get: jest.fn().mockResolvedValue(customer),
            create: jest.fn().mockResolvedValue(customer),
            update: jest.fn().mockResolvedValue(customer),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    });
  });

  it('load llena la lista', async () => {
    const store = TestBed.inject(CustomersStore);
    await store.load();
    expect(store.items()).toHaveLength(1);
    expect(store.total()).toBe(1);
  });

  it('save crea cuando no hay id', async () => {
    const store = TestBed.inject(CustomersStore);
    const api = TestBed.inject(CustomersApi);
    const ok = await store.save(null, { name: 'Ana López' });
    expect(ok).toBe(true);
    expect(api.create).toHaveBeenCalled();
  });

  it('expone error cuando falla la carga', async () => {
    const api = TestBed.inject(CustomersApi);
    (api.list as jest.Mock).mockRejectedValue(new Error('boom'));
    const store = TestBed.inject(CustomersStore);
    await store.load();
    expect(store.loadError()).toBe('boom');
  });
});
