import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categoryById, conditionBadge, formatPrice, timeAgo } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";
import ProductGallery from "@/components/ProductGallery";
import ProductStatusToggle from "@/components/ProductStatusToggle";
import DeleteProductButton from "@/components/DeleteProductButton";
import ChatButton from "@/components/ChatButton";
import ReportButton from "@/components/ReportButton";
import ViewCounter from "@/components/ViewCounter";
import ShareButton from "@/components/ShareButton";

function initials(name) {
  const parts = (name || "").trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] || "")).toUpperCase();
}

export default async function ProductDetailPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: product } = await supabase.from("products").select("*").eq("id", id).single();
  if (!product) notFound();

  const { data: seller } = await supabase
    .from("profiles")
    .select("name, id_verified")
    .eq("id", product.seller_id)
    .single();

  const { data: reviews } = await supabase.from("reviews").select("rating").eq("seller_id", product.seller_id);
  const ratingAvg = reviews && reviews.length > 0 ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : null;

  let isFavorite = false;
  if (user) {
    const { data: fav } = await supabase
      .from("favorites")
      .select("user_id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .maybeSingle();
    isFavorite = Boolean(fav);
  }

  const cat = categoryById(product.category);
  const isOwner = user?.id === product.seller_id;
  const canBuy = user && !isOwner && product.status === "disponible";
  const photos = product.photo_urls || [];
  const hasDiscount = product.old_price && Number(product.old_price) > Number(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - Number(product.price) / Number(product.old_price)) * 100)
    : null;

  const specs = [
    { label: "Marca", value: product.brand },
    { label: "Estado", value: product.condition },
    { label: "Material", value: product.material },
    { label: "Color", value: product.color },
  ].filter((s) => s.value);

  return (
    <div className="mx-auto max-w-2xl">
      <ViewCounter productId={product.id} skip={isOwner} />
      <div className="relative">
        <ProductGallery photos={photos} alt={product.title} />
        <div className="absolute right-3 top-3">
          <FavoriteButton productId={product.id} initialFavorite={isFavorite} loggedIn={Boolean(user)} variant="detail" />
        </div>
        {product.status === "vendido" || product.status === "pausado" ? (
          <div className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-bold text-white">
            {product.status === "vendido" ? "VENDIDO" : "OCULTO"}
          </div>
        ) : (
          <div className="absolute left-3 top-3 rounded-lg bg-ink/70 px-2.5 py-1 text-[11px] font-bold text-white">
            {conditionBadge(product.condition)}
          </div>
        )}
      </div>

      <span
        className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ color: cat.color, backgroundColor: `${cat.color}20` }}
      >
        {cat.label}
      </span>

      <div className="mb-2 mt-3 flex items-baseline gap-2.5">
        <span className="font-mono text-[28px] font-semibold leading-none text-brand-dark">
          {formatPrice(product.price)}
        </span>
        {hasDiscount && (
          <>
            <span className="font-mono text-sm text-muted line-through">{formatPrice(product.old_price)}</span>
            <span className="rounded-md bg-coral px-1.5 py-0.5 text-[10.5px] font-bold text-white">
              -{discountPct}%
            </span>
          </>
        )}
      </div>

      <h1 className="mb-3 text-xl font-bold leading-snug text-ink">{product.title}</h1>

      <div className="mb-4 flex flex-wrap gap-3 text-sm text-muted">
        <span>📍 {product.location}</span>
        {product.offers_shipping && <span>🚚 Ofrece envío</span>}
        <span>Publicado {timeAgo(product.created_at)}</span>
        <span>
          👁 {product.views} {product.views === 1 ? "vista" : "vistas"}
        </span>
      </div>

      {specs.length > 0 && (
        <div className="mb-5 grid grid-cols-2 gap-3 rounded-2xl border border-line bg-paper p-4">
          {specs.map((s) => (
            <div key={s.label}>
              <div className="text-[10px] font-bold uppercase tracking-wide text-muted">{s.label}</div>
              <div className="text-[13px] font-semibold text-ink">{s.value}</div>
            </div>
          ))}
        </div>
      )}

      <p className="mb-6 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{product.description}</p>

      <div className="mb-5 flex items-center gap-3 rounded-2xl border border-line bg-paper p-3.5">
        <div className="relative flex h-11 w-11 flex-none items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-sm font-bold text-white">
          {initials(seller?.name)}
          {seller?.id_verified && (
            <span className="absolute -bottom-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full border-2 border-paper bg-brand">
              <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="4">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </span>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-sm font-bold text-ink">
            {seller?.name || "Usuario"}
            {seller?.id_verified && (
              <span className="rounded-md bg-brand-light px-1.5 py-0.5 text-[9px] font-bold text-brand-dark">
                VERIFICADO
              </span>
            )}
          </div>
          <div className="text-xs text-muted">
            {ratingAvg != null ? `★ ${ratingAvg.toFixed(1)} (${reviews.length})` : "Sin calificaciones aún"}
          </div>
        </div>
      </div>

      {isOwner ? (
        <div className="space-y-2">
          <ProductStatusToggle productId={product.id} status={product.status} />
          <DeleteProductButton productId={product.id} />
        </div>
      ) : (
        <div className="flex gap-2.5">
          {user && <ChatButton productId={product.id} sellerId={product.seller_id} variant="icon" />}
          {canBuy && (
            <Link
              href={`/comprar/${product.id}`}
              className="flex flex-1 items-center justify-center rounded-2xl bg-brand text-center text-sm font-bold text-white hover:bg-brand-dark"
            >
              Comprar ahora
            </Link>
          )}
          {!user && (
            <Link
              href="/ingresar"
              className="flex flex-1 items-center justify-center rounded-2xl bg-brand text-center text-sm font-bold text-white hover:bg-brand-dark"
            >
              Ingresá para comprar
            </Link>
          )}
        </div>
      )}

      <div className="mt-3">
        <ShareButton title={product.title} />
      </div>

      {user && !isOwner && (
        <div className="mt-3">
          <ReportButton type="product" targetId={product.id} label="Reportar esta publicación" />
        </div>
      )}
    </div>
  );
}
