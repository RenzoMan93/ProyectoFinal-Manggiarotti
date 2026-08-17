import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Public, read-only mirror of a seller's aggregate rating — a separate
 * top-level doc (not a field on `users/{uid}`) so it can be publicly
 * readable without exposing the rest of the profile (email, KYC documents,
 * etc). Only ever written by functions/index.js's applyReview via the
 * Admin SDK; there's no client write path at all (see firestore.rules).
 */
export async function getSellerRating(sellerId) {
  const snap = await getDoc(doc(db, 'sellers', sellerId));
  return snap.exists() ? snap.data() : null;
}
