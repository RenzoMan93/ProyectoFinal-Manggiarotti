"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONDITIONS, COLOR_SWATCHES, DEPARTAMENTOS, MATERIALS } from "@/lib/constants";
import { formatPrice } from "@/lib/format";

const MAX_PRICE_CAP = 100000;

export default function FilterDrawer({
  q,
  categoria,
  condition,
  material,
  color,
  ubicacion,
  envio,
  verificado,
  maxPrice,
  orden,
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [conditionSel, setConditionSel] = useState(condition);
  const [materialSel, setMaterialSel] = useState(material);
  const [colorSel, setColorSel] = useState(color);
  const [ubicacionSel, setUbicacionSel] = useState(ubicacion);
  const [envioSel, setEnvioSel] = useState(envio);
  const [verificadoSel, setVerificadoSel] = useState(verificado);
  const [maxPriceSel, setMaxPriceSel] = useState(maxPrice ?? MAX_PRICE_CAP);
  const [ordenSel, setOrdenSel] = useState(orden || "recientes");

  const toggle = (arr, setArr, value) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const activeCount =
    condition.length +
    material.length +
    color.length +
    (ubicacion ? 1 : 0) +
    (envio ? 1 : 0) +
    (verificado ? 1 : 0) +
    (maxPrice != null ? 1 : 0);

  const resetLocalState = () => {
    setConditionSel(condition);
    setMaterialSel(material);
    setColorSel(color);
    setUbicacionSel(ubicacion);
    setEnvioSel(envio);
    setVerificadoSel(verificado);
    setMaxPriceSel(maxPrice ?? MAX_PRICE_CAP);
    setOrdenSel(orden || "recientes");
  };

  const openDrawer = () => {
    resetLocalState();
    setOpen(true);
  };

  const clearAll = () => {
    setConditionSel([]);
    setMaterialSel([]);
    setColorSel([]);
    setUbicacionSel("");
    setEnvioSel(false);
    setVerificadoSel(false);
    setMaxPriceSel(MAX_PRICE_CAP);
    setOrdenSel("recientes");
  };

  const apply = () => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoria) params.set("categoria", categoria);
    if (conditionSel.length) params.set("condition", conditionSel.join(","));
    if (materialSel.length) params.set("material", materialSel.join(","));
    if (colorSel.length) params.set("color", colorSel.join(","));
    if (ubicacionSel) params.set("ubicacion", ubicacionSel);
    if (envioSel) params.set("envio", "1");
    if (verificadoSel) params.set("verificado", "1");
    if (maxPriceSel < MAX_PRICE_CAP) params.set("max", String(maxPriceSel));
    if (ordenSel !== "recientes") params.set("orden", ordenSel);
    setOpen(false);
    router.push(params.toString() ? `/?${params.toString()}` : "/");
  };

  return (
    <>
      <button
        type="button"
        onClick={openDrawer}
        aria-label="Filtrar"
        className="relative flex h-[42px] w-[42px] flex-none items-center justify-center rounded-full bg-ochre text-brand-dark"
      >
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3">
          <line x1="4" y1="6" x2="20" y2="6" />
          <circle cx="9" cy="6" r="2" fill="currentColor" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <circle cx="16" cy="12" r="2" fill="currentColor" />
          <line x1="4" y1="18" x2="20" y2="18" />
          <circle cx="11" cy="18" r="2" fill="currentColor" />
        </svg>
        {activeCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-background bg-coral text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          <div className="absolute inset-0 bg-ink/45" onClick={() => setOpen(false)} />
          <div className="relative flex max-h-[88vh] w-full max-w-lg flex-col rounded-t-[22px] bg-background">
            <div className="mx-auto mt-2.5 h-1 w-9 rounded-full bg-line" />
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <h3 className="text-lg font-extrabold text-ink">Filtrar</h3>
              <button type="button" onClick={clearAll} className="text-xs font-semibold text-coral">
                Limpiar todo
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4">
              <FilterSection title="Precio máximo (UYU)">
                <div className="flex items-center gap-2.5 font-mono text-[13px]">
                  <span>$U 0</span>
                  <input
                    type="range"
                    min="0"
                    max={MAX_PRICE_CAP}
                    step="500"
                    value={maxPriceSel}
                    onChange={(e) => setMaxPriceSel(Number(e.target.value))}
                    className="flex-1 accent-brand"
                  />
                  <span>{maxPriceSel >= MAX_PRICE_CAP ? "Sin tope" : formatPrice(maxPriceSel)}</span>
                </div>
              </FilterSection>

              <FilterSection title="Estado">
                <div className="flex flex-wrap gap-2">
                  {CONDITIONS.map((c) => (
                    <FilterPill
                      key={c}
                      label={c}
                      selected={conditionSel.includes(c)}
                      onClick={() => toggle(conditionSel, setConditionSel, c)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Confianza y envío">
                <div className="flex flex-wrap gap-2">
                  <FilterPill
                    label="Vendedor verificado"
                    selected={verificadoSel}
                    onClick={() => setVerificadoSel((v) => !v)}
                  />
                  <FilterPill label="Con envío" selected={envioSel} onClick={() => setEnvioSel((v) => !v)} />
                </div>
              </FilterSection>

              <FilterSection title="Ubicación">
                <select
                  value={ubicacionSel}
                  onChange={(e) => setUbicacionSel(e.target.value)}
                  className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
                >
                  <option value="">Todo el país</option>
                  {DEPARTAMENTOS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </FilterSection>

              <FilterSection title="Color">
                <div className="flex flex-wrap gap-2.5">
                  {COLOR_SWATCHES.map((c) => (
                    <button
                      key={c.name}
                      type="button"
                      title={c.name}
                      onClick={() => toggle(colorSel, setColorSel, c.name)}
                      className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${
                        colorSel.includes(c.name) ? "border-brand" : "border-transparent"
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {colorSel.includes(c.name) && (
                        <span className="text-[11px] text-white drop-shadow-[0_0_2px_rgba(0,0,0,0.6)]">✓</span>
                      )}
                    </button>
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Material">
                <div className="flex flex-wrap gap-2">
                  {MATERIALS.map((m) => (
                    <FilterPill
                      key={m}
                      label={m}
                      selected={materialSel.includes(m)}
                      onClick={() => toggle(materialSel, setMaterialSel, m)}
                    />
                  ))}
                </div>
              </FilterSection>

              <FilterSection title="Ordenar por">
                <div className="flex flex-wrap gap-2">
                  <FilterPill
                    label="Más recientes"
                    selected={ordenSel === "recientes"}
                    onClick={() => setOrdenSel("recientes")}
                  />
                  <FilterPill
                    label="Menor precio"
                    selected={ordenSel === "precio_asc"}
                    onClick={() => setOrdenSel("precio_asc")}
                  />
                  <FilterPill
                    label="Mayor precio"
                    selected={ordenSel === "precio_desc"}
                    onClick={() => setOrdenSel("precio_desc")}
                  />
                </div>
              </FilterSection>
            </div>

            <div className="flex gap-2.5 border-t border-line px-5 py-4">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex-1 rounded-xl border border-line py-3 text-sm font-bold text-ink"
              >
                Cancelar
              </button>
              <button type="button" onClick={apply} className="flex-[2] rounded-xl bg-brand py-3 text-sm font-bold text-white">
                Ver resultados
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function FilterSection({ title, children }) {
  return (
    <div className="mb-6">
      <h4 className="mb-2.5 text-[11px] font-bold uppercase tracking-wide text-muted">{title}</h4>
      {children}
    </div>
  );
}

function FilterPill({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3.5 py-2 text-[12.5px] font-semibold ${
        selected ? "border-brand bg-brand text-white" : "border-line bg-paper text-ink"
      }`}
    >
      {label}
    </button>
  );
}
