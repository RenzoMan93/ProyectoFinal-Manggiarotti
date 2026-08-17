import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import BottomNav from '../../components/BottomNav.jsx';
import RateSellerModal from '../../components/RateSellerModal.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { auth } from '../../firebase';
import { subscribeToSellerProducts } from '../../services/productsService';
import { subscribeToBuyerOrders } from '../../services/ordersService';
import { removeFavorite } from '../../services/favoritesService';
import { getSellerRating } from '../../services/sellersService';
import { useFavorites } from '../../hooks/useFavorites';
import { formatPrice } from '../../utils/format';
import styles from './Profile.module.css';

const ORDER_STATUS_LABELS = {
  pending_payment: 'Pago pendiente',
  paid: 'Pagado',
  awaiting_cash_payment: 'Esperando pago en efectivo',
  pending_cod: 'Pago al recibir',
};

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [sellerRating, setSellerRating] = useState(null);
  const [ratingOrder, setRatingOrder] = useState(null);
  const { favorites } = useFavorites();

  useEffect(() => {
    const unsub = subscribeToSellerProducts(user.uid, setListings);
    return unsub;
  }, [user.uid]);

  useEffect(() => {
    const unsub = subscribeToBuyerOrders(user.uid, setOrders);
    return unsub;
  }, [user.uid]);

  useEffect(() => {
    getSellerRating(user.uid).then(setSellerRating);
  }, [user.uid, ratingOrder]);

  const name = profile?.name || user.email.split('@')[0];
  const status = profile?.verificationStatus || 'unverified';

  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.avatar}>{name[0]?.toUpperCase()}</div>
        <div>
          <div className={styles.name}>{name}</div>
          <div className={styles.email}>{user.email}</div>
          {sellerRating?.ratingCount > 0 && (
            <div className={styles.ratingLine}>
              ⭐ {sellerRating.ratingAvg.toFixed(1)} · {sellerRating.ratingCount} calificaci{sellerRating.ratingCount === 1 ? 'ón' : 'ones'} como
              vendedor
            </div>
          )}
        </div>
      </div>

      <div className={styles.body}>
        <StatusCard status={status} onVerify={() => navigate('/verificar')} />

        <div className={styles.sectionLabel}>Mis compras</div>
        {orders.length === 0 ? (
          <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>Todavía no compraste nada.</p>
        ) : (
          orders.map((o) => (
            <div key={o.id} className={styles.listingRow}>
              <img
                className={styles.listingImg}
                src={o.productPhoto}
                alt=""
                onClick={() => navigate(`/producto/${o.productId}`)}
              />
              <div style={{ flex: 1, minWidth: 0, cursor: 'pointer' }} onClick={() => navigate(`/producto/${o.productId}`)}>
                <div className={styles.listingTitle}>{o.productTitle}</div>
                <div className={styles.orderStatus}>{ORDER_STATUS_LABELS[o.status] || o.status}</div>
              </div>
              {o.status !== 'pending_payment' && !o.reviewed && (
                <button className={styles.rateBtn} onClick={() => setRatingOrder(o)}>
                  Calificar
                </button>
              )}
              {o.reviewed && <span className={styles.reviewedTag}>✓ Calificado</span>}
            </div>
          ))
        )}

        <div className={styles.sectionLabel}>Favoritos</div>
        {favorites.length === 0 ? (
          <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>Todavía no guardaste ninguna publicación.</p>
        ) : (
          favorites.map((f) => (
            <div key={f.id} className={styles.listingRow} onClick={() => navigate(`/producto/${f.id}`)}>
              <img className={styles.listingImg} src={f.photo} alt="" />
              <div className={styles.listingTitle} style={{ flex: 1 }}>
                {f.title}
              </div>
              <div className={styles.listingPrice}>{formatPrice(f.price, f.currency)}</div>
              <button
                className={styles.removeFavBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  removeFavorite(user.uid, f.id);
                }}
                aria-label="Quitar de favoritos"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))
        )}

        <div className={styles.sectionLabel}>Mis publicaciones</div>
        {listings.length === 0 ? (
          <p style={{ fontSize: 12.5, color: 'var(--muted)' }}>Todavía no publicaste nada.</p>
        ) : (
          listings.map((p) => (
            <div key={p.id} className={styles.listingRow} onClick={() => navigate(`/producto/${p.id}`)}>
              <img className={styles.listingImg} src={p.photos?.[0]} alt="" />
              <div className={styles.listingTitle}>{p.title}</div>
              <div className={styles.listingPrice}>{formatPrice(p.price, p.currency)}</div>
            </div>
          ))
        )}

        <button className={styles.logout} onClick={() => signOut(auth)}>
          Cerrar sesión
        </button>
      </div>

      {ratingOrder && (
        <RateSellerModal
          order={ratingOrder}
          buyerName={name}
          onClose={() => setRatingOrder(null)}
          onDone={() => setRatingOrder(null)}
        />
      )}

      <BottomNav />
    </>
  );
}

function StatusCard({ status, onVerify }) {
  if (status === 'verified') {
    return (
      <div className={`${styles.statusCard} ${styles.verified}`}>
        <span>✅</span>
        <span>Tu identidad está verificada. Podés comprar y vender con la insignia de vendedor verificado.</span>
      </div>
    );
  }
  if (status === 'pending') {
    return (
      <div className={`${styles.statusCard} ${styles.pending}`}>
        <span>⏳</span>
        <span>Tu verificación está en revisión. Te avisamos por correo cuando quede lista.</span>
      </div>
    );
  }
  return (
    <div className={`${styles.statusCard} ${styles.unverified}`}>
      <span>🔒</span>
      <span>
        Todavía no verificaste tu identidad. <button onClick={onVerify}>Verificarme ahora</button>
      </span>
    </div>
  );
}
