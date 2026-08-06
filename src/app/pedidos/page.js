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

const STATUS_COLOR = {
  coordinando: "bg-amber-100 text-amber-800",
  enviado: "bg-blue-100 text-blue-800",
  confirmado: "bg-green-100 text-green-800",
  en_disputa: "bg-red-100 text-red-800",
};

export default async function OrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: purchases } = await supabase
    .from("orders")
    .select("*, products(id, title, photo_url), seller:profiles!orders_seller_id_fkey(name, phone)")
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false });

  const { data: sales } = await supabase
    .from("orders")
    .select("*, products(id, title, photo_url), buyer:profiles!orders_buyer_id_fkey(name, phone)")
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
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mis pedidos</h1>

      <h2 className="mb-3 text-sm font-bold text-gray-700">Mis compras</h2>
      {!purchases || purchases.length === 0 ? (
        <p className="mb-8 text-sm text-gray-400">Todavía no compraste nada.</p>
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

      <h2 className="mb-3 text-sm font-bold text-gray-700">Mis ventas</h2>
      {!sales || sales.length === 0 ? (
        <p className="text-sm text-gray-400">Todavía no vendiste nada.</p>
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
  return (
    <div className="flex gap-3 rounded-xl border border-gray-200 bg-white p-3">
      <Link href={product ? `/producto/${product.id}` : "#"} className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
        {product?.photo_url && <img src={product.photo_url} alt={product.title} className="h-full w-full object-cover" />}
      </Link>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-900">{product?.title || "Artículo eliminado"}</div>
            <div className="text-xs text-gray-500">
              {role === "buyer" ? "Vendedor" : "Comprador"}: {counterpart?.name || "Usuario"}
            </div>
          </div>
          <span className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS_COLOR[order.status]}`}>
            {STATUS_LABEL[order.status]}
          </span>
        </div>
        <div className="mt-1 text-xs text-gray-400">
          {formatPrice(order.amount)} · {order.method} · {timeAgo(order.created_at)}
        </div>
        {order.note && <div className="mt-1 text-xs italic text-gray-500">&ldquo;{order.note}&rdquo;</div>}
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
