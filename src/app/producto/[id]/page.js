import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { categoryById, formatPrice, timeAgo } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";

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

  return (
    <div className="mx-auto max-w-2xl">
      <div className="relative mb-5 h-64 overflow-hidden rounded-2xl bg-gray-100 sm:h-80">
        <img src={product.photo_url} alt={product.title} className="h-full w-full object-cover" />
        <div className="absolute right-3 top-3">
          <FavoriteButton productId={product.id} initialFavorite={isFavorite} loggedIn={Boolean(user)} variant="detail" />
        </div>
      </div>

      <span
        className="inline-block rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ color: cat.color, backgroundColor: `${cat.color}20` }}
      >
        {cat.label}
        {product.color ? ` · ${product.color}` : ""}
      </span>

      <h1 className="mb-1.5 mt-2 text-2xl font-extrabold text-gray-900">{product.title}</h1>
      <div className="mb-3 text-2xl font-extrabold text-brand">{formatPrice(product.price)}</div>

      <div className="mb-4 flex flex-wrap gap-3 text-sm text-gray-500">
        <span>📍 {product.location}</span>
        <span>{product.condition}</span>
        <span>Publicado {timeAgo(product.created_at)}</span>
      </div>

      <p className="mb-6 whitespace-pre-wrap text-[15px] leading-relaxed text-gray-800">{product.description}</p>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          Publicado por <strong className="text-gray-900">{seller?.name || "Usuario"}</strong>
          {seller?.id_verified && (
            <span className="rounded-full bg-brand-light px-2 py-0.5 text-[10px] font-bold text-brand-dark">
              VERIFICADO
            </span>
          )}
        </div>
        <div className="mt-1.5 text-xs text-gray-400">
          {ratingAvg != null ? `★ ${ratingAvg.toFixed(1)} (${reviews.length})` : "Sin calificaciones aún"}
        </div>
      </div>
    </div>
  );
}
