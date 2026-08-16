export function starString(count) {
  const n = Math.max(0, Math.min(5, Number(count) || 0));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

/** "Nuevo" or "★★★★☆" — used on small badges where "Usado" wouldn't fit. */
export function shortConditionLabel(product) {
  if (!product) return '';
  return product.conditionType === 'Nuevo' ? 'Nuevo' : starString(product.conditionStars);
}

/** "Nuevo" or "Usado · ★★★★☆" — used on the product detail spec. */
export function fullConditionLabel(product) {
  if (!product) return '';
  return product.conditionType === 'Nuevo' ? 'Nuevo' : `Usado · ${starString(product.conditionStars)}`;
}
