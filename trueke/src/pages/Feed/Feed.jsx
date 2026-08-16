import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav.jsx';
import StarPicker from '../../components/StarPicker.jsx';
import { subscribeToActiveProducts } from '../../services/productsService';
import { formatPrice } from '../../utils/format';
import { shortConditionLabel } from '../../utils/condition';
import { CATEGORIES } from '../../utils/constants';
import styles from './Feed.module.css';

const QUICK_CHIPS = [
  { key: 'nuevo', label: 'Nuevo' },
  { key: 'envio', label: 'Con envío' },
  { key: 'verificado', label: 'Vendedor verificado' },
];

const emptyFilters = {
  maxPrice: 2000,
  categoria: null,
  conditionType: null,
  minStars: null,
  material: '',
  color: '',
  marca: '',
};

export default function Feed() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeChips, setActiveChips] = useState(new Set());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [draftFilters, setDraftFilters] = useState(emptyFilters);

  useEffect(() => {
    const unsub = subscribeToActiveProducts((list) => {
      setProducts(list);
      setLoading(false);
    });
    return unsub;
  }, []);

  function toggleChip(key) {
    setActiveChips((prev) => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  }

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (search.trim() && !p.title?.toLowerCase().includes(search.trim().toLowerCase())) return false;
      if (activeChips.has('nuevo') && p.conditionType !== 'Nuevo') return false;
      if (activeChips.has('envio') && !p.offersShipping) return false;
      if (activeChips.has('verificado') && !p.sellerVerified) return false;
      if (p.price > filters.maxPrice) return false;
      if (filters.categoria && !p.categories?.includes(filters.categoria)) return false;
      if (filters.conditionType && p.conditionType !== filters.conditionType) return false;
      if (filters.minStars && (p.conditionStars || 0) < filters.minStars) return false;
      if (filters.material.trim() && !p.material?.toLowerCase().includes(filters.material.trim().toLowerCase())) return false;
      if (filters.color.trim() && !p.color?.toLowerCase().includes(filters.color.trim().toLowerCase())) return false;
      if (filters.marca.trim() && !p.brand?.toLowerCase().includes(filters.marca.trim().toLowerCase())) return false;
      return true;
    });
  }, [products, search, activeChips, filters]);

  const activeFilterCount =
    (filters.categoria ? 1 : 0) +
    (filters.conditionType ? 1 : 0) +
    (filters.minStars ? 1 : 0) +
    (filters.material.trim() ? 1 : 0) +
    (filters.color.trim() ? 1 : 0) +
    (filters.marca.trim() ? 1 : 0) +
    (filters.maxPrice < 2000 ? 1 : 0);

  function openDrawer() {
    setDraftFilters(filters);
    setDrawerOpen(true);
  }
  function applyFilters() {
    setFilters(draftFilters);
    setDrawerOpen(false);
  }
  function clearDraft() {
    setDraftFilters(emptyFilters);
  }

  return (
    <>
      <div className={styles.topbar}>
        <div className={styles.brandRow}>
          <div className={styles.brand}>
            true<em>ke</em>
          </div>
          <div className={styles.loc}>📍 Uruguay</div>
        </div>
        <div className={styles.searchRow}>
          <div className={styles.searchBox}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4">
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.6" y2="16.6" />
            </svg>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar bicicleta, mueble, ropa..."
              style={{ border: 'none', outline: 'none', background: 'none', width: '100%', font: 'inherit', color: 'inherit' }}
            />
          </div>
          <button className={styles.filterBtn} onClick={openDrawer}>
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#123430" strokeWidth="2.3">
              <line x1="4" y1="6" x2="20" y2="6" />
              <circle cx="9" cy="6" r="2" fill="#123430" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <circle cx="16" cy="12" r="2" fill="#123430" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="11" cy="18" r="2" fill="#123430" />
            </svg>
            {activeFilterCount > 0 && <span className={styles.dot}>{activeFilterCount}</span>}
          </button>
        </div>
      </div>

      <div className={styles.chipRow}>
        {QUICK_CHIPS.map((chip) => (
          <div
            key={chip.key}
            className={`${styles.chip} ${activeChips.has(chip.key) ? styles.active : ''}`}
            onClick={() => toggleChip(chip.key)}
          >
            {chip.label}
          </div>
        ))}
      </div>

      <div className={styles.feedWrap}>
        <div className={styles.feedMeta}>
          <span>
            <b>{filtered.length}</b> resultados
          </span>
          <span>Más recientes</span>
        </div>

        {loading ? (
          <div className={styles.empty}>Cargando publicaciones…</div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>No encontramos productos con esos filtros.</div>
        ) : (
          <div className={styles.grid}>
            {filtered.map((p) => (
              <div key={p.id} className={styles.card} onClick={() => navigate(`/producto/${p.id}`)}>
                <div className={styles.cardImg}>
                  <img src={p.photos?.[0]} alt={p.title} loading="lazy" />
                  <div className={styles.badgeCond}>{shortConditionLabel(p)}</div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.cardTitle}>{p.title}</div>
                  <div>
                    <span className={styles.priceTag}>{formatPrice(p.price, p.currency)}</span>
                    {p.oldPrice && <span className={styles.priceOld}>{formatPrice(p.oldPrice, p.currency)}</span>}
                  </div>
                  <div className={styles.dist}>📍 {p.city || 'Uruguay'}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BottomNav />

      <div className={`${styles.overlay} ${drawerOpen ? styles.open : ''}`} onClick={() => setDrawerOpen(false)} />
      <div className={`${styles.drawer} ${drawerOpen ? styles.open : ''}`}>
        <div className={styles.drawerHandle} />
        <div className={styles.drawerHead}>
          <h3>Filtrar</h3>
          <button className={styles.drawerClear} onClick={clearDraft}>
            Limpiar todo
          </button>
        </div>
        <div className={styles.drawerBody}>
          <div className={styles.fsection}>
            <h4>Precio máximo</h4>
            <div className={styles.frange}>
              <span>$0</span>
              <input
                type="range"
                min="0"
                max="2000"
                value={draftFilters.maxPrice}
                onChange={(e) => setDraftFilters((f) => ({ ...f, maxPrice: Number(e.target.value) }))}
              />
              <span>${draftFilters.maxPrice}</span>
            </div>
          </div>

          <div className={styles.fsection}>
            <h4>Categoría</h4>
            <div className="pill-grid">
              {CATEGORIES.map((c) => (
                <div
                  key={c}
                  className={`pill ${draftFilters.categoria === c ? 'sel' : ''}`}
                  onClick={() =>
                    setDraftFilters((f) => ({ ...f, categoria: f.categoria === c ? null : c }))
                  }
                >
                  {c}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.fsection}>
            <h4>Estado</h4>
            <div className="pill-grid">
              {['Nuevo', 'Usado'].map((c) => (
                <div
                  key={c}
                  className={`pill ${draftFilters.conditionType === c ? 'sel' : ''}`}
                  onClick={() =>
                    setDraftFilters((f) => ({ ...f, conditionType: f.conditionType === c ? null : c }))
                  }
                >
                  {c}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.fsection}>
            <h4>Estrellas mínimas</h4>
            <StarPicker
              value={draftFilters.minStars}
              onChange={(v) => setDraftFilters((f) => ({ ...f, minStars: v }))}
            />
          </div>

          <div className={styles.fsection}>
            <h4>Color</h4>
            <input
              type="text"
              value={draftFilters.color}
              onChange={(e) => setDraftFilters((f) => ({ ...f, color: e.target.value }))}
              placeholder="Ej: Negro, verde oliva..."
              style={{
                width: '100%',
                border: '1.5px solid var(--line)',
                borderRadius: 11,
                padding: '11px 13px',
                fontSize: 13,
                outline: 'none',
                background: 'var(--paper)',
              }}
            />
          </div>

          <div className={styles.fsection}>
            <h4>Material</h4>
            <input
              type="text"
              value={draftFilters.material}
              onChange={(e) => setDraftFilters((f) => ({ ...f, material: e.target.value }))}
              placeholder="Ej: Madera, aluminio..."
              style={{
                width: '100%',
                border: '1.5px solid var(--line)',
                borderRadius: 11,
                padding: '11px 13px',
                fontSize: 13,
                outline: 'none',
                background: 'var(--paper)',
              }}
            />
          </div>

          <div className={styles.fsection}>
            <h4>Marca</h4>
            <input
              type="text"
              value={draftFilters.marca}
              onChange={(e) => setDraftFilters((f) => ({ ...f, marca: e.target.value }))}
              placeholder="Ej: Trek"
              style={{
                width: '100%',
                border: '1.5px solid var(--line)',
                borderRadius: 11,
                padding: '11px 13px',
                fontSize: 13,
                outline: 'none',
                background: 'var(--paper)',
              }}
            />
          </div>
        </div>
        <div className={styles.drawerFoot}>
          <button className="btn-ghost" onClick={() => setDrawerOpen(false)}>
            Cancelar
          </button>
          <button className="btn-solid active" onClick={applyFilters}>
            Ver resultados
          </button>
        </div>
      </div>
    </>
  );
}
