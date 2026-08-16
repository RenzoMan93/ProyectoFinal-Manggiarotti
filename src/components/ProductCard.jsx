import Link from "next/link";
import { categoryById, conditionBadge, formatPrice, timeAgo } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProductCard({ product, isFavorite, loggedIn, sellerVerified }) {
  const cat = categoryById(product.category);
  const cover = product.photo_urls?.[0];
  const hasDiscount = product.old_price && Number(product.old_price) > Number(product.price);

  return (
    <Link
      href={`/producto/${product.id}`}
      className="reusalo-card block overflow-hidden rounded-2xl bg-paper transition"
    >
      <div className="relative aspect-square overflow-hidden bg-cream">
        {cover && <img src={cover} alt={product.title} className="h-full w-full object-cover" />}

        <div className="absolute left-2 top-2 rounded-lg bg-ink/80 px-2 py-1 text-[9.5px] font-bold tracking-wide text-white">
          {conditionBadge(product.condition)}
        </div>

        {sellerVerified && (
          <div className="absolute right-2 top-2 flex h-[22px] w-[22px] items-center justify-center rounded-full border-2 border-white bg-brand">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
        )}

        {product.status === "vendido" && (
          <div className="absolute inset-x-2 top-9 rounded-full bg-ink/80 px-2 py-0.5 text-center text-[10px] font-bold text-white">
            VENDIDO
          </div>
        )}
        {product.status === "pausado" && (
          <div className="absolute inset-x-2 top-9 rounded-full bg-muted/85 px-2 py-0.5 text-center text-[10px] font-bold text-white">
            OCULTO
          </div>
        )}

        <div className="absolute bottom-2 right-2">
          <FavoriteButton productId={product.id} initialFavorite={isFavorite} loggedIn={loggedIn} />
        </div>
      </div>

      <div className="px-3 py-2.5">
        <div className="mb-1.5 line-clamp-2 h-8 text-[12.5px] font-semibold leading-tight text-ink">
          {product.title}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-mono text-[15px] font-semibold text-brand-dark">{formatPrice(product.price)}</span>
          {hasDiscount && (
            <span className="font-mono text-[10.5px] text-muted line-through">{formatPrice(product.old_price)}</span>
          )}
        </div>
        <div className="mt-1 flex items-center gap-1 text-[10.5px] text-muted">
          <span>{cat.label}</span>
          <span>·</span>
          <span>📍 {product.location}</span>
          {product.offers_shipping && (
            <>
              <span>·</span>
              <span>🚚 Envío</span>
            </>
          )}
        </div>
        <div className="mt-0.5 text-[10.5px] text-muted">{timeAgo(product.created_at)}</div>
      </div>
    </Link>
  );
}
