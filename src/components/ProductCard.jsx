import Link from "next/link";
import { categoryById, formatPrice, timeAgo } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProductCard({ product, isFavorite, loggedIn }) {
  const cat = categoryById(product.category);
  const cover = product.photo_urls?.[0];

  return (
    <Link
      href={`/producto/${product.id}`}
      className="reusalo-card block overflow-hidden rounded-2xl bg-paper transition"
    >
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-cream">
        {cover && <img src={cover} alt={product.title} className="h-full w-full object-cover" />}
        <div className="absolute right-2 top-2">
          <FavoriteButton productId={product.id} initialFavorite={isFavorite} loggedIn={loggedIn} />
        </div>
        {product.status === "vendido" && (
          <div className="absolute left-2 top-2 rounded-full bg-ink/75 px-2 py-0.5 text-[10px] font-bold text-white">
            VENDIDO
          </div>
        )}
        {product.status === "pausado" && (
          <div className="absolute left-2 top-2 rounded-full bg-muted/85 px-2 py-0.5 text-[10px] font-bold text-white">
            OCULTO
          </div>
        )}
      </div>
      <div className="px-3 py-2.5">
        <div className="mb-1 font-mono text-[15px] font-semibold text-brand-dark">{formatPrice(product.price)}</div>
        <div className="mb-1.5 truncate text-sm text-ink">
          {product.title}
          {product.color ? ` · ${product.color}` : ""}
        </div>
        <div className="flex items-center gap-1 text-xs text-muted">
          <span>{cat.label}</span>
          <span>·</span>
          <span>{product.location}</span>
          <span>·</span>
          <span>{timeAgo(product.created_at)}</span>
        </div>
      </div>
    </Link>
  );
}
