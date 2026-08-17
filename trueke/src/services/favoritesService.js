import { collection, deleteDoc, doc, onSnapshot, orderBy, query, serverTimestamp, setDoc } from 'firebase/firestore';
import { db } from '../firebase';

function favoriteDoc(uid, productId) {
  return doc(db, 'users', uid, 'favorites', productId);
}

/** A small denormalized snapshot (not just the product id) so the
 * "Favoritos" list in Profile can render without an extra read per item —
 * same pattern chatService.js already uses for conversations. */
export async function addFavorite(uid, product) {
  await setDoc(favoriteDoc(uid, product.id), {
    title: product.title,
    photo: product.photos?.[0] || null,
    price: product.price,
    currency: product.currency,
    createdAt: serverTimestamp(),
  });
}

export async function removeFavorite(uid, productId) {
  await deleteDoc(favoriteDoc(uid, productId));
}

export function subscribeToFavorites(uid, callback) {
  const q = query(collection(db, 'users', uid, 'favorites'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}
