import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categoryById, formatPrice, timeAgo } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";
import ProductGallery from "@/components/ProductGallery";
import ProductStatusToggle from "@/components/ProductStatusToggle";
import DeleteProductButton from "@/components/DeleteProductButton";
import ChatButton from "@/components/ChatButton";
import ReportButton from "@/components/ReportButton";
import ViewCounter from "@/components/ViewCounter";
import ShareButton from "@/components/ShareButton";

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

  return (
    <div className="mx-auto max-w-2xl">
      <ViewCounter productId={product.id} skip={isOwner} />
      <div className="relative">
        <ProductGallery photos={photos} alt={product.title} />
        <div className="absolute right-3 top-3">
          <FavoriteButton productId={product.id} initialFavorite={isFavorite} loggedIn={Boolean(user)} variant="detail" />
        </div>
        {product.status === "vendido" && (
          <div className="absolute left-3 top-3 rounded-full bg-ink/80 px-3 py-1 text-xs font-bold text-white">
            VENDIDO
          </div>
        )}
      </div>

      <span
        className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ color: cat.color, backgroundColor: `${cat.color}20` }}
      >
        {cat.label}
        {product.color ? ` · ${product.color}` : ""}
      </span>

      <h1 className="mb-1.5 mt-2 font-serif text-2xl font-semibold text-ink">{product.title}</h1>
      <div className="mb-3 font-mono text-2xl font-semibold text-brand-dark">{formatPrice(product.price)}</div>

      <div className="mb-4 flex flex-wrap gap-3 text-sm text-muted">
        <span>📍 {product.location}</span>
        <span>{product.condition}</span>
        <span>Publicado {timeAgo(product.created_at)}</span>
        <span>👁 {product.views} {product.views === 1 ? "vista" : "vistas"}</span>
      </div>

      <p className="mb-6 whitespace-pre-wrap text-[15px] leading-relaxed text-ink">{product.description}</p>

      <div className="rounded-2xl border border-line bg-paper p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-ink">
          Publicado por <strong className="text-ink">{seller?.name || "Usuario"}</strong>
          {seller?.id_verified && (
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold text-brand-dark">
              VERIFICADO
            </span>
          )}
        </div>
        <div className="mb-3 mt-1.5 text-xs text-muted">
          {ratingAvg != null ? `★ ${ratingAvg.toFixed(1)} (${reviews.length})` : "Sin calificaciones aún"}
        </div>

        {isOwner ? (
          <div className="space-y-2">
            <ProductStatusToggle productId={product.id} status={product.status} />
            <DeleteProductButton productId={product.id} />
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {canBuy && (
              <Link
                href={`/comprar/${product.id}`}
                className="block w-full rounded-lg bg-brand py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Comprar
              </Link>
            )}
            {!user && (
              <Link
                href="/ingresar"
                className="block w-full rounded-lg bg-brand py-2.5 text-center text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Ingresá para comprar
              </Link>
            )}
            {user && <ChatButton productId={product.id} sellerId={product.seller_id} />}
          </div>
        )}
      </div>

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
