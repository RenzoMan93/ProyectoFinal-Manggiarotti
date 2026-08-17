import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const reviewsCol = collection(db, 'reviews');

/**
 * A buyer rating a seller after a purchase — one per order. The seller's
 * aggregate rating (shown on their listings and profile) is recomputed
 * server-side from these (see functions/index.js applyReview), never
 * written directly by the client, so a buyer can't forge a seller's score.
 * firestore.rules cross-checks the order itself so a review can't be
 * created for a purchase that never happened.
 */
export async function createReview({ orderId, productId, sellerId, buyerId, buyerName, rating, comment }) {
  await addDoc(reviewsCol, {
    orderId,
    productId,
    sellerId,
    buyerId,
    buyerName,
    rating,
    comment: (comment || '').trim(),
    createdAt: serverTimestamp(),
  });
  // Denormalized onto the order so "Mis compras" can hide the "Calificar"
  // button without a separate query per order.
  await updateDoc(doc(db, 'orders', orderId), { reviewed: true });
}
