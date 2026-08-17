import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { createProduct, setProductLocation, setVehicleDeclaration } from '../../services/productsService';
import { checkImageQuality, uploadImage } from '../../services/storageService';
import { CATEGORIES, CITIES, CURRENCIES, MONTEVIDEO_NEIGHBORHOODS } from '../../utils/constants';
import { normalizeShoutingCase, formatPrice } from '../../utils/format';
import { conditionTitle } from '../../utils/condition';
import { findProhibitedMatch } from '../../utils/prohibitedItems';
import StarPicker from '../../components/StarPicker.jsx';
import LocationPicker from '../../components/LocationPicker.jsx';
import styles from './Publish.module.css';

const REQUIRED_PHOTOS = 3;

const DELIVERY_OPTIONS = [
  { value: 'domicilio', label: 'Entrega en domicilio' },
  { value: 'envio', label: 'Envío' },
  { value: 'ambos', label: 'Ambos' },
];

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
  const [ubicacion, setUbicacion] = useState(CITIES[0]);
  const [barrio, setBarrio] = useState('');
  const [direccion, setDireccion] = useState('');
  const [lat, setLat] = useState(null);
  const [lng, setLng] = useState(null);
  const [deliveryOption, setDeliveryOption] = useState(null); // 'domicilio' | 'envio' | 'ambos'
  const [matricula, setMatricula] = useState('');
  const [declaracionAceptada, setDeclaracionAceptada] = useState(false);
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

  const prohibitedMatch = findProhibitedMatch(`${titulo} ${description}`);
  const esVehiculo = categorias.includes('Vehículos y accesorios');

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
    entrega: !!deliveryOption,
    declaracion: !esVehiculo || (matricula.trim().length > 0 && declaracionAceptada),
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
    entrega: 'tipo de entrega',
    declaracion: 'declaración jurada del vehículo',
  };
  const missing = keys.filter((k) => !checks[k]).map((k) => missingLabels[k]);
  const canPublish = missing.length === 0 && !prohibitedMatch && !publishing;

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
        city: ubicacion,
        neighborhood: barrio || null,
        deliveryOption,
        sellerVerified: profile?.verificationStatus === 'verified',
      });
      if (direccion.trim() || (lat && lng)) {
        await setProductLocation(id, { address: direccion.trim() || null, lat, lng });
      }
      if (esVehiculo) {
        await setVehicleDeclaration(id, { plate: matricula.trim().toUpperCase(), accepted: true });
      }
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

        <div className={styles.policyNotice}>
          <b>No se pueden publicar:</b> alimentos o bebidas, medicamentos y productos de farmacia, suplementos y
          superalimentos, cremas/cosméticos/skin care (maquillaje, esmalte de uñas, bronceadores, etc.), artículos de
          laboratorio con vencimiento o que requieran habilitación del MSP u otros organismos, ni productos
          inflamables, químicos, alcoholes o perfumes.{' '}
          <b>Trueke es solo para venta:</b> no se permite publicar alquileres de inmuebles, autos, ni ningún producto
          o servicio ofrecido en alquiler o prestación. El título y la descripción se revisan automáticamente antes
          de publicar.
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
            <select
              className={styles.selectInput}
              value={ubicacion}
              onChange={(e) => {
                setUbicacion(e.target.value);
                setBarrio('');
              }}
            >
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          {ubicacion === 'Montevideo' && (
            <Field label="Barrio">
              <select className={styles.selectInput} value={barrio} onChange={(e) => setBarrio(e.target.value)}>
                <option value="">Seleccioná tu barrio (opcional)</option>
                {MONTEVIDEO_NEIGHBORHOODS.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </Field>
          )}

          <Field label="Dirección">
            <input
              type="text"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Ej: Calle 25 esq. Gorlero"
            />
            <div className={styles.addressHint}>
              📍 Marcá el punto exacto en el mapa (opcional). Por seguridad, ni la dirección ni el mapa se muestran a
              los compradores — solo vos los ves; se usan para coordinar la entrega en privado.
            </div>
            <LocationPicker lat={lat} lng={lng} onChange={(newLat, newLng) => { setLat(newLat); setLng(newLng); }} />
          </Field>

          {esVehiculo && (
            <Field label="Declaración jurada del vehículo" required>
              <input
                type="text"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                placeholder="Matrícula / padrón del vehículo"
              />
              <div className={styles.declarationRow} onClick={() => setDeclaracionAceptada((v) => !v)}>
                <span className={`${styles.discountCheckbox} ${declaracionAceptada ? styles.active : ''}`}>
                  {declaracionAceptada && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </span>
                <span>
                  Declaro bajo juramento que soy el propietario legal de este vehículo (o cuento con autorización
                  expresa del propietario para venderlo), que no fue robado, y que no tiene impedimentos legales
                  para su venta (embargos, prendas sin cancelar, etc.). Toda la información publicada es veraz y
                  entiendo que esta declaración puede usarse como prueba en caso de fraude o reventa de un vehículo
                  no legal.
                </span>
              </div>
            </Field>
          )}

          <Field label="Tipo de entrega" required>
            <div className="pill-grid">
              {DELIVERY_OPTIONS.map((o) => (
                <div
                  key={o.value}
                  className={`pill ${deliveryOption === o.value ? 'sel' : ''}`}
                  onClick={() => setDeliveryOption(o.value)}
                >
                  {o.label}
                </div>
              ))}
            </div>
          </Field>
        </div>
      </div>

      <div className={styles.publishbar}>
        <div className={`${styles.missingNote} ${missing.length === 0 && !prohibitedMatch ? styles.ok : ''}`}>
          {prohibitedMatch
            ? `No se puede publicar: el título o la descripción menciona ${prohibitedMatch.label} ("${prohibitedMatch.keyword}"). Quitalo del texto para poder publicar.`
            : missing.length === 0
            ? 'Todo listo para publicar ✓'
            : `Falta completar: ${missing.join(', ')}`}
        </div>
        <button className={`${styles.btnPublish} ${canPublish ? styles.active : ''}`} onClick={handlePublish}>
          {publishing ? 'Publicando…' : 'Publicar producto'}
        </button>
      </div>
    </>
  );
}

/** A single search box (no separate trigger) — the dropdown opens as soon
 * as the seller focuses/types in it, showing CATEGORIES (already
 * alphabetical) filtered live. Selecting is always done by tapping an
 * option in the list, never free text; what's already selected shows as
 * removable chips under the box. */
function CategoryDropdown({ selected, onToggle }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const wrapRef = useRef(null);

  useEffect(() => {
    function onDocClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, []);

  const filtered = CATEGORIES.filter((c) => c.toLowerCase().includes(query.trim().toLowerCase()));

  return (
    <div className={styles.categoryDropdown} ref={wrapRef}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        placeholder="Buscar categoría..."
      />
      {selected.length > 0 && (
        <div className={styles.categoryChips}>
          {selected.map((c) => (
            <div key={c} className={styles.categoryChip}>
              {c}
              <button type="button" onClick={() => onToggle(c)} aria-label={`Quitar ${c}`}>
                <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
      {open && (
        <div className={styles.categoryPanel}>
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
      )}
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
