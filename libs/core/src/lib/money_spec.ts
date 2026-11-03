import {
  addMoney,
  formatMoney,
  multiplyMoney,
  parseMoneyToCents,
  subtractMoney,
  toMoney,
} from './money';

describe('money', () => {
  describe('toMoney', () => {
    it('trunca decimales residuales', () => {
      expect(toMoney(10.9)).toBe(10);
    });
  });

  describe('aritmética', () => {
    it('suma y resta en centavos sin pérdida', () => {
      expect(addMoney(1250, 500)).toBe(1750);
      expect(subtractMoney(1250, 500)).toBe(750);
    });

    it('multiplica un importe por una cantidad', () => {
      expect(multiplyMoney(1999, 3)).toBe(5997);
    });
  });

  describe('parseMoneyToCents', () => {
    it('convierte decimales a centavos', () => {
      expect(parseMoneyToCents('12.50')).toBe(1250);
      expect(parseMoneyToCents('12,50')).toBe(1250);
      expect(parseMoneyToCents(' 7 ')).toBe(700);
    });

    it('lanza error ante entradas no numéricas', () => {
      expect(() => parseMoneyToCents('abc')).toThrow('Importe no válido');
    });
  });

  describe('formatMoney', () => {
    it('formatea centavos como moneda', () => {
      expect(formatMoney(125000, 'MXN')).toContain('1,250.00');
    });
  });
});
