// Trae las conversaciones visibles del usuario con su último mensaje y si
// está sin leer. Se hace en dos consultas simples en vez de una sola
// consulta anidada con order/limit por foreign table, que resultó poco
// confiable en producción (a veces devolvía vacío sin motivo aparente).
export async function getConversationsWithUnread(supabase, userId) {
  const { data: conversations, error: convError } = await supabase
    .from("conversations")
    .select(
      "id, updated_at, buyer_id, seller_id, buyer_last_read_at, seller_last_read_at, products(title, photo_urls), buyer:profiles!conversations_buyer_id_fkey(name), seller:profiles!conversations_seller_id_fkey(name)",
    )
    .or(
      `and(buyer_id.eq.${userId},deleted_by_buyer.eq.false),and(seller_id.eq.${userId},deleted_by_seller.eq.false)`,
    )
    .order("updated_at", { ascending: false });
  if (convError) console.error("getConversationsWithUnread conversations:", convError);

  const list = conversations || [];
  if (list.length === 0) return [];

  const { data: lastMessages, error: msgError } = await supabase
    .from("messages")
    .select("conversation_id, sender_id, created_at")
    .in(
      "conversation_id",
      list.map((c) => c.id),
    )
    .order("created_at", { ascending: false });
  if (msgError) console.error("getConversationsWithUnread messages:", msgError);

  const lastByConv = {};
  (lastMessages || []).forEach((m) => {
    if (!lastByConv[m.conversation_id]) lastByConv[m.conversation_id] = m;
  });

  return list.map((c) => {
    const lastMessage = lastByConv[c.id] || null;
    const isBuyer = c.buyer_id === userId;
    const lastRead = isBuyer ? c.buyer_last_read_at : c.seller_last_read_at;
    const unread = Boolean(
      lastMessage &&
        lastMessage.sender_id !== userId &&
        (!lastRead || new Date(lastMessage.created_at) > new Date(lastRead)),
    );
    return { ...c, lastMessage, unread };
  });
}
