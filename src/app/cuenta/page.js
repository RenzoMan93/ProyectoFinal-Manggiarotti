import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { initials } from "@/lib/format";
import LogoutButton from "@/components/LogoutButton";

const STATUS_LABEL = {
  approved: "Cuenta verificada ✓",
  pending: "Verificación pendiente ⏳",
  rejected: "Verificación rechazada",
  none: "Verificá tu cuenta",
};

const LINKS = [
  { href: "/mis-productos", icon: "🏷️", label: "Mis publicaciones" },
  { href: "/pedidos", icon: "📦", label: "Pedidos" },
  { href: "/favoritos", icon: "❤️", label: "Favoritos" },
  { href: "/mensajes", icon: "💬", label: "Mensajes" },
  { href: "/verificar", icon: "🪪", label: "Verificar identidad" },
];

export default async function AccountPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, verification_status, is_admin")
    .eq("id", user.id)
    .single();

  const name = profile?.name || "Vos";

  return (
    <div className="mx-auto max-w-md">
      <div className="mb-6 flex items-center gap-3.5 rounded-2xl border border-line bg-paper p-4">
        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-dark text-lg font-bold text-white">
          {initials(name)}
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-bold text-ink">{name}</div>
          <div className="text-xs text-muted">
            {STATUS_LABEL[profile?.verification_status] || STATUS_LABEL.none}
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-line bg-paper">
        {LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 border-b border-line px-4 py-3.5 text-sm font-medium text-ink last:border-b-0 hover:bg-brand-light"
          >
            <span className="text-base leading-none">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
        {profile?.is_admin && (
          <Link
            href="/admin"
            className="flex items-center gap-3 border-b border-line px-4 py-3.5 text-sm font-medium text-ochre last:border-b-0 hover:bg-brand-light"
          >
            <span className="text-base leading-none">🛠️</span>
            <span>Panel admin</span>
          </Link>
        )}
      </div>

      <div className="mt-4">
        <LogoutButton />
      </div>
    </div>
  );
}
