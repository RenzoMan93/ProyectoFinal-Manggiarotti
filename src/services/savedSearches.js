import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { crearNotificacion } from './notifications';

export function crearBusquedaGuardada({ usuarioId, palabraClave, categoria, precioMax }) {
  return addDoc(collection(db, 'busquedasGuardadas'), {
    usuarioId,
    palabraClave: (palabraClave || '').trim().toLowerCase(),
    categoria: categoria || '',
    precioMax: precioMax ? Number(precioMax) : null,
    creadoEn: serverTimestamp(),
  });
}

export function escucharBusquedasGuardadas(usuarioId, callback) {
  const q = query(collection(db, 'busquedasGuardadas'), where('usuarioId', '==', usuarioId));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function eliminarBusquedaGuardada(id) {
  return deleteDoc(doc(db, 'busquedasGuardadas', id));
}

function coincide(busqueda, publicacion) {
  const textoPublicacion = `${publicacion.titulo} ${publicacion.descripcion}`.toLowerCase();
  if (busqueda.palabraClave && !textoPublicacion.includes(busqueda.palabraClave)) return false;
  if (busqueda.categoria && busqueda.categoria !== publicacion.categoria) return false;
  if (busqueda.precioMax && publicacion.precio > busqueda.precioMax) return false;
  return true;
}

/**
 * Compara una publicación recién creada contra todas las búsquedas guardadas
 * y genera una notificación in-app para cada usuario cuya alerta matchea.
 * Se ejecuta desde el cliente (sin Cloud Functions) al momento de publicar.
 */
export async function notificarBusquedasCoincidentes(publicacion) {
  const snap = await getDocs(collection(db, 'busquedasGuardadas'));
  const busquedas = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const avisos = busquedas.filter(
    (b) => b.usuarioId !== publicacion.vendedorId && coincide(b, publicacion),
  );

  await Promise.all(
    avisos.map((b) =>
      crearNotificacion({
        usuarioId: b.usuarioId,
        tipo: 'busqueda',
        mensaje: `Nueva publicación que coincide con tu búsqueda: "${publicacion.titulo}"`,
        publicacionId: publicacion.id,
      }),
    ),
  );
}
