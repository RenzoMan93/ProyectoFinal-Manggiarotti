import React, { useState } from 'react';
import StarPicker from './StarPicker.jsx';
import { createReview } from '../services/reviewsService';
import styles from './RateSellerModal.module.css';

/** Post-purchase rating prompt — see Profile.jsx "Mis compras" for where
 * this gets triggered from. */
export default function RateSellerModal({ order, buyerName, onClose, onDone }) {
  const [rating, setRating] = useState(null);
  const [comment, setComment] = useState('');
  const [saving, setSaving] = useState(false);

  async function submit() {
    if (!rating || saving) return;
    setSaving(true);
    try {
      await createReview({
        orderId: order.id,
        productId: order.productId,
        sellerId: order.sellerId,
        buyerId: order.buyerId,
        buyerName,
        rating,
        comment,
      });
      onDone();
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className={styles.overlay} onClick={onClose} />
      <div className={styles.modal}>
        <div className={styles.title}>¿Cómo te fue con este vendedor?</div>
        <div className={styles.sub}>"{order.productTitle}"</div>
        <div className={styles.starsWrap}>
          <StarPicker value={rating} onChange={setRating} />
        </div>
        <textarea
          className={styles.comment}
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Contá tu experiencia (opcional)"
        />
        <div className={styles.actions}>
          <button className="btn-ghost" onClick={onClose}>
            Ahora no
          </button>
          <button className={`btn-solid ${rating ? 'active' : ''}`} disabled={!rating || saving} onClick={submit}>
            {saving ? 'Enviando…' : 'Enviar calificación'}
          </button>
        </div>
      </div>
    </>
  );
}
