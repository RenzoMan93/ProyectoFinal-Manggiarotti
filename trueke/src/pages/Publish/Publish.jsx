import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { createProduct } from '../../services/productsService';
import { checkImageQuality, uploadImage } from '../../services/storageService';
import { CATEGORIES, COLORS, CONDITIONS, MATERIALS } from '../../utils/constants';
import styles from './Publish.module.css';

const REQUIRED_PHOTOS = 3;

export default function Publish() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [photos, setPhotos] = useState([]); // {id, status, url, reason}
  const [description, setDescription] = useState('');
  const [titulo, setTitulo] = useState('');
  const [categoria, setCategoria] = useState(null);
  const [marca, setMarca] = useState('');
  const [estado, setEstado] = useState(null);
  const [detalleEstado, setDetalleEstado] = useState('');
  const [material, setMaterial] = useState(null);
  const [color, setColor] = useState(null);
  const [precio, setPrecio] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [offersShipping, setOffersShipping] = useState(false);
  const [publishing, setPublishing] = useState(false);

  async function onFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const id = `${Date.now()}-${Math.random()}`;
    setPhotos((prev) => [...prev, { id, status: 'analyzing' }]);

    const quality = await checkImageQuality(file);
    if (!quality.ok) {
      setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'rejected', reason: quality.reason } : p)));
      return;
    }

    try {
      const url = await uploadImage(`products/${user.uid}`, file);
      setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'approved', url } : p)));
    } catch (err) {
      console.error('Error subiendo a Cloudinary:', err);
      setPhotos((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'rejected', reason: err.message || 'No se pudo subir la foto, probá de nuevo.' } : p))
      );
    }
  }

  function removePhoto(id) {
    setPhotos((prev) => prev.filter((p) => p.id !== id));
  }

  const approvedPhotos = photos.filter((p) => p.status === 'approved');

  const checks = {
    fotos: approvedPhotos.length >= REQUIRED_PHOTOS,
    descripcion: description.trim().length > 0,
    titulo: titulo.trim().length > 0,
    categoria: !!categoria,
    marca: marca.trim().length > 0,
    estado: !!estado,
    detalleEstado: estado !== 'Con detalles' || detalleEstado.trim().length > 0,
    material: !!material,
    color: !!color,
    precio: String(precio).trim().length > 0 && Number(precio) > 0,
    ubicacion: ubicacion.trim().length > 0,
  };
  const keys = Object.keys(checks);
  const doneCount = keys.filter((k) => checks[k]).length;

  const missingLabels = {
    fotos: `fotos (${approvedPhotos.length}/${REQUIRED_PHOTOS} aprobadas)`,
    descripcion: 'descripción',
    titulo: 'título',
    categoria: 'categoría',
    marca: 'marca',
    estado: 'estado',
    detalleEstado: 'detalle del estado ("con detalles")',
    material: 'material',
    color: 'color',
    precio: 'precio',
    ubicacion: 'ubicación',
  };
  const missing = keys.filter((k) => !checks[k]).map((k) => missingLabels[k]);
  const canPublish = missing.length === 0 && !publishing;

  async function handlePublish() {
    if (!canPublish) return;
    setPublishing(true);
    try {
      const sellerName = profile?.name || user.email.split('@')[0];
      const id = await createProduct(user.uid, sellerName, {
        photos: approvedPhotos.map((p) => p.url),
        description: description.trim(),
        title: titulo.trim(),
        category: categoria,
        brand: marca.trim(),
        condition: estado,
        conditionDetails: estado === 'Con detalles' ? detalleEstado.trim() : null,
        material,
        color,
        price: Number(precio),
        city: ubicacion.trim(),
        offersShipping,
        sellerVerified: profile?.verificationStatus === 'verified',
      });
      navigate(`/producto/${id}`);
    } finally {
      setPublishing(false);
    }
  }

  return (
    <>
      <div className={styles.topbar}>
        <button className="icon-btn" onClick={() => navigate(-1)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className={styles.topbarTitle}>Publicar producto</div>
      </div>
      <div className={styles.progressWrap}>
        <div className={styles.progressLabel}>
          <span>Datos completos</span>
          <span>
            {doneCount}/{keys.length}
          </span>
        </div>
        <div className={styles.progressBar}>
          <div className={styles.progressFill} style={{ width: `${(doneCount / keys.length) * 100}%` }} />
        </div>
      </div>

      <div className={styles.bodyScroll}>
        <div className={styles.cardBlock}>
          <div className={styles.sectionLabel}>
            Fotos del producto <span className={styles.reqStar}>*</span> — mínimo {REQUIRED_PHOTOS} aprobadas
          </div>
          <div className={styles.photoGrid}>
            {photos.map((p) => (
              <PhotoSlot key={p.id} photo={p} onRemove={() => removePhoto(p.id)} />
            ))}
            {photos.length < 6 && (
              <button className={`${styles.photoSlot} ${styles.addPhoto}`} onClick={() => fileInputRef.current?.click()}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1B4B43" strokeWidth="2.3">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Agregar foto
              </button>
            )}
            <input ref={fileInputRef} type="file" accept="image/*" hidden onChange={onFileSelected} />
          </div>
          <div className={styles.photoHint}>
            <b>Cómo funciona:</b> cada foto pasa por una revisión automática de calidad (resolución y nitidez) antes
            de subirse. Si sale borrosa o pesa demasiado, te pedimos que la reemplaces.
          </div>
        </div>

        <div className={styles.cardBlock}>
          <div className={styles.sectionLabel}>
            Descripción <span className={styles.reqStar}>*</span>
          </div>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contale a los compradores por qué lo vendés, en qué estado está, qué incluye..."
          />
          <div className={styles.aiHint}>
            🤖 No te preocupes por el orden: en cuanto publiques, una IA toma este texto y arma automáticamente el
            resumen estandarizado que ven los compradores (estado, qué incluye, motivo de venta, etc.).
          </div>
        </div>

        <div className={styles.cardBlock}>
          <div className={styles.sectionLabel}>Datos del producto</div>

          <Field label="Título" done={checks.titulo}>
            <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ej: Bicicleta Trek montaña rodado 29" />
          </Field>

          <Field label="Categoría" done={checks.categoria}>
            <div className="pill-grid">
              {CATEGORIES.map((c) => (
                <div key={c} className={`pill ${categoria === c ? 'sel' : ''}`} onClick={() => setCategoria(c)}>
                  {c}
                </div>
              ))}
            </div>
          </Field>

          <Field label="Marca" done={checks.marca}>
            <input type="text" value={marca} onChange={(e) => setMarca(e.target.value)} placeholder="Ej: Trek" />
          </Field>

          <Field label="Estado" done={checks.estado}>
            <div className="pill-grid">
              {CONDITIONS.map((c) => (
                <div key={c} className={`pill ${estado === c ? 'sel' : ''}`} onClick={() => setEstado(c)}>
                  {c}
                </div>
              ))}
            </div>
          </Field>

          {estado === 'Con detalles' && (
            <Field label="¿Qué detalles tiene?" done={checks.detalleEstado}>
              <input
                type="text"
                value={detalleEstado}
                onChange={(e) => setDetalleEstado(e.target.value)}
                placeholder="Ej: rayón en la base, le falta un tornillo, mancha en la manga..."
              />
            </Field>
          )}

          <Field label="Material" done={checks.material}>
            <div className="pill-grid">
              {MATERIALS.map((m) => (
                <div key={m} className={`pill ${material === m ? 'sel' : ''}`} onClick={() => setMaterial(m)}>
                  {m}
                </div>
              ))}
            </div>
          </Field>

          <Field label="Color" done={checks.color}>
            <div className="swatches">
              {COLORS.map((c) => (
                <div
                  key={c.value}
                  className={`swatch ${color === c.value ? 'sel' : ''}`}
                  style={{ background: c.value, borderColor: c.value === '#f4f0e4' ? 'var(--line)' : 'transparent' }}
                  onClick={() => setColor(c.value)}
                  title={c.label}
                />
              ))}
            </div>
          </Field>

          <Field label="Precio (USD)" done={checks.precio}>
            <div className={styles.priceInput}>
              <span>$</span>
              <input type="number" min="0" value={precio} onChange={(e) => setPrecio(e.target.value)} placeholder="0" />
            </div>
          </Field>

          <Field label="Ciudad" done={checks.ubicacion}>
            <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ej: Punta del Este" />
          </Field>

          <Field label="Entrega (opcional)" done>
            <div className="pill-grid">
              <div className={`pill ${offersShipping ? 'sel' : ''}`} onClick={() => setOffersShipping((v) => !v)}>
                Ofrezco envío a domicilio
              </div>
            </div>
          </Field>
        </div>
      </div>

      <div className={styles.publishbar}>
        <div className={`${styles.missingNote} ${missing.length === 0 ? styles.ok : ''}`}>
          {missing.length === 0 ? 'Todo listo para publicar ✓' : `Falta completar: ${missing.join(', ')}`}
        </div>
        <button className={`${styles.btnPublish} ${canPublish ? styles.active : ''}`} onClick={handlePublish}>
          {publishing ? 'Publicando…' : 'Publicar producto'}
        </button>
      </div>
    </>
  );
}

