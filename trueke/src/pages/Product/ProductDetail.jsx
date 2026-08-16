import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { subscribeToProduct } from '../../services/productsService';
import { buildAutoReply, getOrCreateConversation, sendMessage, subscribeToMessages } from '../../services/chatService';
import { formatPrice } from '../../utils/format';
import { fullConditionLabel } from '../../utils/condition';
import styles from './ProductDetail.module.css';

const QUICK_QUESTIONS = [
  { key: 'estado', label: '¿En qué estado está?' },
  { key: 'envio', label: '¿Hace envíos?' },
  { key: 'pago', label: '¿Qué medios de pago acepta?' },
];

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();

  const [product, setProduct] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);
  const [galIndex, setGalIndex] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);

  useEffect(() => {
    const unsub = subscribeToProduct(id, setProduct);
    return unsub;
  }, [id]);

  useEffect(() => {
    if (searchParams.get('chat') === '1' && user) setChatOpen(true);
  }, [searchParams, user]);

  if (!product) {
    return <div className="centered-loader">Cargando publicación…</div>;
  }

  const photos = product.photos?.length ? product.photos : [];
  const discount = product.oldPrice
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : null;
  const isOwner = !!user && product.sellerId === user.uid;

  function openChat() {
    if (!user) {
      navigate('/login', { state: { from: { pathname: `/producto/${id}` } } });
      return;
    }
    setChatOpen(true);
  }

  return (
    <>
      <Gallery photos={photos} index={galIndex} setIndex={setGalIndex} onBack={() => navigate(-1)} />

      <div className={styles.bodyScroll}>
        <div className={styles.panel}>
          <div className={styles.titleLg}>{product.title}</div>
          <div className={styles.priceRow}>
            <span className={styles.priceBig}>{formatPrice(product.price, product.currency)}</span>
            {product.oldPrice && <span className={styles.priceOldLg}>{formatPrice(product.oldPrice, product.currency)}</span>}
            {discount && <span className={styles.discountTag}>-{discount}%</span>}
          </div>
          <div className={styles.metaRow}>
            <span>📍 {product.city || 'Uruguay'}</span>
            <span>👁 {product.views || 0} vistas</span>
          </div>

          <div className={styles.specs}>
            {product.brand && (
              <div>
                <div className={styles.specLabel}>Marca</div>
                <div className={styles.specVal}>{product.brand}</div>
              </div>
            )}
            <div>
              <div className={styles.specLabel}>Estado</div>
              <div className={styles.specVal}>{fullConditionLabel(product)}</div>
            </div>
            <div>
              <div className={styles.specLabel}>{product.categories?.length > 1 ? 'Categorías' : 'Categoría'}</div>
              <div className={styles.specVal}>{product.categories?.length ? product.categories.join(', ') : '—'}</div>
            </div>
            {product.material && (
              <div>
                <div className={styles.specLabel}>Material</div>
                <div className={styles.specVal}>{product.material}</div>
              </div>
            )}
            {product.color && (
              <div>
                <div className={styles.specLabel}>Color</div>
                <div className={styles.specVal}>{product.color}</div>
              </div>
            )}
          </div>

          <AiSummary product={product} showOriginal={showOriginal} setShowOriginal={setShowOriginal} />

          <div className={styles.aiNote}>
            <span>🛡️</span>
            <span>
              Las fotos de esta publicación pasaron una revisión automática de calidad (resolución y nitidez). El
              estado declarado es responsabilidad del vendedor.
            </span>
          </div>
        </div>
      </div>

      <div className={styles.buybar}>
        {!isOwner && (
          <button className={styles.btnAsk} onClick={openChat}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B4B43" strokeWidth="2.2">
              <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
            </svg>
          </button>
        )}
        <button
          className={styles.btnBuy}
          onClick={() =>
            isOwner
              ? navigate('/perfil')
              : user
              ? navigate(`/checkout/${product.id}`)
              : navigate('/login', { state: { from: { pathname: `/checkout/${product.id}` } } })
          }
        >
          {isOwner ? 'Vender ahora' : 'Comprar ahora'}
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {!isOwner && chatOpen && <ChatDrawer product={product} onClose={() => setChatOpen(false)} />}
    </>
  );
}

