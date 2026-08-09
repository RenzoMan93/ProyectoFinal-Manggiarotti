import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import ChatThread from "@/components/ChatThread";
import ReportButton from "@/components/ReportButton";
import HideConversationButton from "@/components/HideConversationButton";

export default async function ChatThreadPage({ params }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: conversation } = await supabase
    .from("conversations")
    .select(
      "id, product_id, buyer_id, seller_id, products(title), buyer:profiles!conversations_buyer_id_fkey(id, name), seller:profiles!conversations_seller_id_fkey(id, name)",
    )
    .eq("id", id)
    .single();

  if (!conversation) notFound();
  if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) notFound();

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", id)
    .order("created_at", { ascending: true });

  const isBuyer = conversation.buyer_id === user.id;
  const counterpart = isBuyer ? conversation.seller : conversation.buyer;

  return (
    <div className="mx-auto flex h-[calc(100vh-140px)] max-w-2xl flex-col">
      <div className="mb-3 flex items-center justify-between border-b border-line pb-3">
        <div>
          <Link href={`/producto/${conversation.product_id}`} className="text-sm font-semibold text-ink hover:underline">
            {conversation.products?.title}
          </Link>
          <div className="text-xs text-muted">con {counterpart?.name || "Usuario"}</div>
        </div>
        <div className="flex items-center gap-3">
          <ReportButton type="user" targetId={counterpart?.id} label="Reportar" />
          <HideConversationButton conversationId={conversation.id} isBuyer={isBuyer} redirectTo="/mensajes" compact={false} />
        </div>
      </div>

      <ChatThread
        conversationId={id}
        initialMessages={messages || []}
        currentUserId={user.id}
        counterpartId={counterpart?.id}
        counterpartName={counterpart?.name || "Usuario"}
      />
    </div>
  );
}
