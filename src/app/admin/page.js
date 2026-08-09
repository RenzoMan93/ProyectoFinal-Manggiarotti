import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

export default async function AdminHomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");
  if (!(await isAdmin(supabase, user))) notFound();

  const [{ count: pendingVerifications }, { count: pendingReports }, { count: totalUsers }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("verification_status", "pending"),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("resolved", false),
    supabase.from("profiles").select("id", { count: "exact", head: true }),
  ]);

  const cards = [
    {
      href: "/admin/verificaciones",
      title: "Verificaciones de identidad",
      desc: "Revisar cédulas subidas por usuarios nuevos.",
      count: pendingVerifications || 0,
    },
    {
      href: "/admin/reportes",
      title: "Reportes",
      desc: "Publicaciones o usuarios reportados por la comunidad.",
      count: pendingReports || 0,
    },
    {
      href: "/admin/usuarios",
      title: "Usuarios",
      desc: "Listado de todas las cuentas registradas.",
      count: totalUsers || 0,
    },
  ];

  return (
    <div>
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink">Panel de administración</h1>
      <div className="grid gap-3.5 sm:grid-cols-3">
        {cards.map((c) => (
          <Link
            key={c.href}
            href={c.href}
            className="rounded-2xl border border-line bg-paper p-4 transition hover:bg-brand-light"
          >
            <div className="mb-1 font-mono text-2xl font-semibold text-brand-dark">{c.count}</div>
            <div className="mb-1 text-sm font-bold text-ink">{c.title}</div>
            <div className="text-xs text-muted">{c.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}
