import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConversationsWithUnread } from "@/lib/unread";
import LogoutButton from "@/components/LogoutButton";
import MobileMenu from "@/components/MobileMenu";

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

    const conversations = await getConversationsWithUnread(supabase, user.id);
    unreadCount = conversations.filter((c) => c.unread).length;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-line bg-paper">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-2 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-brand">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-brand text-base text-white">
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
                className="rounded-xl bg-coral px-4 py-2 text-sm font-bold text-white hover:opacity-90"
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
                  href="/admin"
                  className="hidden rounded-lg px-2.5 py-2 text-sm font-medium text-ochre hover:bg-brand-light sm:inline"
                >
                  Panel admin
                </Link>
              )}
              <MobileMenu
                unreadCount={unreadCount}
                profileName={profile?.name?.split(" ")[0]}
                verificationStatus={profile?.verification_status}
                isAdmin={profile?.is_admin}
              />
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
                className="rounded-xl bg-coral px-4 py-2 text-sm font-bold text-white hover:opacity-90"
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
