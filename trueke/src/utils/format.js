import { CURRENCIES } from './constants';

/** Formats an amount with the symbol of the given currency code (defaults to USD). */
export function formatPrice(amount, currencyCode = 'USD') {
  const symbol = CURRENCIES.find((c) => c.code === currencyCode)?.symbol || '$';
  return `${symbol}${Number(amount).toLocaleString('es-UY')}`;
}
