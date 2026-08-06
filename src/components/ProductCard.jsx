import Link from "next/link";
import { categoryById, formatPrice, timeAgo } from "@/lib/format";
import FavoriteButton from "@/components/FavoriteButton";

export default function ProductCard({ product, isFavorite, loggedIn }) {
  const cat = categoryById(product.category);

  return (
    <Link
      href={`/producto/${product.id}`}
      className="block overflow-hidden rounded-2xl border border-gray-200 bg-white transition hover:shadow-md"
    >
      <div className="relative flex h-32 items-center justify-center overflow-hidden bg-gray-50">
        <img src={product.photo_url} alt={product.title} className="h-full w-full object-cover" />
        <div className="absolute right-2 top-2">
          <FavoriteButton productId={product.id} initialFavorite={isFavorite} loggedIn={loggedIn} />
        </div>
      </div>
      <div className="px-3 py-2.5">
        <div className="mb-1 text-[15px] font-bold text-gray-900">{formatPrice(product.price)}</div>
        <div className="mb-1.5 truncate text-sm text-gray-700">
          {product.title}
          {product.color ? ` · ${product.color}` : ""}
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-400">
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
