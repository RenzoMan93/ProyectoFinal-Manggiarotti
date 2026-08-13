export function formatMesAnio(fechaISO) {
  if (!fechaISO) return null;
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return null;
  const mes = String(fecha.getUTCMonth() + 1).padStart(2, '0');
  const anio = fecha.getUTCFullYear();
  return `${mes}/${anio}`;
}

const MESES_LARGO = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

export function formatFechaLarga(fechaISO) {
  if (!fechaISO) return null;
  const fecha = new Date(fechaISO);
  if (Number.isNaN(fecha.getTime())) return null;
  return `${fecha.getUTCDate()} de ${MESES_LARGO[fecha.getUTCMonth()]}`;
}

export function getHostname(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
