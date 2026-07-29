import {
  addDoc,
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export async function calificarUsuario({ deId, paraId, publicacionId, estrellas, comentario }) {
  await addDoc(collection(db, 'ratings'), {
    deId,
    paraId,
    publicacionId: publicacionId || null,
    estrellas,
    comentario: comentario || '',
    creadoEn: serverTimestamp(),
  });

  const usuarioRef = doc(db, 'usuarios', paraId);
  await runTransaction(db, async (transaction) => {
    const snap = await transaction.get(usuarioRef);
    if (!snap.exists()) return;
    const datos = snap.data();
    const cantidadAnterior = datos.cantidadRatings || 0;
    const promedioAnterior = datos.ratingPromedio || 0;
    const nuevaCantidad = cantidadAnterior + 1;
    const nuevoPromedio = (promedioAnterior * cantidadAnterior + estrellas) / nuevaCantidad;
    transaction.update(usuarioRef, {
      cantidadRatings: nuevaCantidad,
      ratingPromedio: nuevoPromedio,
    });
  });
}

export async function obtenerRatingsDeUsuario(usuarioId) {
  const q = query(collection(db, 'ratings'), where('paraId', '==', usuarioId), orderBy('creadoEn', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
