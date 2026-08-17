import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { getProduct } from '../../services/productsService';
import { createOrder, markOrderPaid } from '../../services/ordersService';
import { processPayment } from '../../services/paymentProvider';
import { formatPrice } from '../../utils/format';
import styles from './Checkout.module.css';

const STEP_LABELS = ['Entrega', 'Pago', 'Confirmar', 'Listo'];
const CASH_ON_DELIVERY_LIMIT = 3000;
const SHIPPING_COST = 8;

export default function Checkout() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [product, setProduct] = useState(undefined);
  const [step, setStep] = useState(1);

  const [entrega, setEntrega] = useState(null);
  const [direccion, setDireccion] = useState('');
  const [ciudadEnvio, setCiudadEnvio] = useState('');
  const [cpEnvio, setCpEnvio] = useState('');

  const [pago, setPago] = useState(null);
  const [card, setCard] = useState({ num: '', exp: '', cvv: '', name: '' });
  const [red, setRed] = useState(null);
  const [code] = useState(() => `${rand4()} ${rand4()}`);

  const [orderId, setOrderId] = useState(null);
  const [orderStatus, setOrderStatus] = useState(null);
  const [processing, setProcessing] = useState(true);
  const startedRef = useRef(false);

  useEffect(() => {
    getProduct(id).then(setProduct);
  }, [id]);

  if (product === undefined) return <div className="centered-loader">Cargando…</div>;
  if (product === null) return <div className="centered-loader">Esta publicación ya no está disponible.</div>;

  const total = product.price + (entrega === 'retiro' ? 0 : SHIPPING_COST);
  const codLimitOk = total <= CASH_ON_DELIVERY_LIMIT;

  const step1Valid = entrega === 'retiro' || (entrega === 'domicilio' && direccion.trim() && ciudadEnvio.trim() && cpEnvio.trim());
  const step2Valid =
    (pago === 'tarjeta' && card.num.trim() && card.exp.trim() && card.cvv.trim() && card.name.trim()) ||
    pago === 'mp' ||
    (pago === 'efectivo' && !!red) ||
    (pago === 'efectivo_entrega' && codLimitOk);

  function goNext() {
    if (step === 1 && step1Valid) setStep(2);
    else if (step === 2 && step2Valid) setStep(3);
    else if (step === 3) setStep(4);
  }
  function goBack() {
    if (step === 1) navigate(-1);
    else setStep((s) => s - 1);
  }

  useEffect(() => {
    if (step !== 4 || startedRef.current) return;
    startedRef.current = true;
    runCheckout();

    async function runCheckout() {
      const id = await createOrder({
        productId: product.id,
        buyerId: user.uid,
        sellerId: product.sellerId,
        deliveryMethod: entrega,
        deliveryAddress: entrega === 'domicilio' ? { direccion, ciudad: ciudadEnvio, cp: cpEnvio } : null,
        paymentMethod: pago,
        cobranza: pago === 'efectivo' ? { red, code } : null,
        amountProduct: product.price,
        amountShipping: entrega === 'retiro' ? 0 : SHIPPING_COST,
        amountTotal: total,
      });
      setOrderId(id);

      if (pago === 'tarjeta' || pago === 'mp') {
        const result = await processPayment({ method: pago, amount: total });
        if (result.success) {
          await markOrderPaid(id, result.reference);
          setOrderStatus('paid');
        }
      } else if (pago === 'efectivo') {
        await new Promise((r) => setTimeout(r, 1200));
        setOrderStatus('awaiting_cash_payment');
      } else {
        await new Promise((r) => setTimeout(r, 1200));
        setOrderStatus('pending_cod');
      }
      setProcessing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.topRow}>
          <button className="icon-btn" onClick={goBack} disabled={step === 4}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className={styles.topbarTitle}>Finalizar compra</div>
        </div>
        <StepsRow current={step} />
      </div>

      <div className={styles.bodyScroll}>
        {step === 1 && (
          <StepEntrega
            product={product}
            entrega={entrega}
            setEntrega={setEntrega}
            direccion={direccion}
            setDireccion={setDireccion}
            ciudadEnvio={ciudadEnvio}
            setCiudadEnvio={setCiudadEnvio}
            cpEnvio={cpEnvio}
            setCpEnvio={setCpEnvio}
          />
        )}
        {step === 2 && (
          <StepPago
            pago={pago}
            setPago={setPago}
            card={card}
            setCard={setCard}
            red={red}
            setRed={setRed}
            code={code}
            codLimitOk={codLimitOk}
            total={total}
            currency={product.currency}
          />
        )}
        {step === 3 && <StepConfirmar product={product} entrega={entrega} pago={pago} red={red} total={total} />}
        {step === 4 && (
          <StepResultado
            processing={processing}
            orderId={orderId}
            orderStatus={orderStatus}
            pago={pago}
            red={red}
            code={code}
          />
        )}
      </div>

      {step < 4 && (
        <div className={styles.footerNav}>
          <button className="btn-ghost" onClick={goBack}>
            Atrás
          </button>
          <button
            className={`btn-solid ${(step === 1 && step1Valid) || (step === 2 && step2Valid) || step === 3 ? 'active' : ''}`}
            onClick={goNext}
          >
            {step === 3 ? 'Confirmar y pagar' : 'Continuar'}
          </button>
        </div>
      )}
    </>
  );
}

