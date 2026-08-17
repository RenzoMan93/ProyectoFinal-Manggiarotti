/**
 * Search-driven "Tipo" facet: instead of one fixed set of filters for every
 * search, the Feed's filter drawer shows a category-specific subtype facet
 * once the search text matches a known product family — e.g. typing
 * "bicicleta" surfaces "Tipo de bicicleta: Eléctrica / Deportiva / De
 * paseo / Montaña / Plegable" alongside the universal filters (ubicación,
 * precio, marca, color, estado).
 *
 * There's no dedicated "tipo" field on products (adding one would mean
 * reworking Publicar for every possible category), so matching works
 * against the product's own title + description text — the same text the
 * seller already writes, and the same text the AI summary already reads.
 */
export const SEARCH_TYPE_FACETS = [
  {
    trigger: ['bicicleta', 'bici'],
    label: 'Tipo de bicicleta',
    options: ['Eléctrica', 'Deportiva', 'De paseo', 'Montaña', 'Plegable', 'Rodado infantil'],
  },
  {
    trigger: ['celular', 'smartphone', 'iphone', 'samsung galaxy'],
    label: 'Tipo de celular',
    options: ['Gama alta', 'Gama media', 'Gama baja', 'Plegable'],
  },
  {
    trigger: ['notebook', 'laptop', 'computadora'],
    label: 'Tipo de computadora',
    options: ['Notebook', 'Netbook', 'De escritorio', 'Gamer'],
  },
  {
    trigger: ['auto', 'coche', 'vehículo', 'vehiculo'],
    label: 'Tipo de vehículo',
    options: ['Sedán', 'Hatchback', 'SUV', 'Pickup', 'Utilitario'],
  },
  {
    trigger: ['moto', 'motocicleta'],
    label: 'Tipo de moto',
    options: ['Scooter', 'Deportiva', 'Enduro', 'Cub/Urbana'],
  },
  {
    trigger: ['zapatilla', 'calzado', 'zapato'],
    label: 'Tipo de calzado',
    options: ['Running', 'Urbano', 'Botín/Botas', 'Sandalias', 'Fútbol'],
  },
  {
    trigger: ['sofá', 'sofa', 'sillón', 'sillon'],
    label: 'Tipo de sillón/sofá',
    options: ['2 cuerpos', '3 cuerpos', 'Reclinable', 'Rinconero'],
  },
  {
    trigger: ['mesa', 'escritorio'],
    label: 'Tipo de mesa',
    options: ['Comedor', 'Escritorio', 'Ratona', 'Auxiliar'],
  },
  {
    trigger: ['herramienta', 'taladro', 'amoladora'],
    label: 'Tipo de herramienta',
    options: ['Eléctrica', 'A batería', 'Manual'],
  },
];

/** Finds the facet group (if any) whose trigger words appear in the search text. */
export function findTypeFacet(searchText) {
  const q = (searchText || '').trim().toLowerCase();
  if (!q) return null;
  return SEARCH_TYPE_FACETS.find((facet) => facet.trigger.some((word) => q.includes(word))) || null;
}
