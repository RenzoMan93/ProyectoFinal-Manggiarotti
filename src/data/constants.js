export const CATEGORIES = [
  {
    id: 'seguridad',
    label: 'Seguridad',
    icon: '🛡️',
    subcategories: ['Robo', 'Hurto', 'Rapiña', 'Vandalismo', 'Ruidos molestos', 'Otro'],
  },
  {
    id: 'transito',
    label: 'Tránsito y vehicular',
    icon: '🚗',
    subcategories: ['Siniestro de tránsito', 'Robo de vehículo', 'Infracción', 'Estado de la vía', 'Semáforo/señalización', 'Otro'],
  },
  {
    id: 'compras',
    label: 'Compras y consumo',
    icon: '🛒',
    subcategories: ['Estafa', 'Sobreprecio', 'Mala atención', 'Producto defectuoso', 'Publicidad engañosa', 'Otro'],
  },
];

export const getCategory = (id) => CATEGORIES.find((c) => c.id === id);

export const DEPARTAMENTOS = [
  'Artigas', 'Canelones', 'Cerro Largo', 'Colonia', 'Durazno', 'Flores', 'Florida',
  'Lavalleja', 'Maldonado', 'Montevideo', 'Paysandú', 'Río Negro', 'Rivera',
  'Rocha', 'Salto', 'San José', 'Soriano', 'Tacuarembó', 'Treinta y Tres',
];

export const STATUS = {
  ABIERTO: 'abierto',
  EN_REVISION: 'en_revision',
  RESUELTO: 'resuelto',
};

export const STATUS_LABELS = {
  [STATUS.ABIERTO]: 'Abierto',
  [STATUS.EN_REVISION]: 'En revisión',
  [STATUS.RESUELTO]: 'Resuelto',
};
