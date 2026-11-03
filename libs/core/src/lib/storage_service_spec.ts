import { StorageService } from './storage_service';

describe('StorageService', () => {
  const service = new StorageService();

  afterEach(() => {
    localStorage.clear();
  });

  it('almacena y recupera valores serializados', () => {
    service.set('cart', { total: 1250 });
    expect(service.get<{ total: number }>('cart')).toEqual({ total: 1250 });
  });

  it('devuelve null cuando la clave no existe', () => {
    expect(service.get('missing')).toBeNull();
  });

  it('elimina valores', () => {
    service.set('token', 'abc');
    service.remove('token');
    expect(service.get('token')).toBeNull();
  });

  it('tolera JSON corrupto', () => {
    localStorage.setItem('pos:broken', '{no-json');
    expect(service.get('broken')).toBeNull();
  });
});
