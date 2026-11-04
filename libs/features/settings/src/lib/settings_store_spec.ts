import { TestBed } from '@angular/core/testing';
import {
  AppSettings,
  PublicUser,
  SettingsApi,
  UsersAdminApi,
} from '@pos/data-access';
import { SettingsStore } from './settings_store';

describe('SettingsStore', () => {
  const settings: AppSettings = {
    storeName: 'Tienda Central',
    storeAddress: 'Calle 1',
    currency: 'MXN',
    taxLabel: 'IVA',
  };

  const users: PublicUser[] = [
    {
      id: 'u1',
      email: 'admin@pos.local',
      name: 'Admin',
      role: 'admin',
      active: true,
    },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SettingsApi,
          useValue: {
            get: jest.fn().mockResolvedValue(settings),
            update: jest.fn().mockResolvedValue(settings),
          },
        },
        {
          provide: UsersAdminApi,
          useValue: {
            list: jest.fn().mockResolvedValue(users),
            create: jest.fn().mockResolvedValue(users[0]),
            update: jest.fn().mockResolvedValue(users[0]),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    });
  });

  it('loadSettings llena la configuración', async () => {
    const store = TestBed.inject(SettingsStore);
    await store.loadSettings();
    expect(store.storeName()).toBe('Tienda Central');
  });

  it('loadUsers llena la lista', async () => {
    const store = TestBed.inject(SettingsStore);
    await store.loadUsers();
    expect(store.usersList()).toHaveLength(1);
  });

  it('saveUser crea y recarga', async () => {
    const store = TestBed.inject(SettingsStore);
    const api = TestBed.inject(UsersAdminApi);
    const ok = await store.saveUser(null, {
      email: 'x@pos.local',
      name: 'X',
      password: 'secret1',
      role: 'cashier',
    });
    expect(ok).toBe(true);
    expect(api.create).toHaveBeenCalled();
    expect(store.usersList()).toHaveLength(1);
  });
});
