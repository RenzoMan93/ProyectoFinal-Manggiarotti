import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";
import SearchBar from "@/components/SearchBar";
import FilterDrawer from "@/components/FilterDrawer";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const categoria = params.categoria || "";
  const minPrice = params.min ? Number(params.min) : null;
  const maxPrice = params.max ? Number(params.max) : null;
  const condition = params.condition ? params.condition.split(",") : [];
  const material = params.material ? params.material.split(",") : [];
  const color = params.color ? params.color.split(",") : [];
  const ubicacion = params.ubicacion || "";
  const envio = params.envio === "1";
  const verificado = params.verificado === "1";
  const orden = params.orden || "recientes";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const sellerEmbed = verificado
    ? "seller:profiles!products_seller_id_fkey!inner(id_verified)"
    : "seller:profiles!products_seller_id_fkey(id_verified)";

  let query = supabase
    .from("products")
    .select(`*, ${sellerEmbed}`)
    .eq("status", "disponible");

  if (categoria) query = query.eq("category", categoria);
  if (q) {
    const safeQ = q.replace(/[,()%*]/g, " ").trim();
    if (safeQ) query = query.or(`title.ilike.%${safeQ}%,description.ilike.%${safeQ}%`);
  }
  if (minPrice !== null && !Number.isNaN(minPrice)) query = query.gte("price", minPrice);
  if (maxPrice !== null && !Number.isNaN(maxPrice)) query = query.lte("price", maxPrice);
  if (condition.length) query = query.in("condition", condition);
  if (material.length) query = query.in("material", material);
  if (color.length) query = query.in("color", color);
  if (ubicacion) query = query.eq("location", ubicacion);
  if (envio) query = query.eq("offers_shipping", true);
  if (verificado) query = query.eq("seller.id_verified", true);

  if (orden === "precio_asc") query = query.order("price", { ascending: true });
  else if (orden === "precio_desc") query = query.order("price", { ascending: false });
  else query = query.order("created_at", { ascending: false });

  const { data: products } = await query;

  let favoriteIds = new Set();
  if (user) {
    const { data: favs } = await supabase.from("favorites").select("product_id").eq("user_id", user.id);
    favoriteIds = new Set((favs || []).map((f) => f.product_id));
  }

  const hasFilters = Boolean(
    q || categoria || minPrice || maxPrice || condition.length || material.length || color.length || ubicacion || envio || verificado,
  );

  const buildParams = (overrides = {}) => {
    const base = {
      q,
      categoria,
      min: minPrice != null ? String(minPrice) : "",
      max: maxPrice != null ? String(maxPrice) : "",
      condition: condition.join(","),
      material: material.join(","),
      color: color.join(","),
      ubicacion,
      envio: envio ? "1" : "",
      verificado: verificado ? "1" : "",
      orden: orden !== "recientes" ? orden : "",
      ...overrides,
    };
    const search = new URLSearchParams();
    Object.entries(base).forEach(([k, v]) => {
      if (v) search.set(k, v);
    });
    return search;
  };

  return (
    <>
      <div className="mb-4 flex items-start gap-2">
        <div className="flex-1">
          <SearchBar q={q} categoria={categoria} minPrice={minPrice} maxPrice={maxPrice} />
        </div>
        <FilterDrawer
          q={q}
          categoria={categoria}
          condition={condition}
          material={material}
          color={color}
          ubicacion={ubicacion}
          envio={envio}
          verificado={verificado}
          maxPrice={maxPrice}
          orden={orden}
        />
      </div>

      <h3 className="mb-3 text-sm font-bold text-ink">Categorías</h3>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <Link
          href={(() => {
            const s = buildParams({ categoria: "" }).toString();
            return s ? `/?${s}` : "/";
          })()}
          className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium ${
            !categoria ? "border-brand bg-brand-light text-brand-dark" : "border-line bg-paper text-ink"
          }`}
        >
          Todas
        </Link>
        {CATEGORIES.map((c) => {
          const s = buildParams({ categoria: categoria === c.id ? "" : c.id }).toString();
          return (
            <Link
              key={c.id}
              href={s ? `/?${s}` : "/"}
              className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium ${
                categoria === c.id
                  ? "border-brand bg-brand-light text-brand-dark"
                  : "border-line bg-paper text-ink"
              }`}
            >
              {c.label}
            </Link>
          );
        })}
      </div>

      <h3 className="mb-3 text-sm font-bold text-ink">{hasFilters ? "Resultados" : "Publicados recientemente"}</h3>

      {!products || products.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">
          {hasFilters
            ? "No encontramos artículos con esos filtros."
            : "Todavía no hay publicaciones. ¡Sé el primero en publicar!"}
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              isFavorite={favoriteIds.has(p.id)}
              loggedIn={Boolean(user)}
              sellerVerified={Boolean(p.seller?.id_verified)}
            />
          ))}
        </div>
      )}
    </>
  );
}
