import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/config';
import ProductCard from '../components/ProductCard';
import RatingForm from '../components/RatingForm';
import StarRating from '../components/StarRating';
import { useAuth } from '../contexts/AuthContext';
import { obtenerPublicacionesDeUsuario } from '../services/listings';
import { obtenerRatingsDeUsuario } from '../services/ratings';
import { obtenerUsuario } from '../services/users';

export default function Profile() {
  const { uid } = useParams();
  const { user } = useAuth();

  const [perfil, setPerfil] = useState(null);
  const [publicaciones, setPublicaciones] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [puedeCalificar, setPuedeCalificar] = useState(false);
  const [cargando, setCargando] = useState(true);

  const cargar = useCallback(async () => {
    setCargando(true);
    const [p, listado, valoraciones] = await Promise.all([
      obtenerUsuario(uid),
      obtenerPublicacionesDeUsuario(uid),
      obtenerRatingsDeUsuario(uid),
    ]);
    setPerfil(p);
    setPublicaciones(listado);
    setRatings(valoraciones);

    if (user && user.uid !== uid) {
      const q = query(collection(db, 'chats'), where('participantes', 'array-contains', user.uid));
      const snap = await getDocs(q);
      const tieneChatConEsteUsuario = snap.docs.some((d) => {
        const data = d.data();
        return data.compradorId === uid || data.vendedorId === uid;
      });
      setPuedeCalificar(tieneChatConEsteUsuario);
    } else {
      setPuedeCalificar(false);
    }
    setCargando(false);
  }, [uid, user]);

  useEffect(() => {
    cargar();
  }, [cargar]);

  if (cargando) return <p className="text-gray-500">Cargando...</p>;
  if (!perfil) return <p className="text-gray-500">Este usuario no existe.</p>;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-5">
        <div>
          <h1 className="text-xl font-bold text-gray-900">{perfil.nombre}</h1>
          <p className="text-sm text-gray-500">
            📍 {perfil.barrio ? `${perfil.barrio}, ` : ''}
            {perfil.departamento}
          </p>
          <div className="mt-1">
            <StarRating value={perfil.ratingPromedio || 0} count={perfil.cantidadRatings || 0} />
          </div>
        </div>
      </div>

      {puedeCalificar && <RatingForm deId={user.uid} paraId={uid} onCalificado={cargar} />}

      {ratings.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-gray-900">Opiniones</h2>
          <div className="space-y-3">
            {ratings.map((r) => (
              <div key={r.id} className="rounded-lg border border-gray-100 p-3">
                <StarRating value={r.estrellas} />
                {r.comentario && <p className="mt-1 text-sm text-gray-600">{r.comentario}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Publicaciones</h2>
        {publicaciones.length === 0 ? (
          <p className="text-gray-500">Sin publicaciones todavía.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {publicaciones.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
