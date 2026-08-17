import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';

const conversationsCol = collection(db, 'conversations');

/** Finds (or creates) the single conversation between a buyer and a seller
 * about one product, so re-opening the chat continues the same thread.
 * Denormalizes a bit of product info onto the conversation so the inbox
 * (Messages page) can list threads without an extra read per product. */
export async function getOrCreateConversation(product, buyerId, buyerName) {
  const q = query(
    conversationsCol,
    where('productId', '==', product.id),
    where('buyerId', '==', buyerId)
  );
  const existing = await getDocs(q);
  if (!existing.empty) return existing.docs[0].id;

  const ref = doc(conversationsCol);
  await setDoc(ref, {
    productId: product.id,
    productTitle: product.title,
    productPhoto: product.photos?.[0] || null,
    buyerId,
    buyerName,
    sellerId: product.sellerId,
    sellerName: product.sellerName,
    participants: [buyerId, product.sellerId],
    lastMessage: '',
    updatedAt: serverTimestamp(),
    createdAt: serverTimestamp(),
  });
  return ref.id;
}

export function subscribeToUserConversations(uid, callback) {
  const q = query(conversationsCol, where('participants', 'array-contains', uid), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function subscribeToMessages(conversationId, callback) {
  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('createdAt', 'asc')
  );
  return onSnapshot(q, (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export async function sendMessage(conversationId, senderId, text) {
  await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
    senderId,
    text,
    createdAt: serverTimestamp(),
  });
  await updateDoc(doc(db, 'conversations', conversationId), {
    lastMessage: text,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Canned first-response engine keyed off the product's own fields — this is
 * NOT a real language model. It mirrors the prototype's "asistente de
 * compra" quick replies so the buyer gets an instant answer before the
 * seller responds. To swap in a real LLM, replace this with a call to a
 * Cloud Function that holds the API key server-side (never call an LLM API
 * with a secret key from the client).
 */
export function buildAutoReply(product, question) {
  const q = question.toLowerCase();
  if (q.includes('estado') || q.includes('funciona') || q.includes('roto') || q.includes('daño')) {
    return `Según la publicación, el producto tiene ${product.conditionStars}/5 estrellas de estado. ${
      product.aiSummary?.condition || 'El vendedor no agregó más detalles sobre el funcionamiento.'
    }`;
  }
  if (q.includes('envío') || q.includes('envio') || q.includes('manda') || q.includes('llega')) {
    return 'Podés coordinar envío a domicilio o retiro en persona — elegís la opción al momento de comprar, en el checkout.';
  }
  if (q.includes('pago') || q.includes('tarjeta') || q.includes('efectivo') || q.includes('mercado pago')) {
    return 'Se puede pagar con tarjeta, Mercado Pago o depósito en redes de cobranza. Tu pago queda protegido hasta que confirmes que recibiste el producto.';
  }
  if (q.includes('precio') || q.includes('descuento') || q.includes('rebaja')) {
    return `El precio publicado es $${product.price}. Para negociar, escribile directamente a ${product.sellerName}.`;
  }
  return `Buena pregunta — te recomiendo confirmarlo directamente con ${product.sellerName}. Le avisamos que le escribiste.`;
}
