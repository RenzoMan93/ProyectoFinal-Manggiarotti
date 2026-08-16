import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { subscribeToUserConversations } from '../../services/chatService';
import styles from './Messages.module.css';

export default function Messages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);

  useEffect(() => {
    const unsub = subscribeToUserConversations(user.uid, setConversations);
    return unsub;
  }, [user.uid]);

  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.title}>Mensajes</div>
      </div>

      <div className={styles.list}>
        {conversations.length === 0 ? (
          <div className={styles.empty}>Todavía no tenés conversaciones. Escribile a un vendedor desde una publicación.</div>
        ) : (
          conversations.map((c) => {
            const isBuyer = c.buyerId === user.uid;
            const otherName = isBuyer ? c.sellerName : c.buyerName || 'Comprador';
            return (
              <div key={c.id} className={styles.row} onClick={() => navigate(`/producto/${c.productId}?chat=1`)}>
                <img className={styles.thumb} src={c.productPhoto} alt="" />
                <div className={styles.info}>
                  <div className={styles.name}>{otherName}</div>
                  <div className={styles.product}>{c.productTitle}</div>
                  <div className={styles.last}>{c.lastMessage || 'Sin mensajes todavía'}</div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <BottomNav />
    </>
  );
}
