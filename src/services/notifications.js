import {
  addDoc,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export function crearNotificacion({ usuarioId, tipo, mensaje, publicacionId }) {
  return addDoc(collection(db, 'notificaciones'), {
    usuarioId,
    tipo,
    mensaje,
    publicacionId: publicacionId || null,
    leida: false,
    creadoEn: serverTimestamp(),
  });
}

export function escucharNotificaciones(usuarioId, callback) {
  const q = query(
    collection(db, 'notificaciones'),
    where('usuarioId', '==', usuarioId),
    orderBy('creadoEn', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function marcarLeida(notificacionId) {
  return updateDoc(doc(db, 'notificaciones', notificacionId), { leida: true });
}
