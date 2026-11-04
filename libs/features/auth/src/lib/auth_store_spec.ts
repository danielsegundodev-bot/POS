import { TestBed } from '@angular/core/testing';
import { AuthApi, LoginResponse } from '@pos/data-access';
import { AuthStore } from './auth_store';

describe('AuthStore', () => {
  const loginResult: LoginResponse = {
    accessToken: 'tok',
    user: { id: '1', email: 'a@b.c', name: 'Ana', role: 'admin' },
  };

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: AuthApi,
          useValue: {
            login: jest.fn().mockResolvedValue(loginResult),
          },
        },
      ],
    });
  });

  afterEach(() => localStorage.clear());

  it('inicia como anónimo', () => {
    const store = TestBed.inject(AuthStore);
    expect(store.isAuthenticated()).toBe(false);
    expect(store.status()).toBe('anonymous');
  });

  it('login exitoso autentica y persiste la sesión', async () => {
    const store = TestBed.inject(AuthStore);
    const ok = await store.login('a@b.c', 'secret1');
    expect(ok).toBe(true);
    expect(store.isAuthenticated()).toBe(true);
    expect(store.displayName()).toBe('Ana');
    expect(localStorage.getItem('pos:session')).toContain('tok');
  });

  it('login fallido deja error y estado anónimo', async () => {
    const api = TestBed.inject(AuthApi);
    (api.login as jest.Mock).mockRejectedValue(
      new Error('Credenciales inválidas'),
    );
    const store = TestBed.inject(AuthStore);
    const ok = await store.login('a@b.c', 'mala');
    expect(ok).toBe(false);
    expect(store.isAuthenticated()).toBe(false);
    expect(store.loginError()).toBe('Credenciales inválidas');
  });

  it('logout limpia estado y almacenamiento', async () => {
    const store = TestBed.inject(AuthStore);
    await store.login('a@b.c', 'secret1');
    store.logout();
    expect(store.isAuthenticated()).toBe(false);
    expect(localStorage.getItem('pos:session')).toBeNull();
  });
});
