import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import StarRating from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import { useGeolocation } from '../hooks/useGeolocation';
import { obtenerOCrearChat } from '../services/chat';
import { alternarDestacado, marcarComoVendido, obtenerPublicacion } from '../services/listings';
import { obtenerUsuario } from '../services/users';
import { CATEGORIAS, distanciaKm } from '../utils/uruguay';

function formatearPrecio(precio) {
  return new Intl.NumberFormat('es-UY', { style: 'currency', currency: 'UYU', maximumFractionDigits: 0 }).format(
    precio,
  );
}

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { coords, solicitarUbicacion } = useGeolocation();

  const [producto, setProducto] = useState(null);
  const [vendedor, setVendedor] = useState(null);
  const [fotoActiva, setFotoActiva] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [contactando, setContactando] = useState(false);

  useEffect(() => {
    let activo = true;
    setCargando(true);
    obtenerPublicacion(id).then(async (p) => {
      if (!activo) return;
      setProducto(p);
      if (p?.vendedorId) {
        const v = await obtenerUsuario(p.vendedorId);
        if (activo) setVendedor(v);
      }
      setCargando(false);
    });
    return () => {
      activo = false;
    };
  }, [id]);

  if (cargando) return <p className="text-gray-500">Cargando...</p>;
  if (!producto) return <p className="text-gray-500">Esta publicación no existe o fue eliminada.</p>;

  const categoria = CATEGORIAS.find((c) => c.id === producto.categoria);
  const esDueño = user?.uid === producto.vendedorId;
  const distancia =
    coords && producto.lat != null ? distanciaKm(coords.lat, coords.lon, producto.lat, producto.lon) : null;

  const handleContactar = async () => {
    if (!user) {
      navigate('/ingresar', { state: { from: { pathname: `/producto/${id}` } } });
      return;
    }
    setContactando(true);
    try {
      const chatId = await obtenerOCrearChat({
        publicacionId: producto.id,
        publicacionTitulo: producto.titulo,
        compradorId: user.uid,
        vendedorId: producto.vendedorId,
      });
      navigate(`/mensajes/${chatId}`);
    } finally {
      setContactando(false);
    }
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      <div>
        <div className="aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
          {producto.fotos?.length ? (
            <img src={producto.fotos[fotoActiva]} alt={producto.titulo} className="h-full w-full object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-6xl">{categoria?.icon || '📦'}</div>
          )}
        </div>
        {producto.fotos?.length > 1 && (
          <div className="mt-2 flex gap-2">
            {producto.fotos.map((f, i) => (
              <button
                key={f}
                type="button"
                onClick={() => setFotoActiva(i)}
                className={`h-16 w-16 overflow-hidden rounded-lg border-2 ${
                  i === fotoActiva ? 'border-brand-600' : 'border-transparent'
                }`}
              >
                <img src={f} alt="" className="h-full w-full object-cover" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        {producto.destacado && (
          <span className="mb-2 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
            ✨ Destacado
          </span>
        )}
        <h1 className="text-2xl font-bold text-gray-900">{producto.titulo}</h1>
        <p className="mt-2 text-3xl font-bold text-brand-700">{formatearPrecio(producto.precio)}</p>

        <div className="mt-3 flex flex-wrap gap-2 text-sm">
          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{categoria?.icon} {categoria?.label}</span>
          <span className="rounded-full bg-gray-100 px-3 py-1 text-gray-700">{producto.condicion}</span>
          {producto.estado === 'vendido' && (
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-700">Vendido</span>
          )}
        </div>

        <div className="mt-4 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
          <p>
            📍 Ubicación aproximada: {producto.barrio ? `${producto.barrio}, ` : ''}
            {producto.departamento}
          </p>
          {distancia != null ? (
            <p className="mt-1">A ~{distancia.toFixed(1)} km de tu ubicación</p>
          ) : (
            producto.lat != null && (
              <button type="button" onClick={solicitarUbicacion} className="mt-1 font-medium text-brand-700 hover:underline">
                Ver a qué distancia está de vos
              </button>
            )
          )}
        </div>

        {producto.descripcion && <p className="mt-4 whitespace-pre-line text-gray-700">{producto.descripcion}</p>}

        <div className="mt-6 rounded-xl border border-gray-200 p-4">
          <p className="text-xs uppercase tracking-wide text-gray-400">Vendedor</p>
          <div className="mt-1 flex items-center justify-between">
            <Link to={`/perfil/${producto.vendedorId}`} className="font-medium text-gray-900 hover:underline">
              {producto.vendedorNombre}
            </Link>
            <StarRating value={vendedor?.ratingPromedio || 0} count={vendedor?.cantidadRatings || 0} />
          </div>
        </div>

        {esDueño ? (
          producto.estado !== 'vendido' && (
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={() => marcarComoVendido(producto.id)}
                className="flex-1 rounded-lg border border-gray-300 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
              >
                Marcar como vendido
              </button>
              <button
                type="button"
                onClick={() => {
                  alternarDestacado(producto.id, !producto.destacado);
                  setProducto((p) => ({ ...p, destacado: !p.destacado }));
                }}
                className="flex-1 rounded-lg border border-amber-400 py-2.5 font-semibold text-amber-700 hover:bg-amber-50"
              >
                {producto.destacado ? 'Quitar de destacados' : '✨ Destacar'}
              </button>
            </div>
          )
        ) : (
          <button
            type="button"
            onClick={handleContactar}
            disabled={contactando || producto.estado === 'vendido'}
            className="mt-4 w-full rounded-lg bg-brand-600 py-2.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
          >
            💬 {contactando ? 'Abriendo chat...' : 'Contactar al vendedor'}
          </button>
        )}
      </div>
    </div>
  );
}
