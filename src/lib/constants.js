// Debe coincidir exactamente con los enums product_category / product_condition
// definidos en supabase/migrations/0001_init.sql
export const CATEGORIES = [
  { id: "hogar", label: "Hogar y muebles" },
  { id: "electro", label: "Electrodomésticos" },
  { id: "tech", label: "Tecnología" },
  { id: "ropa", label: "Ropa y accesorios" },
  { id: "deportes", label: "Deportes" },
  { id: "bebes", label: "Bebés y niños" },
  { id: "libros", label: "Libros y música" },
  { id: "herramientas", label: "Herramientas" },
  { id: "vehiculos", label: "Vehículos y repuestos" },
  { id: "mascotas", label: "Mascotas" },
  { id: "otros", label: "Otros" },
];

export const CONDITIONS = ["Nuevo", "Usado - buen estado", "Usado - regular estado"];

export const DEPARTAMENTOS = [
  "Montevideo", "Canelones", "Maldonado", "Colonia", "San José", "Rocha",
  "Salto", "Paysandú", "Rivera", "Tacuarembó", "Artigas", "Cerro Largo",
  "Durazno", "Flores", "Florida", "Lavalleja", "Río Negro", "Soriano",
  "Treinta y Tres",
];

export const MATERIALS = ["Madera", "Metal", "Cuero", "Tela", "Plástico", "Otro"];

export const COLOR_SWATCHES = [
  { name: "Negro", hex: "#1E241F" },
  { name: "Blanco", hex: "#F4F0E4" },
  { name: "Terracota", hex: "#C4593B" },
  { name: "Verde", hex: "#1B4B43" },
  { name: "Amarillo", hex: "#D9A22C" },
  { name: "Azul", hex: "#3B5CC4" },
];
