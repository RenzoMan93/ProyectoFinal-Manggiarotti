import { addDoc, collection, doc, onSnapshot, serverTimestamp, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';

const ordersCol = collection(db, 'orders');

export async function createOrder(order) {
  const ref = await addDoc(ordersCol, {
    ...order,
    status: 'pending_payment',
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export async function markOrderPaid(orderId, paymentReference) {
  await updateDoc(doc(db, 'orders', orderId), {
    status: 'paid',
    paymentReference,
    paidAt: serverTimestamp(),
  });
}

export function subscribeToOrder(orderId, callback) {
  return onSnapshot(doc(db, 'orders', orderId), (snap) => {
    callback(snap.exists() ? { id: snap.id, ...snap.data() } : null);
  });
}
