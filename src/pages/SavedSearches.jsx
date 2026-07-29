import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { eliminarBusquedaGuardada, escucharBusquedasGuardadas } from '../services/savedSearches';
import { CATEGORIAS } from '../utils/uruguay';

export default function SavedSearches() {
  const { user } = useAuth();
  const [busquedas, setBusquedas] = useState([]);

  useEffect(() => {
    const unsub = escucharBusquedasGuardadas(user.uid, setBusquedas);
    return unsub;
  }, [user.uid]);

  const etiquetaCategoria = (id) => CATEGORIAS.find((c) => c.id === id)?.label;

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Búsquedas guardadas</h1>
      <p className="mb-4 text-sm text-gray-500">
        Te avisamos apenas se publique algo que coincida con estas alertas.
      </p>

      {busquedas.length === 0 && (
        <p className="text-gray-500">
          No tenés búsquedas guardadas. Andá a{' '}
          <Link to="/buscar" className="text-brand-700 hover:underline">
            Buscar
          </Link>{' '}
          y guardá una.
        </p>
      )}

      <div className="space-y-2">
        {busquedas.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-lg border border-gray-200 p-3 text-sm">
            <div>
              {b.palabraClave && <span className="font-medium text-gray-900">"{b.palabraClave}"</span>}
              {b.categoria && <span className="ml-2 text-gray-500">{etiquetaCategoria(b.categoria)}</span>}
              {b.precioMax && <span className="ml-2 text-gray-500">hasta ${b.precioMax}</span>}
            </div>
            <button
              type="button"
              onClick={() => eliminarBusquedaGuardada(b.id)}
              className="text-red-500 hover:underline"
            >
              Eliminar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
