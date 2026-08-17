/**
 * Best-effort keyword blocklist for categories Trueke doesn't allow:
 * comestibles, medicamentos/farmacia, superalimentos, suplementos, cremas y
 * cosméticos, artículos de laboratorio con vencimiento o que requieren
 * habilitación del MSP u otros organismos, inflamables, químicos, alcoholes
 * y perfumes. This is a keyword match, not a legal guarantee — it catches
 * the obvious cases at publish time; functions/index.js's moderateListing
 * runs a second, AI-based pass server-side as a backstop (see there for why
 * client-side checks alone aren't enough).
 */
const PROHIBITED_CATEGORIES = [
  {
    label: 'alimentos o bebidas',
    keywords: [
      'alimento',
      'comestible',
      'comida',
      'bebida',
      'snack',
      'golosina',
      'chocolate',
      'galletita',
      'conserva',
      'enlatado',
      'lacteo',
      'carne',
      'pescado',
      'fiambre',
      'miel',
    ],
  },
  {
    label: 'medicamentos o productos de farmacia',
    keywords: [
      'medicamento',
      'medicina',
      'farmac',
      'pastilla',
      'comprimido',
      'jarabe',
      'antibiotico',
      'receta medica',
      'vacuna',
      'inyectable',
    ],
  },
  {
    label: 'suplementos y superalimentos',
    keywords: [
      'suplemento',
      'superalimento',
      'proteina en polvo',
      'creatina',
      'multivitaminico',
      'colageno',
      'omega 3',
      'omega3',
    ],
  },
  {
    label: 'cremas, cosméticos y productos de skin care',
    keywords: [
      'crema facial',
      'crema corporal',
      'crema hidratante',
      'cosmetico',
      'protector solar',
      'antiarrugas',
      'skin care',
      'skincare',
      'maquillaje',
      'esmalte de uñas',
      'bronceador',
      'autobronceante',
      'labial',
      'rimel',
      'delineador',
      'base de maquillaje',
      'sombra de ojos',
    ],
  },
  {
    label: 'artículos de laboratorio, con vencimiento o que requieren habilitación del MSP',
    keywords: ['vencimiento', 'fecha de vencimiento', 'reactivo de laboratorio', 'habilitacion msp', 'registro msp'],
  },
  {
    label: 'inflamables, químicos, alcoholes o perfumes',
    keywords: [
      'inflamable',
      'quimico',
      'solvente',
      'diluyente',
      'nafta',
      'combustible',
      'gas licuado',
      'gas envasado',
      'lejia',
      'acido',
      'perfume',
      'colonia',
      'fragancia',
      'alcohol',
      'bebida alcoholica',
      'vino',
      'cerveza',
      'whisky',
    ],
  },
];

function normalize(text) {
  return (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

/** Returns { label, keyword } for the first prohibited-category match found
 * in `text`, or null if nothing matches. */
export function findProhibitedMatch(text) {
  const normalized = normalize(text);
  if (!normalized.trim()) return null;
  for (const category of PROHIBITED_CATEGORIES) {
    for (const keyword of category.keywords) {
      if (normalized.includes(normalize(keyword))) {
        return { label: category.label, keyword };
      }
    }
  }
  return null;
}
