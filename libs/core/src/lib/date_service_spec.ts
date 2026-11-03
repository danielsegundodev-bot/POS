import { DateService } from './date_service';

describe('DateService', () => {
  const service = new DateService();

  it('devuelve la fecha actual', () => {
    const before = Date.now();
    const result = service.now().getTime();
    expect(result).toBeGreaterThanOrEqual(before);
  });

  it('devuelve una fecha ISO válida', () => {
    expect(() => new Date(service.nowIso()).toISOString()).not.toThrow();
  });

  it('genera la clave local del día', () => {
    expect(service.todayKey(new Date(2026, 0, 5))).toBe('2026-01-05');
  });
});
