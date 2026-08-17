import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
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

/**
 * Exact address + map pin, kept in a subcollection with its own Firestore
 * rules (only the seller can read/write it — see firestore.rules) so it
 * never ends up in the public product document. City/neighborhood stay on
 * the product itself; this is only for the precise pickup/delivery point.
 */
export async function setProductLocation(productId, location) {
  await setDoc(doc(db, 'products', productId, 'private', 'location'), location);
}

/**
 * Sworn statement (declaración jurada) required for vehicle listings —
 * the seller attests they're the legal owner (or authorized to sell), the
 * vehicle isn't stolen, and it has no legal impediment to sale. Kept in the
 * same seller-only-readable subcollection pattern as the address, since a
 * license plate is identifying information that shouldn't be public, but
 * still needs to be recoverable if a fraud claim ever needs to be checked.
 */
export async function setVehicleDeclaration(productId, declaration) {
  await setDoc(doc(db, 'products', productId, 'private', 'vehicleDeclaration'), {
    ...declaration,
    declaredAt: serverTimestamp(),
  });
}
