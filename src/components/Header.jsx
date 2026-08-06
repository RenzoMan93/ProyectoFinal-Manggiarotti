import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import LogoutButton from "@/components/LogoutButton";

export default async function Header() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile = null;
  if (user) {
    const { data } = await supabase.from("profiles").select("name").eq("id", user.id).single();
    profile = data;
  }

  return (
    <header className="sticky top-0 z-10 border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-extrabold text-brand">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand text-sm text-white">
            ♻
          </span>
          ReUsalo
        </Link>

        <nav className="flex items-center gap-2">
          {user ? (
            <>
              <Link
                href="/pedidos"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:inline"
              >
                Pedidos
              </Link>
              <Link
                href="/favoritos"
                className="hidden rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 sm:inline"
              >
                Favoritos
              </Link>
              <Link
                href="/publicar"
                className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white hover:bg-brand-dark"
              >
                Publicar
              </Link>
              <span className="hidden text-sm text-gray-600 sm:inline">
                Hola, {profile?.name?.split(" ")[0] || "vos"}
              </span>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link
                href="/ingresar"
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
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
