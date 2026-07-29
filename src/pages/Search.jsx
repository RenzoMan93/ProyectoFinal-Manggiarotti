import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { useAuth } from '../contexts/AuthContext';
import { escucharPublicacionesRecientes } from '../services/listings';
import { crearBusquedaGuardada } from '../services/savedSearches';
import { CATEGORIAS } from '../utils/uruguay';

export default function Search() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [publicaciones, setPublicaciones] = useState([]);
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState(false);

  const q = searchParams.get('q') || '';
  const categoria = searchParams.get('categoria') || '';
  const precioMax = searchParams.get('precioMax') || '';

  useEffect(() => {
    const unsub = escucharPublicacionesRecientes(setPublicaciones, 200);
    return unsub;
  }, []);

  useEffect(() => setGuardado(false), [q, categoria, precioMax]);

  const resultados = useMemo(() => {
    const qMin = q.trim().toLowerCase();
    return publicaciones.filter((p) => {
      if (qMin && !`${p.titulo} ${p.descripcion}`.toLowerCase().includes(qMin)) return false;
      if (categoria && p.categoria !== categoria) return false;
      if (precioMax && p.precio > Number(precioMax)) return false;
      return true;
    });
  }, [publicaciones, q, categoria, precioMax]);

  const actualizarParam = (clave, valor) => {
    const next = new URLSearchParams(searchParams);
    if (valor) next.set(clave, valor);
    else next.delete(clave);
    setSearchParams(next);
  };

  const handleGuardarBusqueda = async () => {
    if (!user) return;
    setGuardando(true);
    try {
      await crearBusquedaGuardada({ usuarioId: user.uid, palabraClave: q, categoria, precioMax });
      setGuardado(true);
    } finally {
      setGuardando(false);
    }
  };

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold text-gray-900">Buscar</h1>

      <div className="mb-6 flex flex-wrap items-end gap-3">
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Palabra clave</label>
          <input
            value={q}
            onChange={(e) => actualizarParam('q', e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Categoría</label>
          <select
            value={categoria}
            onChange={(e) => actualizarParam('categoria', e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          >
            <option value="">Todas</option>
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-gray-500">Precio máximo</label>
          <input
            type="number"
            min="0"
            value={precioMax}
            onChange={(e) => actualizarParam('precioMax', e.target.value)}
            className="w-32 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>

        {user && (
          <button
            type="button"
            onClick={handleGuardarBusqueda}
            disabled={guardando || guardado}
            className="rounded-lg border border-brand-600 px-3 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50 disabled:opacity-60"
          >
            {guardado ? '🔔 Alerta guardada' : guardando ? 'Guardando...' : '🔔 Avisarme de nuevos resultados'}
          </button>
        )}
      </div>

      <p className="mb-3 text-sm text-gray-500">{resultados.length} resultado(s)</p>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
        {resultados.map((p) => (
          <ProductCard key={p.id} producto={p} />
        ))}
      </div>
    </div>
  );
}
