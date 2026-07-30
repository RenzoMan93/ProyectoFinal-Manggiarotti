import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { crearPublicacion } from '../services/listings';
import { comprimirImagen } from '../services/storage';
import { BARRIOS_MONTEVIDEO, CATEGORIAS, CONDICIONES, DEPARTAMENTOS, ubicacionAproximada } from '../utils/uruguay';

const MAX_FOTOS = 3;

export default function PublishItem() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { coords, status: geoStatus, solicitarUbicacion } = useGeolocation();

  const [fotos, setFotos] = useState([]); // File[]
  const [previews, setPrevias] = useState([]);
  const [form, setForm] = useState({
    titulo: '',
    precio: '',
    categoria: CATEGORIAS[0].id,
    condicion: CONDICIONES[0],
    departamento: 'Montevideo',
    barrio: '',
    descripcion: '',
  });
  const [publicando, setPublicando] = useState(false);
  const [error, setError] = useState('');

  const update = (campo) => (e) => setForm((f) => ({ ...f, [campo]: e.target.value }));

  const handleFotos = (e) => {
    const archivos = Array.from(e.target.files || []).slice(0, MAX_FOTOS);
    setFotos(archivos);
    setPrevias(archivos.map((f) => URL.createObjectURL(f)));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.titulo.trim() || !form.precio) {
      setError('Completá al menos el título y el precio.');
      return;
    }

    setPublicando(true);
    try {
      const urlsFotos = await Promise.all(fotos.map((f) => comprimirImagen(f)));

      const ubicacion = coords ? ubicacionAproximada(coords.lat, coords.lon) : null;

      const id = await crearPublicacion({
        titulo: form.titulo.trim(),
        precio: Number(form.precio),
        categoria: form.categoria,
        condicion: form.condicion,
        departamento: form.departamento,
        barrio: form.barrio.trim(),
        descripcion: form.descripcion.trim(),
        fotos: urlsFotos,
        lat: ubicacion?.lat ?? null,
        lon: ubicacion?.lon ?? null,
        vendedorId: user.uid,
        vendedorNombre: user.displayName || 'Usuario',
      });

      navigate(`/producto/${id}`);
    } catch (err) {
      console.error(err);
      setError('No pudimos publicar tu artículo. Intentá de nuevo.');
    } finally {
      setPublicando(false);
    }
  };

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-1 text-2xl font-bold text-gray-900">Publicá en menos de un minuto</h1>
      <p className="mb-6 text-sm text-gray-500">Solo necesitás una foto, un título y un precio para empezar.</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Fotos (hasta {MAX_FOTOS})</label>
          <input type="file" accept="image/*" multiple onChange={handleFotos} className="text-sm" />
          {previews.length > 0 && (
            <div className="mt-2 flex gap-2">
              {previews.map((src) => (
                <img key={src} src={src} alt="" className="h-20 w-20 rounded-lg object-cover" />
              ))}
            </div>
          )}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Título *</label>
          <input
            required
            value={form.titulo}
            onChange={update('titulo')}
            placeholder="Ej: Bicicleta rodado 26, poco uso"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Precio (UYU) *</label>
            <input
              required
              type="number"
              min="0"
              value={form.precio}
              onChange={update('precio')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Condición</label>
            <select
              value={form.condicion}
              onChange={update('condicion')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            >
              {CONDICIONES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Categoría</label>
          <select
            value={form.categoria}
            onChange={update('categoria')}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          >
            {CATEGORIAS.map((c) => (
              <option key={c.id} value={c.id}>
                {c.icon} {c.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Departamento</label>
            <select
              value={form.departamento}
              onChange={update('departamento')}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
            >
              {DEPARTAMENTOS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Barrio (opcional)</label>
            {form.departamento === 'Montevideo' ? (
              <select
                value={form.barrio}
                onChange={update('barrio')}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              >
                <option value="">Elegir...</option>
                {BARRIOS_MONTEVIDEO.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            ) : (
              <input
                value={form.barrio}
                onChange={update('barrio')}
                placeholder="Barrio o zona"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
              />
            )}
          </div>
        </div>

        <div>
          <button
            type="button"
            onClick={solicitarUbicacion}
            className="text-sm font-medium text-brand-700 hover:underline"
          >
            📍 Usar mi ubicación aproximada actual
          </button>
          {geoStatus === 'loading' && <span className="ml-2 text-xs text-gray-400">Buscando...</span>}
          {geoStatus === 'success' && <span className="ml-2 text-xs text-brand-600">Ubicación agregada ✓</span>}
          {geoStatus === 'error' && <span className="ml-2 text-xs text-red-500">No se pudo obtener</span>}
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Descripción (opcional)</label>
          <textarea
            value={form.descripcion}
            onChange={update('descripcion')}
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={publicando}
          className="w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
        >
          {publicando ? 'Publicando...' : 'Publicar ahora'}
        </button>
      </form>
    </div>
  );
}
