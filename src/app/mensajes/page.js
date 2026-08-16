import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getConversationsWithUnread } from "@/lib/unread";
import { timeAgo } from "@/lib/format";
import HideConversationButton from "@/components/HideConversationButton";

export default async function MessagesListPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const conversations = await getConversationsWithUnread(supabase, user.id);

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-6 text-2xl font-extrabold text-ink">Mensajes</h1>

      {conversations.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">Todavía no tenés conversaciones.</p>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => {
            const isBuyer = c.buyer_id === user.id;
            const counterpart = isBuyer ? c.seller : c.buyer;
            const cover = c.products?.photo_urls?.[0];
            return (
              <div
                key={c.id}
                className={`flex items-center gap-3 rounded-xl border p-3 hover:bg-brand-light ${
                  c.unread ? "border-brand bg-brand-light/40" : "border-line bg-paper"
                }`}
              >
                <Link href={`/mensajes/${c.id}`} className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-cream">
                    {cover && <img src={cover} alt="" className="h-full w-full object-cover" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      {c.unread && <span className="h-2 w-2 flex-shrink-0 rounded-full bg-brand" />}
                      <span
                        className={`truncate text-sm ${c.unread ? "font-bold text-ink" : "font-semibold text-ink"}`}
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
