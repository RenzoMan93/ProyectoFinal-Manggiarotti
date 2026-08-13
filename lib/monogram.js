const STOPWORDS = new Set([
  'DE', 'DEL', 'LA', 'EL', 'LOS', 'LAS', 'Y', 'EN', 'PARA', 'CON', 'A', 'AL', 'UN', 'UNA',
]);

function stripAccents(value) {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

// Deriva un glyph de 3 letras a partir del nombre del trámite (ej "Cédula
// de identidad" -> "CEI"). Es una aproximación automática: si más adelante
// se quiere un glyph curado por trámite (como "RUT" o "AUT"), conviene
// agregar una columna dedicada en la tabla `tramite`.
export function getMonogram(nombre) {
  if (!nombre) return '···';

  const limpio = stripAccents(nombre).toUpperCase();
  const palabras = limpio.split(/\s+/).filter(Boolean);
  const significativas = palabras.filter((palabra) => !STOPWORDS.has(palabra));
  const fuente = significativas.length > 0 ? significativas : palabras;

  if (fuente.length === 0) return '···';
  if (fuente.length >= 3) {
    return fuente.slice(0, 3).map((palabra) => palabra[0]).join('');
  }
  if (fuente.length === 2) {
    return (fuente[0].slice(0, 2) + fuente[1][0]).slice(0, 3);
  }
  return fuente[0].slice(0, 3).padEnd(3, fuente[0][0]);
}