function Field({ label, done, children }) {
  return (
    <div className={styles.field}>
      <div className={`${styles.fieldLabel} ${done ? styles.done : ''}`}>
        <span className={styles.check}>
          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </span>
        {label}
      </div>
      {children}
    </div>
  );
}

function PhotoSlot({ photo, onRemove }) {
  if (photo.status === 'analyzing') {
    return (
      <div className={`${styles.photoSlot} ${styles.filled}`}>
        <div className={`${styles.photoStatus} ${styles.analyzing}`}>
          <div className="spinner" />
          <span>Analizando…</span>
        </div>
      </div>
    );
  }
  if (photo.status === 'approved') {
    return (
      <div className={`${styles.photoSlot} ${styles.filled}`}>
        <img src={photo.url} alt="" />
        <div className={styles.badgeOk}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <button className={styles.photoRemoveX} onClick={onRemove}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    );
  }
  return (
    <div className={`${styles.photoSlot} ${styles.filled}`}>
      <div className={styles.photoReject}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5">
          <circle cx="12" cy="12" r="9" />
          <line x1="15" y1="9" x2="9" y2="15" />
          <line x1="9" y1="9" x2="15" y2="15" />
        </svg>
        <p>{photo.reason}</p>
        <button className={styles.photoRemove} onClick={onRemove}>
          Quitar
        </button>
      </div>
    </div>
  );
}