function rand4() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

function StepsRow({ current }) {
  return (
    <div className={styles.steps}>
      {STEP_LABELS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? 'done' : n === current ? 'active' : '';
        return (
          <React.Fragment key={label}>
            <div className={`${styles.stepDotWrap} ${styles[state] || ''}`}>
              <div className={styles.stepDot}>{n < current ? '✓' : n}</div>
              <div className={styles.stepLabel}>{label}</div>
            </div>
            {n < STEP_LABELS.length && <div className={`${styles.stepLine} ${n < current ? styles.done : ''}`} />}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function StepEntrega({ product, entrega, setEntrega, direccion, setDireccion, ciudadEnvio, setCiudadEnvio, cpEnvio, setCpEnvio }) {
  return (
    <div>
      <div className={styles.stepTitle}>Entrega</div>
      <div className={styles.stepSub}>Elegí cómo querés recibir tu producto.</div>

      <div className={styles.prodCard}>
        <img className={styles.prodImg} src={product.photos?.[0]} alt="" />
        <div>
          <div className={styles.prodTitle}>{product.title}</div>
          <div className={styles.prodSeller}>Vendido por {product.sellerName}{product.sellerVerified ? ' ✓' : ''}</div>
        </div>
        <div className={styles.prodPrice}>{formatPrice(product.price, product.currency)}</div>
      </div>

      <div className={styles.sectionLabel}>Forma de entrega</div>

      {(product.deliveryOption === 'envio' || product.deliveryOption === 'ambos') && (
        <div className={`${styles.optCard} ${entrega === 'domicilio' ? styles.sel : ''}`} onClick={() => setEntrega('domicilio')}>
          <div className={styles.optIcon}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="1" y="7" width="15" height="10" rx="1.5" />
              <path d="M16 10h3l3 3v4h-6z" />
              <circle cx="6" cy="19" r="1.6" />
              <circle cx="18" cy="19" r="1.6" />
            </svg>
          </div>
          <div className={styles.optText}>
            <div className={styles.optTitle}>Envío a domicilio</div>
            <div className={styles.optSub}>Llega en 2-4 días hábiles</div>
          </div>
          <div className={styles.optPrice}>{formatPrice(SHIPPING_COST, product.currency)}</div>
        </div>
      )}
      <div className={`${styles.optCard} ${entrega === 'retiro' ? styles.sel : ''}`} onClick={() => setEntrega('retiro')}>
        <div className={styles.optIcon}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 11l9-7 9 7" />
            <path d="M5 10v10h14V10" />
          </svg>
        </div>
        <div className={styles.optText}>
          <div className={styles.optTitle}>Retirar en persona</div>
          <div className={styles.optSub}>Coordinás punto de encuentro con el vendedor</div>
        </div>
        <div className={styles.optPrice}>Gratis</div>
      </div>

      {entrega === 'domicilio' && (
        <div className={styles.conditionalBlock}>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>Dirección</div>
            <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle y número" />
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Ciudad</div>
              <input type="text" value={ciudadEnvio} onChange={(e) => setCiudadEnvio(e.target.value)} placeholder="Ej: Punta del Este" />
            </div>
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Código postal</div>
              <input type="text" value={cpEnvio} onChange={(e) => setCpEnvio(e.target.value)} placeholder="Ej: 20100" />
            </div>
          </div>
        </div>
      )}
      {entrega === 'retiro' && (
        <div className={styles.escrowBox} style={{ marginTop: 14 }}>
          🤝 Vas a coordinar el punto de encuentro y el horario directamente por chat con <b>{product.sellerName}</b>{' '}
          una vez confirmada la compra.
        </div>
      )}
    </div>
  );
}

function StepPago({ pago, setPago, card, setCard, red, setRed, code, codLimitOk, total, currency }) {
  return (
    <div>
      <div className={styles.stepTitle}>Método de pago</div>
      <div className={styles.stepSub}>Elegí cómo querés pagar. Tu dinero queda protegido hasta que confirmes la entrega.</div>

      <PagoOpt sel={pago === 'tarjeta'} onClick={() => setPago('tarjeta')} title="Tarjeta de crédito / débito" sub="Visa, Mastercard, y otras">
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
      </PagoOpt>
      <PagoOpt sel={pago === 'mp'} onClick={() => setPago('mp')} title="Mercado Pago" sub="Saldo, tarjeta guardada o QR">
        <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" />
        <path d="M8 12h8M12 8v8" />
      </PagoOpt>
      <PagoOpt sel={pago === 'efectivo'} onClick={() => setPago('efectivo')} title="Depósito en red de cobranza" sub="Abitab o RedPagos, en efectivo">
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.5" />
      </PagoOpt>
      <div className={`${styles.optCard} ${pago === 'efectivo_entrega' ? styles.sel : ''} ${!codLimitOk ? styles.disabled : ''}`} onClick={() => codLimitOk && setPago('efectivo_entrega')}>
        <div className={styles.optIcon}>
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
          </svg>
        </div>
        <div className={styles.optText}>
          <div className={styles.optTitle}>Efectivo al recibir</div>
          <div className={`${styles.optCap} ${!codLimitOk ? styles.blocked : ''}`}>
            {codLimitOk
              ? `Disponible en compras de hasta ${formatPrice(CASH_ON_DELIVERY_LIMIT, currency)}`
              : `No disponible: el total (${formatPrice(total, currency)}) supera el máximo de ${formatPrice(CASH_ON_DELIVERY_LIMIT, currency)}`}
          </div>
        </div>
        <div className={styles.radioDot} />
      </div>

      {pago === 'tarjeta' && (
        <div className={styles.conditionalBlock}>
          <div className={styles.cardVisual}>
            <div className={styles.num}>{card.num ? card.num.padEnd(19, '•') : '•••• •••• •••• ••••'}</div>
            <div className={styles.row}>
              <span>{card.name ? card.name.toUpperCase() : 'NOMBRE APELLIDO'}</span>
              <span>{card.exp || 'MM/AA'}</span>
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>Número de tarjeta</div>
            <input type="text" value={card.num} onChange={(e) => setCard((c) => ({ ...c, num: e.target.value }))} placeholder="1234 5678 9012 3456" />
          </div>
          <div className={styles.twoCol}>
            <div className={styles.field}>
              <div className={styles.fieldLabel}>Vencimiento</div>
              <input type="text" value={card.exp} onChange={(e) => setCard((c) => ({ ...c, exp: e.target.value }))} placeholder="MM/AA" />
            </div>
            <div className={styles.field}>
              <div className={styles.fieldLabel}>CVV</div>
              <input type="text" value={card.cvv} onChange={(e) => setCard((c) => ({ ...c, cvv: e.target.value }))} placeholder="123" />
            </div>
          </div>
          <div className={styles.field}>
            <div className={styles.fieldLabel}>Nombre del titular</div>
            <input type="text" value={card.name} onChange={(e) => setCard((c) => ({ ...c, name: e.target.value }))} placeholder="Como figura en la tarjeta" />
          </div>
        </div>
      )}

      {pago === 'mp' && (
        <div className={styles.escrowBox} style={{ marginTop: 6 }}>
          💳 Al confirmar, te vamos a redirigir a Mercado Pago para completar el pago de forma segura con tu cuenta.
        </div>
      )}

      {pago === 'efectivo' && (
        <div className={styles.conditionalBlock}>
          <div className={styles.cobranzaPillRow}>
            {['Abitab', 'RedPagos'].map((r) => (
              <div key={r} className={`${styles.cobranzaPill} ${red === r ? styles.sel : ''}`} onClick={() => setRed(r)}>
                {r}
              </div>
            ))}
          </div>
          {red && (
            <div className={styles.codeBox}>
              <div className={styles.code}>{code}</div>
              <p>
                Mostrá este código en cualquier sucursal de {red} y pagá en efectivo. Tenés 48hs antes de que se
                libere el cupo.
              </p>
            </div>
          )}
        </div>
      )}

      {pago === 'efectivo_entrega' && (
        <div className={styles.escrowBox} style={{ marginTop: 6 }}>
          💵 Pagás en efectivo directamente al recibir o retirar el producto — no necesitás cargar ningún dato
          ahora.
        </div>
      )}
    </div>
  );
}

function PagoOpt({ sel, onClick, title, sub, children }) {
  return (
    <div className={`${styles.optCard} ${sel ? styles.sel : ''}`} onClick={onClick}>
      <div className={styles.optIcon}>
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          {children}
        </svg>
      </div>
      <div className={styles.optText}>
        <div className={styles.optTitle}>{title}</div>
        <div className={styles.optSub}>{sub}</div>
      </div>
      <div className={styles.radioDot} />
    </div>
  );
}

function StepConfirmar({ product, entrega, pago, red, total }) {
  const shipping = entrega === 'retiro' ? 0 : SHIPPING_COST;
  const entregaText = entrega === 'retiro' ? 'Retiro en persona · coordinás con el vendedor' : 'Envío a domicilio · 2-4 días hábiles';
  let pagoText = 'Tarjeta';
  if (pago === 'mp') pagoText = 'Mercado Pago';
  if (pago === 'efectivo') pagoText = `Depósito en ${red}`;
  if (pago === 'efectivo_entrega') pagoText = 'Efectivo al recibir';

  return (
    <div>
      <div className={styles.stepTitle}>Confirmá tu compra</div>
      <div className={styles.stepSub}>Revisá los detalles antes de pagar.</div>

      <div className={styles.detailBox}>
        <b>Entrega</b>
        <span>{entregaText}</span>
      </div>
      <div className={styles.detailBox}>
        <b>Método de pago</b>
        <span>{pagoText}</span>
      </div>

      <div className={styles.summaryBox}>
        <div className={styles.summaryRow}>
          <span>Producto</span>
          <span className={styles.amt}>{formatPrice(product.price, product.currency)}</span>
        </div>
        <div className={styles.summaryRow}>
          <span>Envío</span>
          <span className={styles.amt}>{shipping === 0 ? 'Gratis' : formatPrice(shipping, product.currency)}</span>
        </div>
        <div className={`${styles.summaryRow} ${styles.total}`}>
          <span>Total</span>
          <span className={styles.amt}>{formatPrice(total, product.currency)}</span>
        </div>
      </div>

      <div className={styles.escrowBox}>
        🛡️ Tu pago queda <b>retenido por Trueke</b> hasta que confirmes que recibiste el producto en las condiciones
        publicadas. Recién ahí se libera el dinero al vendedor.
      </div>
    </div>
  );
}

function StepResultado({ processing, orderId, orderStatus, pago, red, code }) {
  const navigate = useNavigate();

  if (processing) {
    return (
      <div className={styles.centerWrap}>
        <div className="big-spinner" />
        <div className={styles.procTitle}>Procesando tu pedido…</div>
        <div className={styles.procSub}>Esto puede tardar unos segundos.</div>
      </div>
    );
  }

  let title = '¡Pago realizado!';
  let sub = 'Le avisamos al vendedor que tenés que coordinar la entrega. Tu dinero queda protegido hasta que confirmes que todo llegó bien.';
  if (orderStatus === 'awaiting_cash_payment') {
    title = 'Pedido reservado';
    sub = `Te queda pendiente pagar el código ${code} en ${red}. Tenés 48hs — apenas se acredite, avisamos al vendedor.`;
  } else if (orderStatus === 'pending_cod') {
    title = 'Pedido confirmado';
    sub = 'Vas a pagar en efectivo directamente al recibir o retirar el producto.';
  }

  return (
    <div className={styles.centerWrap}>
      <div className={styles.successCheck}>
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>
      <div className={styles.successTitle}>{title}</div>
      <div className={styles.successSub}>{sub}</div>
      <div className={styles.orderId}>Pedido #{orderId?.slice(0, 8).toUpperCase()}</div>
      <button className={styles.btnFull} onClick={() => navigate('/')}>
        Volver al inicio
      </button>
    </div>
  );
}
