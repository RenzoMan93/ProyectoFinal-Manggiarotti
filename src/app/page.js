import Link from "next/link";
import { CATEGORIES } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import ProductCard from "@/components/ProductCard";

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const categoria = params.categoria || "";

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let query = supabase
    .from("products")
    .select("*")
    .eq("status", "disponible")
    .order("created_at", { ascending: false });

  if (categoria) query = query.eq("category", categoria);
  if (q) {
    const safeQ = q.replace(/[,()%*]/g, " ").trim();
    if (safeQ) query = query.or(`title.ilike.%${safeQ}%,description.ilike.%${safeQ}%`);
  }

  const { data: products } = await query;

  let favoriteIds = new Set();
  if (user) {
    const { data: favs } = await supabase.from("favorites").select("product_id").eq("user_id", user.id);
    favoriteIds = new Set((favs || []).map((f) => f.product_id));
  }

  const hasFilters = Boolean(q || categoria);

  return (
    <>
      <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand to-brand-dark px-7 py-10 text-white">
        <h1 className="mb-2 font-serif text-2xl font-semibold sm:text-3xl">
          Dale una segunda vida a tus cosas
        </h1>
        <p className="mb-5 max-w-md text-sm leading-relaxed text-[#CFE0DA]">
          Comprá y vendé artículos usados cerca tuyo, en cualquier rincón de Uruguay. Publicá en
          menos de un minuto.
        </p>
        <Link
          href="/publicar"
          className="inline-block rounded-lg bg-ochre px-4 py-2.5 text-sm font-semibold text-brand-dark"
        >
          Publicar un artículo
        </Link>
      </div>

      <form action="/" method="get" className="mb-4 flex gap-2">
        {categoria && <input type="hidden" name="categoria" value={categoria} />}
        <input
          type="search"
          name="q"
          defaultValue={q}
          placeholder="Buscar bicicletas, muebles, ropa..."
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Buscar
        </button>
      </form>

      <h3 className="mb-3 text-sm font-bold text-ink">Categorías</h3>
      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        <Link
          href={q ? `/?q=${encodeURIComponent(q)}` : "/"}
          className={`flex-shrink-0 whitespace-nowrap rounded-full border px-3.5 py-2 text-sm font-medium ${
            !categoria ? "border-brand bg-brand-light text-brand-dark" : "border-line bg-paper text-ink"
          }`}
        >
          Todas
        </Link>
        {CATEGORIES.map((c) => {
          const params = new URLSearchParams();
          if (categoria !== c.id) params.set("categoria", c.id);
          if (q) params.set("q", q);
          const href = categoria === c.id ? (q ? `/?q=${encodeURIComponent(q)}` : "/") : `/?${params.toString()}`;
          return (
            <Link
              key={c.id}
              href={href}
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
            <ProductCard key={p.id} product={p} isFavorite={favoriteIds.has(p.id)} loggedIn={Boolean(user)} />
          ))}
        </div>
      )}
    </>
  );
}
