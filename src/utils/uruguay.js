export const DEPARTAMENTOS = [
  'Artigas',
  'Canelones',
  'Cerro Largo',
  'Colonia',
  'Durazno',
  'Flores',
  'Florida',
  'Lavalleja',
  'Maldonado',
  'Montevideo',
  'Paysandú',
  'Río Negro',
  'Rivera',
  'Rocha',
  'Salto',
  'San José',
  'Soriano',
  'Tacuarembó',
  'Treinta y Tres',
];

export const BARRIOS_MONTEVIDEO = [
  'Ciudad Vieja',
  'Centro',
  'Cordón',
  'Palermo',
  'Barrio Sur',
  'Parque Rodó',
  'Pocitos',
  'Punta Carretas',
  'Malvín',
  'Buceo',
  'Carrasco',
  'Tres Cruces',
  'La Blanqueada',
  'Parque Batlle',
  'Aguada',
  'Reducto',
  'Prado',
  'Belvedere',
  'Cerro',
  'Colón',
  'Sayago',
  'Villa Española',
  'Malvín Norte',
  'Piedras Blancas',
  'Unión',
  'Maroñas',
];

export const CATEGORIAS = [
  { id: 'hogar', label: 'Hogar y muebles', icon: '🛋️' },
  { id: 'electro', label: 'Electrodomésticos', icon: '🔌' },
  { id: 'tecnologia', label: 'Tecnología', icon: '💻' },
  { id: 'ropa', label: 'Ropa y accesorios', icon: '👕' },
  { id: 'deportes', label: 'Deportes', icon: '⚽' },
  { id: 'ninos', label: 'Bebés y niños', icon: '🧸' },
  { id: 'libros', label: 'Libros y música', icon: '📚' },
  { id: 'herramientas', label: 'Herramientas', icon: '🛠️' },
  { id: 'vehiculos', label: 'Vehículos y repuestos', icon: '🚗' },
  { id: 'mascotas', label: 'Mascotas', icon: '🐾' },
  { id: 'otros', label: 'Otros', icon: '📦' },
];

export const CONDICIONES = [
  'Nuevo',
  'Como nuevo',
  'Buen estado',
  'Usado - funciona bien',
  'Para repuestos',
];

/** Distancia aproximada en km entre dos coordenadas (fórmula de Haversine). */
export function distanciaKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Redondea coordenadas a ~1km de precisión para mostrar una ubicación
 * aproximada en vez de la posición exacta del usuario.
 */
export function ubicacionAproximada(lat, lon) {
  const factor = 100; // ~1.1km de resolución
  return {
    lat: Math.round(lat * factor) / factor,
    lon: Math.round(lon * factor) / factor,
  };
}
