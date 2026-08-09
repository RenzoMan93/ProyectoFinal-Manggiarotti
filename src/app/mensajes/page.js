import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/format";
import HideConversationButton from "@/components/HideConversationButton";

export default async function MessagesListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: conversations } = await supabase
    .from("conversations")
    .select(
      "id, updated_at, buyer_id, seller_id, buyer_last_read_at, seller_last_read_at, products(title, photo_urls), buyer:profiles!conversations_buyer_id_fkey(name), seller:profiles!conversations_seller_id_fkey(name), messages(sender_id, created_at)",
    )
    .or(
      `and(buyer_id.eq.${user.id},deleted_by_buyer.eq.false),and(seller_id.eq.${user.id},deleted_by_seller.eq.false)`,
    )
    .order("updated_at", { ascending: false })
    .order("created_at", { foreignTable: "messages", ascending: false })
    .limit(1, { foreignTable: "messages" });

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink">Mensajes</h1>

      {!conversations || conversations.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Todavía no tenés conversaciones.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => {
            const isBuyer = c.buyer_id === user.id;
            const counterpart = isBuyer ? c.seller : c.buyer;
            const cover = c.products?.photo_urls?.[0];
            const lastMessage = c.messages?.[0];
            const lastRead = isBuyer ? c.buyer_last_read_at : c.seller_last_read_at;
            const unread = Boolean(
              lastMessage &&
                lastMessage.sender_id !== user.id &&
                (!lastRead || new Date(lastMessage.created_at) > new Date(lastRead)),
            );
            return (
              <div
                key={c.id}
                className={`flex items-center gap-3 rounded-xl border p-3 hover:bg-brand-light ${
                  unread ? "border-brand bg-brand-light/40" : "border-line bg-paper"
                }`}
              >
                <Link href={`/mensajes/${c.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                    {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {unread && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand" />}
                      <span
                        className={`truncate text-sm ${unread ? "font-bold text-ink" : "font-semibold text-ink"}`}
                      >
                        {counterpart?.name || "Usuario"}
                      </span>
                    </div>
                    <div className="truncate text-xs text-muted">{c.products?.title}</div>
                  </div>
                  <div className="flex-shrink-0 text-xs text-muted">{timeAgo(c.updated_at)}</div>
                </Link>
                <HideConversationButton conversationId={c.id} isBuyer={isBuyer} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
