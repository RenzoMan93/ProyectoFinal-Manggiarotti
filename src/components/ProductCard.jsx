import { Link } from 'react-router-dom';
import { CATEGORIAS } from '../utils/uruguay';

function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(
    precio,
  );
}

export default function ProductCard({ producto }) {
  const categoria = CATEGORIAS.find((c) => c.id === producto.categoria);
  const foto = producto.fotos?.[0];

  return (
    <Link
      to={`/producto/${producto.id}`}
      className="group block overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative aspect-square w-full overflow-hidden bg-gray-100">
        {foto ? (
          <img
            src={foto}
            alt={producto.titulo}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-4xl">
            {categoria?.icon || '📦'}
          </div>
        )}
        {producto.destacado && (
          <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-xs font-semibold text-amber-950">
            Destacado
          </span>
        )}
        {producto.estado === 'vendido' && (
          <span className="absolute inset-0 flex items-center justify-center bg-black/50 text-sm font-bold uppercase tracking-wide text-white">
            Vendido
          </span>
        )}
      </div>
      <div className="p-3">
        <p className="truncate text-sm font-medium text-gray-900">{producto.titulo}</p>
        <p className="mt-0.5 text-base font-semibold text-brand-700">{formatearPrecio(producto.precio)}</p>
        <p className="mt-1 truncate text-xs text-gray-500">
          📍 {producto.barrio ? `${producto.barrio}, ` : ''}
          {producto.departamento}
        </p>
      </div>
    </Link>
  );
}
