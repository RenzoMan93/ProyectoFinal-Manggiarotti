import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";

const STATUS_LABEL = {
  none: "Sin verificar",
  pending: "Pendiente ⏳",
  approved: "Verificado ✓",
  rejected: "Rechazado",
};

export default async function AdminUsersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");
  if (!(await isAdmin(supabase, user))) notFound();

  const { data: users } = await supabase
    .from("profiles")
    .select("id, name, phone, created_at, verification_status, is_admin")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold text-ink">Usuarios</h1>
      <p className="mb-6 text-sm text-muted">{(users || []).length} cuentas registradas.</p>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full text-left text-sm">
          <thead className="bg-cream text-xs font-bold text-muted">
            <tr>
              <th className="px-3 py-2.5">Nombre</th>
              <th className="px-3 py-2.5">Teléfono</th>
              <th className="px-3 py-2.5">Estado</th>
              <th className="px-3 py-2.5">Alta</th>
            </tr>
          </thead>
          <tbody>
            {(users || []).map((u) => (
              <tr key={u.id} className="border-t border-line">
                <td className="px-3 py-2.5 text-ink">
                  {u.name} {u.is_admin && <span className="text-xs text-ochre">(admin)</span>}
                </td>
                <td className="px-3 py-2.5 text-ink">{u.phone}</td>
                <td className="px-3 py-2.5 text-ink">{STATUS_LABEL[u.verification_status] || u.verification_status}</td>
                <td className="px-3 py-2.5 text-muted">{new Date(u.created_at).toLocaleDateString("es-UY")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
