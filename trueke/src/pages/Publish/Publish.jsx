import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { createProduct } from '../../services/productsService';
import { checkImageQuality, uploadImage } from '../../services/storageService';
import { CATEGORIES, CURRENCIES } from '../../utils/constants';
import { normalizeShoutingCase, formatPrice } from '../../utils/format';
import { conditionTitle } from '../../utils/condition';
import StarPicker from '../../components/StarPicker.jsx';
import styles from './Publish.module.css';

const REQUIRED_PHOTOS = 3;

export default function Publish() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [photos, setPhotos] = useState([]); // {id, status, url, reason}
  const [titulo, setTitulo] = useState('');
  const [categorias, setCategorias] = useState([]);
  const [description, setDescription] = useState('');
  const [conditionStars, setConditionStars] = useState(null); // 1-5
  const [moneda, setMoneda] = useState('USD');
  const [precio, setPrecio] = useState('');
  const [descuentoActivo, setDescuentoActivo] = useState(false);
  const [descuentoPorcentaje, setDescuentoPorcentaje] = useState('');
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

  function toggleCategoria(c) {
    setCategorias((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  const approvedPhotos = photos.filter((p) => p.status === 'approved');

  const descuentoValido = descuentoActivo && Number(descuentoPorcentaje) > 0 && Number(descuentoPorcentaje) < 100;
  // El vendedor carga el precio ya con el descuento aplicado + el % que rebajó;
  // el precio anterior (tachado en la ficha) se reconstruye a partir de esos dos.
  const precioAnteriorCalculado = descuentoValido
    ? Math.round(Number(precio || 0) / (1 - Number(descuentoPorcentaje) / 100))
    : null;

  const checks = {
    fotos: approvedPhotos.length >= REQUIRED_PHOTOS,
    titulo: titulo.trim().length > 0,
    categoria: categorias.length > 0,
    descripcion: description.trim().length > 0,
    condicion: !!conditionStars,
    precio: String(precio).trim().length > 0 && Number(precio) > 0,
    ubicacion: ubicacion.trim().length > 0,
  };
  const keys = Object.keys(checks);
  const doneCount = keys.filter((k) => checks[k]).length;

  const missingLabels = {
    fotos: `fotos (${approvedPhotos.length}/${REQUIRED_PHOTOS} aprobadas)`,
    titulo: 'título',
    categoria: 'categoría (al menos una)',
    descripcion: 'descripción',
    condicion: 'estado',
    precio: 'precio',
    ubicacion: 'ciudad',
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
        title: normalizeShoutingCase(titulo),
        categories: categorias,
        description: description.trim(),
        conditionStars,
        price: Number(precio),
        oldPrice: precioAnteriorCalculado,
        currency: moneda,
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
            de subirse. Si sale borrosa o pesa demasiado, te pedimos que la reemplaces. Al publicar, una IA analiza
            todas las fotos aprobadas y elige automáticamente la mejor como foto de portada.
          </div>
        </div>

        <div className={styles.cardBlock}>
          <div className={styles.sectionLabel}>Datos del producto</div>

          <Field label="Título" required>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              onBlur={() => setTitulo((t) => normalizeShoutingCase(t))}
              placeholder="Ej: Bicicleta Trek montaña rodado 29"
            />
          </Field>

          <Field label="Categoría" required>
            <CategoryDropdown selected={categorias} onToggle={toggleCategoria} />
          </Field>

          <Field label="Estado" required>
            <StarPicker value={conditionStars} onChange={setConditionStars} />
            <div className={`${styles.conditionLabel} ${!conditionStars ? styles.conditionPlaceholder : ''}`}>
              {conditionStars ? conditionTitle(conditionStars) : 'Tocá las estrellas para indicar el estado del producto'}
            </div>
          </Field>

          <Field label="Precio" required>
            <div className={styles.currencyLabel}>Seleccioná moneda</div>
            <div className={styles.currencyOptions}>
              {CURRENCIES.map((c) => (
                <div
                  key={c.code}
                  className={`${styles.currencyOption} ${moneda === c.code ? styles.currencyOptionSel : ''}`}
                  onClick={() => setMoneda(c.code)}
                >
                  <span className={styles.currencyCheck}>
                    {moneda === c.code && (
                      <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </span>
                  {c.label}
                </div>
              ))}
            </div>
            <div className={styles.priceInput}>
              <span>{CURRENCIES.find((c) => c.code === moneda)?.symbol}</span>
              <input
                type="number"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0"
                style={{ paddingLeft: `${19 + (CURRENCIES.find((c) => c.code === moneda)?.symbol.length || 1) * 9}px` }}
              />
            </div>

            <div className={styles.discountToggle} onClick={() => setDescuentoActivo((v) => !v)}>
              <span className={`${styles.discountCheckbox} ${descuentoActivo ? styles.active : ''}`}>
                {descuentoActivo && (
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              ¿Deseás aplicar un descuento?
            </div>

            {descuentoActivo && (
              <>
                <div className={styles.oldPriceLabel}>Porcentaje de descuento sobre el precio anterior</div>
                <div className={styles.percentInput}>
                  <input
                    type="number"
                    min="1"
                    max="99"
                    value={descuentoPorcentaje}
                    onChange={(e) => setDescuentoPorcentaje(e.target.value)}
                    placeholder="0"
                  />
                  <span>%</span>
                </div>
                {descuentoValido ? (
                  <div className={styles.oldPriceDiscount}>
                    🏷️ Se va a mostrar el precio anterior tachado ({formatPrice(precioAnteriorCalculado, moneda)}) junto al precio
                    actual con el {descuentoPorcentaje}% de descuento ya aplicado.
                  </div>
                ) : (
                  descuentoPorcentaje.trim().length > 0 && (
                    <div className={styles.oldPriceWarn}>El porcentaje tiene que ser mayor a 0 y menor a 100.</div>
                  )
                )}
              </>
            )}
          </Field>

          <Field label="Descripción" required>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contanos, como si le escribieras a un amigo: ¿qué marca/modelo es?, ¿de qué material y color?, ¿por qué lo vendés?, ¿qué incluye (accesorios, caja, manual)?, ¿cómo funciona y en qué estado está?, ¿hay algo a tener en cuenta (golpes, detalles, piezas faltantes)? No hace falta que quede prolijo ni ordenado."
            />
            <div className={styles.aiHint}>
              🤖 No te preocupes por el orden: en cuanto publiques, una IA toma este texto y separa automáticamente
              marca, material y color, además de armar el resumen que ven los compradores (qué incluye, motivo de
              venta, etc.) — así todas las publicaciones se ven con el mismo formato.
            </div>
          </Field>

          <Field label="Ciudad" required>
            <input type="text" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Ej: Punta del Este" />
          </Field>

          <Field label="Entrega">
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

/** Always-expanded searchable checklist of categories (no trigger button to
 * open/close) — the seller can type to filter, but the only way to select
 * one is tapping it in the list below, never free text. */
function CategoryDropdown({ selected, onToggle }) {
  const [query, setQuery] = useState('');
  const filtered = CATEGORIES.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className={styles.categoryPanel}>
      <input
        type="text"
        className={styles.categorySearch}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar categoría..."
      />
      <div className={styles.categoryList}>
        {filtered.length === 0 ? (
          <div className={styles.categoryEmpty}>No hay categorías que coincidan con "{query}".</div>
        ) : (
          filtered.map((c) => (
            <div
              key={c}
              className={`${styles.categoryOption} ${selected.includes(c) ? styles.categoryOptionSel : ''}`}
              onClick={() => onToggle(c)}
            >
              <span className={styles.categoryCheck}>
                {selected.includes(c) && (
                  <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </span>
              {c}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Field({ label, required, children }) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.reqStar}>*</span>}
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
