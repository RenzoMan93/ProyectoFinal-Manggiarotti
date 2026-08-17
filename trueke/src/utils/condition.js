export const CONDITION_LEVELS = [
  { stars: 5, title: 'Como nueva', subtitle: 'Se ve y funciona como el primer día' },
  { stars: 4, title: 'Muy buen estado', subtitle: 'Muy poco uso' },
  { stars: 3, title: 'Buen estado', subtitle: 'Funciona bien, con signos de uso leves' },
  { stars: 2, title: 'Estado regular', subtitle: 'Con detalles visibles' },
  { stars: 1, title: 'Muy usada', subtitle: 'Funcional, pero con desgaste notorio' },
];

export function starString(count) {
  const n = Math.max(0, Math.min(5, Number(count) || 0));
  return '★'.repeat(n) + '☆'.repeat(5 - n);
}

export function conditionTitle(stars) {
  return CONDITION_LEVELS.find((l) => l.stars === stars)?.title || '';
}

/** "★★★★☆" — used on small badges where a full label wouldn't fit. */
export function shortConditionLabel(product) {
  if (!product) return '';
  return starString(product.conditionStars);
}

/** "Como nueva ★★★★★" — used on the product detail spec. */
export function fullConditionLabel(product) {
  if (!product) return '';
  const title = conditionTitle(product.conditionStars);
  return `${title ? `${title} ` : ''}${starString(product.conditionStars)}`;
}
