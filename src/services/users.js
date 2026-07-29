import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

export async function obtenerUsuario(uid) {
  const snap = await getDoc(doc(db, 'usuarios', uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}
