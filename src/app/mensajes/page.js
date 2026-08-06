import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";

export default async function MessagesListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      "id, updated_at, buyer_id, seller_id, products(title, photo_url), buyer:profiles!conversations_buyer_id_fkey(name), seller:profiles!conversations_seller_id_fkey(name)",
    )
    .or(`buyer_id.eq.${user.id},seller_id.eq.${user.id}`)
    .order("updated_at", { ascending: false });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Mensajes</h1>

      {!conversations || conversations.length === 0 ? (
        <p className="py-10 text-center text-sm text-gray-400">Todavía no tenés conversaciones.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => {
            const isBuyer = c.buyer_id === user.id;
            const counterpart = isBuyer ? c.seller : c.buyer;
            return (
              <Link
                key={c.id}
                href={`/mensajes/${c.id}`}
                className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 hover:bg-gray-50"
              >
                <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {c.products?.photo_url && (
                    <img src={c.products.photo_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold text-gray-900">
                    {counterpart?.name || "Usuario"}
                  </div>
                  <div className="truncate text-xs text-gray-500">{c.products?.title}</div>
                </div>
                <div className="flex-shrink-0 text-xs text-gray-400">{timeAgo(c.updated_at)}</div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
