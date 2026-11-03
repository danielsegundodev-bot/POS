/**
 * Cantidad de dinero en la unidad mínima de la moneda (centavos).
 * Nunca se usan decimales flotantes para montos; el formato es solo
 * responsabilidad de la capa de presentación (`formatMoney`).
 */
export type Money = number;

export const toMoney = (cents: number): Money => Math.trunc(cents);

export const addMoney = (a: Money, b: Money): Money => a + b;

export const subtractMoney = (a: Money, b: Money): Money => a - b;

export const multiplyMoney = (amount: Money, quantity: number): Money =>
  Math.trunc(amount * quantity);

/** Convierte un decimal legible ("12.50") a centavos (1250). */
export const parseMoneyToCents = (input: string): Money => {
  const normalized = input.trim().replace(/\s/g, '').replace(',', '.');
  const value = Number(normalized);
  if (Number.isNaN(value)) {
    throw new Error(`Importe no válido: "${input}"`);
  }
  return Math.round(value * 100);
};

export const formatMoney = (
  amount: Money,
  currency = 'MXN',
  locale = 'es-MX',
): string =>
  new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(amount / 100);
