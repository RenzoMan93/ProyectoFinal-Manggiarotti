import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  let unreadCount = 0;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("name, verification_status, is_admin")
      .eq("id", user.id)
      .single();
    profile = data;

    const { data: conversations } = await supabase
      .from("conversations")
      .select("buyer_id, seller_id, buyer_last_read_at, seller_last_read_at, messages(sender_id, created_at)")
      .or(
        `and(buyer_id.eq.${user.id},deleted_by_buyer.eq.false),and(seller_id.eq.${user.id},deleted_by_seller.eq.false)`,
      )
      .order("created_at", { foreignTable: "messages", ascending: false })
      .limit(1, { foreignTable: "messages" });

    unreadCount = (conversations || []).filter((c) => {
      const lastMessage = c.messages?.[0];
      if (!lastMessage || lastMessage.sender_id === user.id) return false;
      const isBuyer = c.buyer_id === user.id;
      const lastRead = isBuyer ? c.buyer_last_read_at : c.seller_last_read_at;
      return !lastRead || new Date(lastMessage.created_at) > new Date(lastRead);
    }).length;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 font-serif text-lg font-semibold text-brand-dark">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-sm text-white">
            ♻
          </span>
          ReUsalo
        </Link>

        <nav className="flex items-center gap-1.5">
          {user ? (
            <>
              <Link
                href="/mensajes"
                className="relative hidden rounded-lg px-2.5 py-2 text-sm font-medium text-ink hover:bg-brand-light sm:inline"
              >
                Mensajes
                {unreadCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/mis-productos"
                className="hidden rounded-lg px-2.5 py-2 text-sm font-medium text-ink hover:bg-brand-light sm:inline"
              >
                Mis publicaciones
              </Link>
              <Link
                href="/pedidos"
                className="hidden rounded-lg px-2.5 py-2 text-sm font-medium text-ink hover:bg-brand-light sm:inline"
              >
                Pedidos
              </Link>
              <Link
                href="/favoritos"
                className="hidden rounded-lg px-2.5 py-2 text-sm font-medium text-ink hover:bg-brand-light sm:inline"
              >
                Favoritos
              </Link>
              <Link
                href="/publicar"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Publicar
              </Link>
              <Link href="/verificar" className="hidden text-sm text-muted hover:underline sm:inline">
                Hola, {profile?.name?.split(" ")[0] || "vos"}
                {profile?.verification_status === "approved" && " ✓"}
                {profile?.verification_status === "pending" && " ⏳"}
              </Link>
              {profile?.is_admin && (
                <Link
                  href="/admin/verificaciones"
                  className="hidden rounded-lg px-2.5 py-2 text-sm font-medium text-ochre hover:bg-brand-light sm:inline"
                >
                  Panel admin
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/ingresar"
                className="rounded-lg px-3 py-2 text-sm font-medium text-ink hover:bg-brand-light"
              >
                Ingresar
              </Link>
              <Link
                href="/registrarse"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Crear cuenta
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
