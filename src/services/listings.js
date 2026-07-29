import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { notificarBusquedasCoincidentes } from './savedSearches';

function publicacionesRef() {
  return collection(db, 'publicaciones');
}

export async function crearPublicacion(datos) {
  const docRef = await addDoc(publicacionesRef(), {
    ...datos,
    estado: 'disponible',
    destacado: false,
    creadoEn: serverTimestamp(),
  });

  notificarBusquedasCoincidentes({ id: docRef.id, ...datos }).catch((err) =>
    console.error('No se pudieron generar notificaciones de búsqueda', err),
  );

  return docRef.id;
}

export function escucharPublicacionesRecientes(callback, cantidad = 40) {
  const q = query(publicacionesRef(), orderBy('creadoEn', 'desc'), limit(cantidad));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function escucharDestacados(callback, cantidad = 10) {
  const q = query(
    publicacionesRef(),
    where('destacado', '==', true),
    orderBy('creadoEn', 'desc'),
    limit(cantidad),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function obtenerPublicacion(id) {
  const snap = await getDoc(doc(db, 'publicaciones', id));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function obtenerPublicacionesDeUsuario(usuarioId) {
  const q = query(publicacionesRef(), where('vendedorId', '==', usuarioId), orderBy('creadoEn', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function marcarComoVendido(id) {
  return updateDoc(doc(db, 'publicaciones', id), { estado: 'vendido' });
}

export function alternarDestacado(id, destacado) {
  return updateDoc(doc(db, 'publicaciones', id), { destacado });
}
