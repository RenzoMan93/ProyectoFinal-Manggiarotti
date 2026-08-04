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
