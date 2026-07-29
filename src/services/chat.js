import {
  addDoc,
  collection,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Devuelve el chat existente entre comprador y vendedor para una publicación,
 * o crea uno nuevo si es el primer mensaje.
 */
export async function obtenerOCrearChat({ publicacionId, publicacionTitulo, compradorId, vendedorId }) {
  const q = query(
    collection(db, 'chats'),
    where('publicacionId', '==', publicacionId),
    where('compradorId', '==', compradorId),
  );
  const snap = await getDocs(q);
  if (!snap.empty) return snap.docs[0].id;

  const docRef = await addDoc(collection(db, 'chats'), {
    publicacionId,
    publicacionTitulo,
    compradorId,
    vendedorId,
    participantes: [compradorId, vendedorId],
    ultimoMensaje: '',
    ultimoMensajeEn: serverTimestamp(),
  });
  return docRef.id;
}

export function escucharChatsDeUsuario(usuarioId, callback) {
  const q = query(
    collection(db, 'chats'),
    where('participantes', 'array-contains', usuarioId),
    orderBy('ultimoMensajeEn', 'desc'),
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function escucharMensajes(chatId, callback) {
  const q = query(collection(db, 'chats', chatId, 'mensajes'), orderBy('creadoEn', 'asc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function enviarMensaje(chatId, { emisorId, texto }) {
  await addDoc(collection(db, 'chats', chatId, 'mensajes'), {
    emisorId,
    texto,
    creadoEn: serverTimestamp(),
  });
  await updateDoc(doc(db, 'chats', chatId), {
    ultimoMensaje: texto,
    ultimoMensajeEn: serverTimestamp(),
  });
}
