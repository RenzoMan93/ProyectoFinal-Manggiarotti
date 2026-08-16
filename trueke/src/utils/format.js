import { CURRENCIES } from './constants';

/** Formats an amount with the symbol of the given currency code (defaults to USD).
 * No thousands separator — round prices like 1500 show as "$1500", not "$1.500". */
export function formatPrice(amount, currencyCode = 'USD') {
  const symbol = CURRENCIES.find((c) => c.code === currencyCode)?.symbol || '$';
  return `${symbol}${Number(amount).toLocaleString('es-UY', { useGrouping: false })}`;
}

/**
 * If `text` was typed shouting in ALL CAPS, normalize it to sentence case
 * (first letter capitalized, the rest lowercase) so listing titles stay
 * consistent instead of looking like spam. Text with normal/mixed case is
 * left exactly as the seller wrote it.
 */
export function normalizeShoutingCase(text) {
  const trimmed = (text || '').trim();
  if (!trimmed) return trimmed;
  const letters = trimmed.replace(/[^a-zA-ZÀ-ÿ]/g, '');
  const isShouting = letters.length > 1 && letters === letters.toUpperCase();
  if (!isShouting) return trimmed;
  const lower = trimmed.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}
