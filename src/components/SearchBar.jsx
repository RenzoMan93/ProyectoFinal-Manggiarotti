"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { parseSearchQuery } from "@/lib/searchParser";
import { formatPrice } from "@/lib/format";

export default function SearchBar({ q, categoria, minPrice, maxPrice }) {
  const router = useRouter();
  const [text, setText] = useState(q || "");

  const buildHref = (params) => (params.toString() ? `/?${params.toString()}` : "/");

  const submit = (e) => {
    e.preventDefault();
    const { keywords, minPrice: min, maxPrice: max } = parseSearchQuery(text);
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (keywords) params.set("q", keywords);
    if (min !== null) params.set("min", String(min));
    if (max !== null) params.set("max", String(max));
    setText(keywords);
    router.push(buildHref(params));
  };

  const clearPrice = () => {
    const params = new URLSearchParams();
    if (categoria) params.set("categoria", categoria);
    if (q) params.set("q", q);
    router.push(buildHref(params));
  };

  const hasPriceFilter = minPrice != null || maxPrice != null;

  let priceLabel = "";
  if (minPrice != null && maxPrice != null) priceLabel = `${formatPrice(minPrice)} – ${formatPrice(maxPrice)}`;
  else if (maxPrice != null) priceLabel = `Hasta ${formatPrice(maxPrice)}`;
  else if (minPrice != null) priceLabel = `Desde ${formatPrice(minPrice)}`;

  return (
    <div className="mb-4">
      <form onSubmit={submit} className="flex gap-2">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Contame qué buscás: 'bici que salga menos de $3000'"
          className="w-full rounded-full border-2 border-line bg-paper px-4 py-2.5 text-sm focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          className="flex-none rounded-full bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-dark"
        >
          Buscar
        </button>
      </form>
      {hasPriceFilter && (
        <div className="mt-2 flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-light px-3 py-1 text-xs font-semibold text-brand-dark">
            💰 {priceLabel}
            <button
              type="button"
              onClick={clearPrice}
              aria-label="Quitar filtro de precio"
              className="text-brand-dark/70 hover:text-brand-dark"
            >
              ✕
            </button>
          </span>
        </div>
      )}
    </div>
  );
}
