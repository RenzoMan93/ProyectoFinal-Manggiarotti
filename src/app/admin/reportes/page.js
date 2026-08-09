import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import ReportCard from "@/components/ReportCard";

export default async function AdminReportsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");
  if (!(await isAdmin(supabase, user))) notFound();

  const { data: reports } = await supabase
    .from("reports")
    .select(
      `id, type, reason, comment, created_at,
       reporter:profiles!reports_reporter_id_fkey(name),
       reported_user:profiles!reports_reported_user_id_fkey(id, name),
       reported_product:products!reports_reported_product_id_fkey(id, title)`,
    )
    .eq("resolved", false)
    .order("created_at", { ascending: false });

  const items = reports || [];

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold text-ink">Reportes pendientes</h1>
      <p className="mb-6 text-sm text-muted">Publicaciones o usuarios reportados por la comunidad.</p>

      {items.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No hay reportes pendientes por ahora.</p>
      ) : (
        <div className="space-y-3">
          {items.map((r) => (
            <ReportCard key={r.id} report={r} />
          ))}
        </div>
      )}
    </div>
  );
}
