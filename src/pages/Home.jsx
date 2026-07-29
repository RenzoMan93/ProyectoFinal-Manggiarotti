import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { escucharDestacados, escucharPublicacionesRecientes } from '../services/listings';
import { CATEGORIAS } from '../utils/uruguay';

export default function Home() {
  const [publicaciones, setPublicaciones] = useState([]);
  const [destacados, setDestacados] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const unsub1 = escucharPublicacionesRecientes((items) => {
      setPublicaciones(items);
      setCargando(false);
    });
    const unsub2 = escucharDestacados(setDestacados);
    return () => {
      unsub1();
      unsub2();
    };
  }, []);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 px-6 py-10 text-white sm:px-10">
        <h1 className="text-2xl font-bold sm:text-3xl">Dale una segunda vida a tus cosas</h1>
        <p className="mt-2 max-w-xl text-brand-50">
          Comprá y vendé artículos usados cerca tuyo, en cualquier rincón de Uruguay. Publicá en menos de un minuto.
        </p>
        <Link
          to="/publicar"
          className="mt-5 inline-block rounded-full bg-white px-5 py-2.5 font-semibold text-brand-700 hover:bg-brand-50"
        >
          Publicar un artículo
        </Link>
      </section>

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Categorías</h2>
        <div className="flex flex-wrap gap-2">
          {CATEGORIAS.map((c) => (
            <Link
              key={c.id}
              to={`/buscar?categoria=${c.id}`}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-700 hover:border-brand-400 hover:text-brand-700"
            >
              <span>{c.icon}</span> {c.label}
            </Link>
          ))}
        </div>
      </section>

      {destacados.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">✨ Destacados</h2>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {destacados.map((p) => (
              <div key={p.id} className="w-44 flex-shrink-0 sm:w-56">
                <ProductCard producto={p} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Publicados recientemente</h2>
        {cargando && <p className="text-gray-500">Cargando publicaciones...</p>}
        {!cargando && publicaciones.length === 0 && (
          <p className="text-gray-500">Todavía no hay publicaciones. ¡Sé el primero!</p>
        )}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {publicaciones.map((p) => (
            <ProductCard key={p.id} producto={p} />
          ))}
        </div>
      </section>
    </div>
  );
}
