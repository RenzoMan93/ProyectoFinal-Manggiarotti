import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatPrice, timeAgo } from "@/lib/format";
import OrderActions from "@/components/OrderActions";
import ReviewForm from "@/components/ReviewForm";

const STATUS_LABEL = {
  coordinando: "Coordinando",
  enviado: "Enviado",
  confirmado: "Confirmado",
  en_disputa: "En disputa",
};

const STATUS_STYLE = {
  coordinando: "bg-[#EFE7D2] text-[#8a6a1f]",
  enviado: "bg-brand-light text-brand-dark",
  confirmado: "bg-[#E1F3E9] text-[#1f7a45]",
  en_disputa: "bg-[#F7E6E1] text-coral",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: purchases } = await supabase
    .from("orders")
    .select("*, products(id, title, photo_urls), seller:profiles!orders_seller_id_fkey(name, phone)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  const { data: sales } = await supabase
    .from("orders")
    .select("*, products(id, title, photo_urls), buyer:profiles!orders_buyer_id_fkey(name, phone)")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false });

  const confirmedIds = (purchases || []).filter((o) => o.status === "confirmado").map((o) => o.id);
  let reviewedOrderIds = new Set();
  if (confirmedIds.length > 0) {
    const { data: myReviews } = await supabase.from("reviews").select("order_id").in("order_id", confirmedIds);
    reviewedOrderIds = new Set((myReviews || []).map((r) => r.order_id));
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink">Mis pedidos</h1>

      <h2 className="mb-3 text-sm font-bold text-ink">Mis compras</h2>
      {!purchases || purchases.length === 0 ? (
        <p className="mb-8 text-sm text-muted">Todavía no compraste nada.</p>
      ) : (
        <div className="mb-8 space-y-3">
          {purchases.map((order) => (
            <OrderRow
              key={order.id}
              order={order}
              counterpart={order.seller}
              role="buyer"
              alreadyReviewed={reviewedOrderIds.has(order.id)}
              buyerId={user.id}
            />
          ))}
        </div>
      )}

      <h2 className="mb-3 text-sm font-bold text-ink">Mis ventas</h2>
      {!sales || sales.length === 0 ? (
        <p className="text-sm text-muted">Todavía no vendiste nada.</p>
      ) : (
        <div className="space-y-3">
          {sales.map((order) => (
            <OrderRow key={order.id} order={order} counterpart={order.buyer} role="seller" />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderRow({ order, counterpart, role, alreadyReviewed, buyerId }) {
  const product = order.products;
  const cover = product?.photo_urls?.[0];
  return (
    <div className="flex gap-3 rounded-xl border border-line bg-paper p-3">
      <Link href={product ? `/producto/${product.id}` : "#"} className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
        {cover && <img src={cover} alt={product.title} className="h-full w-full object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-ink">{product?.title || "Artículo eliminado"}</div>
            <div className="text-xs text-muted">
              {role === "buyer" ? "Vendedor" : "Comprador"}: {counterpart?.name || "Usuario"}
            </div>
          </div>
          <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_STYLE[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <div className="mt-1 font-mono text-xs text-muted">
          {formatPrice(order.amount)} · {order.method} · {timeAgo(order.created_at)}
        </div>
        {order.note && <div className="mt-1 text-xs italic text-muted">&ldquo;{order.note}&rdquo;</div>}
        <OrderActions orderId={order.id} status={order.status} role={role} />
        {role === "buyer" && order.status === "confirmado" && (
          alreadyReviewed ? (
            <p className="mt-2 text-xs text-brand-dark">Ya calificaste esta compra.</p>
          ) : (
            <ReviewForm orderId={order.id} sellerId={order.seller_id} buyerId={buyerId} />
          )
        )}
      </div>
    </div>
  );
}