function AiSummary({ product, showOriginal, setShowOriginal }) {
  const summary = product.aiSummary;

  return (
    <div className={styles.aiDesc}>
      <div className={styles.aiDescHead}>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#1B4B43" strokeWidth="2.3">
          <rect x="4" y="8" width="16" height="12" rx="3" />
          <path d="M12 8V4" />
          <circle cx="12" cy="3" r="1" fill="#1B4B43" />
          <circle cx="9" cy="14" r="1" fill="#1B4B43" />
          <circle cx="15" cy="14" r="1" fill="#1B4B43" />
        </svg>
        Resumen generado por IA a partir del texto del vendedor
      </div>

      {!summary ? (
        <div className={styles.aiGenerating}>
          <div className="mini-spinner" />
          Generando resumen automático… (puede tardar unos segundos la primera vez)
        </div>
      ) : (
        <div className={styles.aiDescGrid}>
          <SummaryItem icon="⚙️" label="Estado y funcionamiento" text={summary.condition} />
          <SummaryItem icon="📦" label="Qué incluye" text={summary.includes} />
          <SummaryItem icon="💬" label="Motivo de venta" text={summary.saleReason} />
          <SummaryItem icon="🔎" label="A tener en cuenta" text={summary.notes} />
        </div>
      )}

      <button className={styles.toggleOriginal} onClick={() => setShowOriginal((s) => !s)}>
        {showOriginal ? 'Ocultar texto original del vendedor' : 'Ver texto original del vendedor'}
        <svg
          width="10"
          height="10"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          style={{ transform: showOriginal ? 'rotate(180deg)' : 'none' }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      <div className={`${styles.originalBox} ${showOriginal ? styles.show : ''}`}>{product.description}</div>
    </div>
  );
}

function SummaryItem({ icon, label, text }) {
  const missing = !text;
  return (
    <div className={`${styles.aiDescItem} ${missing ? styles.missing : ''}`}>
      <div className={styles.aiDescIcon}>{icon}</div>
      <div>
        <div className={styles.aiDescLabel}>{label}</div>
        <div className={`${styles.aiDescText} ${missing ? styles.missing : ''}`}>
          {text || 'No indicado por el vendedor'}
        </div>
      </div>
    </div>
  );
}

function Gallery({ photos, index, setIndex, onBack }) {
  const containerRef = useRef(null);
  const trackRef = useRef(null);
  const dragState = useRef({ dragging: false, startX: 0, offset: 0 });
  const [, forceRender] = useState(0);

  function setTrack(withTransition) {
    const track = trackRef.current;
    if (!track) return;
    track.style.transition = withTransition ? 'transform .32s cubic-bezier(.22,.8,.36,1)' : 'none';
    track.style.transform = `translateX(calc(${-index * 100}% + ${dragState.current.offset}px))`;
  }

  useEffect(() => setTrack(true), [index]);

  function goTo(i) {
    setIndex(Math.max(0, Math.min(photos.length - 1, i)));
    dragState.current.offset = 0;
  }

  function onPointerDown(e) {
    dragState.current = { dragging: true, startX: e.clientX, offset: 0 };
    containerRef.current?.setPointerCapture(e.pointerId);
  }
  function onPointerMove(e) {
    if (!dragState.current.dragging) return;
    dragState.current.offset = e.clientX - dragState.current.startX;
    setTrack(false);
  }
  function onPointerUp(e) {
    if (!dragState.current.dragging) return;
    dragState.current.dragging = false;
    const offset = dragState.current.offset;
    const THRESHOLD = 45;
    if (Math.abs(offset) > THRESHOLD) {
      goTo(offset < 0 ? index + 1 : index - 1);
    } else {
      dragState.current.offset = 0;
      setTrack(true);
    }
    forceRender((n) => n + 1);
  }

  return (
    <div
      className={styles.gallery}
      ref={containerRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <div className={styles.galleryTrack} ref={trackRef}>
        {photos.map((src, i) => (
          <img key={i} src={src} draggable={false} alt="" />
        ))}
      </div>
      <div className={styles.galTop}>
        <button className="icon-btn" onClick={onBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>
      {photos.length > 1 && (
        <>
          <button
            className={`${styles.galArrow} ${styles.galArrowLeft}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
            aria-label="Foto anterior"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button
            className={`${styles.galArrow} ${styles.galArrowRight}`}
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => goTo(index + 1)}
            disabled={index === photos.length - 1}
            aria-label="Foto siguiente"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.8">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </>
      )}
      {photos.length > 0 && <div className={styles.galCount}>{index + 1}/{photos.length}</div>}
      <div className={styles.galDots}>
        {photos.map((_, i) => (
          <div key={i} className={`${styles.galDot} ${i === index ? styles.active : ''}`} />
        ))}
      </div>
    </div>
  );
}

function ChatDrawer({ product, onClose }) {
  const { user, profile } = useAuth();
  const [conversationId, setConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [typing, setTyping] = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    let unsubMessages;
    const buyerName = profile?.name || user.email.split('@')[0];
    getOrCreateConversation(product, user.uid, buyerName).then((id) => {
      setConversationId(id);
      unsubMessages = subscribeToMessages(id, setMessages);
    });
    return () => unsubMessages?.();
  }, [product, user.uid, profile]);

  useEffect(() => {
    bodyRef.current?.scrollTo({ top: bodyRef.current.scrollHeight });
  }, [messages, typing]);

  async function send(content) {
    if (!content.trim() || !conversationId) return;
    await sendMessage(conversationId, user.uid, content.trim());
    setText('');

    const lower = content.toLowerCase();
    const matched = ['estado', 'funciona', 'envío', 'envio', 'pago', 'tarjeta', 'efectivo', 'precio'].some((k) =>
      lower.includes(k)
    );
    if (matched) {
      setTyping(true);
      setTimeout(async () => {
        setTyping(false);
        await sendMessage(conversationId, 'assistant', buildAutoReply(product, content));
      }, 800);
    }
  }

  return (
    <>
      <div className={`${styles.overlay} ${styles.open}`} onClick={onClose} />
      <div className={`${styles.chatDrawer} ${styles.open}`}>
        <div className={styles.chatHead}>
          <div className={styles.botAvatar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9A22C" strokeWidth="2">
              <rect x="4" y="8" width="16" height="12" rx="3" />
              <path d="M12 8V4" />
            </svg>
          </div>
          <div className={styles.chatHeadText}>
            <div className={styles.chatHeadTitle}>Chat con {product.sellerName}</div>
            <div className={styles.chatHeadSub}>
              <span className={styles.live} /> sobre "{product.title}"
            </div>
          </div>
          <button className={styles.chatClose} onClick={onClose}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1E241F" strokeWidth="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className={styles.chatBody} ref={bodyRef}>
          <div className={styles.msgNote}>Las respuestas automáticas se generan a partir de esta publicación</div>
          {messages.map((m) => (
            <div key={m.id} className={`${styles.msg} ${m.senderId === user.uid ? styles.user : styles.bot}`}>
              {m.text}
            </div>
          ))}
          {typing && (
            <div className={`${styles.msg} ${styles.bot} ${styles.typing}`}>
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <div className={styles.quickRow}>
          {QUICK_QUESTIONS.map((q) => (
            <div key={q.key} className={styles.quickChip} onClick={() => send(q.label)}>
              {q.label}
            </div>
          ))}
        </div>

        <div className={styles.chatInputRow}>
          <input
            className={styles.chatInput}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Escribí tu pregunta..."
            onKeyDown={(e) => e.key === 'Enter' && send(text)}
          />
          <button className={styles.chatSend} onClick={() => send(text)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </>
  );
}
