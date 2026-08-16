import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import BottomNav from '../../components/BottomNav.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { auth } from '../../firebase';
import { subscribeToSellerProducts } from '../../services/productsService';
import { formatPrice } from '../../utils/format';
import styles from './Profile.module.css';

export default function Profile() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [listings, setListings] = useState([]);

  useEffect(() => {
    const unsub = subscribeToSellerProducts(user.uid, setListings);
    return unsub;
  }, [user.uid]);

  const name = profile?.name || user.email.split('@')[0];
  const status = profile?.verificationStatus || 'unverified';

  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.avatar}>{name[0]?.toUpperCase()}</div>
        <div>
          <div className={styles.name}>{name}</div>
          <div className={styles.email}>{user.email}</div>
        </div>
      </div>

      <div className={styles.body}>
        <StatusCard status={status} onVerify={() => navigate('/verificar')} />

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
