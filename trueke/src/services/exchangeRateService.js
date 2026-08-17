const CACHE_KEY = 'trueke_usd_uyu_rate';
const FALLBACK_RATE = 40; // rough USD->UYU rate used only if there's no cache and the API is unreachable

/**
 * USD -> UYU exchange rate, refreshed at most once per calendar day.
 * Uses open.er-api.com — free, no API key needed, and its own data is
 * updated once every 24h, which is exactly the "actualizalo diariamente"
 * cadence asked for. The result is cached in localStorage keyed by
 * today's date so a device only hits the API once a day; if the fetch
 * fails, falls back to the last known rate (or FALLBACK_RATE if there's
 * no cache yet).
 */
export async function getUsdToUyuRate() {
  const today = new Date().toISOString().slice(0, 10);
  const cached = readCache();
  if (cached?.date === today && cached?.rate) return cached.rate;

  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD');
    const data = await res.json();
    const rate = data?.rates?.UYU;
    if (!rate) throw new Error('La respuesta no incluye la cotización de UYU.');
    localStorage.setItem(CACHE_KEY, JSON.stringify({ date: today, rate }));
    return rate;
  } catch (err) {
    console.error('No se pudo actualizar el tipo de cambio USD/UYU:', err);
    return cached?.rate || FALLBACK_RATE;
  }
}

function readCache() {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || 'null');
  } catch {
    return null;
  }
}

/** Converts `amount` from `fromCurrency` ('USD' | 'UYU') to the other one. */
export function convertPrice(amount, fromCurrency, usdToUyuRate) {
  return fromCurrency === 'USD' ? amount * usdToUyuRate : amount / usdToUyuRate;
}
