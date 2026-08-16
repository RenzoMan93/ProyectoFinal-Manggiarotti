export function formatUSD(amount) {
  return `$${Number(amount).toLocaleString('es-UY')}`;
}
