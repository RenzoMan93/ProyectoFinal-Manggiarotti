import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

const productsCol = collection(db, 'products');

/** Realtime subscription to active listings, newest first. Filtering by
 * category/condition/price/etc. happens client-side (see Feed.jsx) since the
 * prototype's filter set is broad and the catalog is small enough for this
 * project's scale; move to compound Firestore queries if it grows. */
export function subscribeToActiveProducts(callback) {
  const q = query(productsCol, where('status', '==', 'active'), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToSellerProducts(sellerId, callback) {
  const q = query(productsCol, where('sellerId', '==', sellerId), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToProduct(productId, callback) {
  return onSnapshot(doc(db, 'products', productId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}

export async function getProduct(productId) {
  const snap = await getDoc(doc(db, 'products', productId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function createProduct(sellerId, sellerName, data) {
  const ref = await addDoc(productsCol, {
    ...data,
    sellerId,
    sellerName,
    status: 'active',
    views: 0,
    createdAt: serverTimestamp(),
  });
  return ref.id;
}
