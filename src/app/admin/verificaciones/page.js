import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isAdmin } from "@/lib/admin";
import VerificationReviewCard from "@/components/VerificationReviewCard";

export default async function AdminVerificationsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");
  if (!(await isAdmin(supabase, user))) notFound();

  const { data: pending, error: pendingError } = await supabase
    .from("profiles")
    .select("id, name, phone, document_number, birth_date, city, postal_code")
    .eq("verification_status", "pending");
  if (pendingError) console.error("admin/verificaciones profiles:", pendingError);

  const requests = pending || [];

  const docsByUser = {};
  if (requests.length > 0) {
    const { data: docs, error: docsError } = await supabase
      .from("kyc_documents")
      .select("user_id, front_photo_path, back_photo_path, created_at")
      .in(
        "user_id",
        requests.map((p) => p.id),
      )
      .order("created_at", { ascending: false });
    if (docsError) console.error("admin/verificaciones kyc_documents:", docsError);
    (docs || []).forEach((d) => {
      if (!docsByUser[d.user_id]) docsByUser[d.user_id] = d;
    });
  }

  const paths = Object.values(docsByUser).flatMap((d) => [d.front_photo_path, d.back_photo_path]);

  const urlByPath = {};
  if (paths.length > 0) {
    const { data: signed, error: signedError } = await supabase.storage
      .from("kyc-documents")
      .createSignedUrls(paths, 300);
    if (signedError) console.error("admin/verificaciones signed urls:", signedError);
    (signed || []).forEach((s) => {
      if (s.path && s.signedUrl) urlByPath[s.path] = s.signedUrl;
    });
  }

  return (
    <div>
      <h1 className="mb-1 font-serif text-2xl font-semibold text-ink">Verificaciones pendientes</h1>
      <p className="mb-6 text-sm text-muted">Revisá manualmente cada cédula antes de aprobar o rechazar.</p>

      {requests.length === 0 ? (
        <p className="py-10 text-center text-sm text-muted">No hay verificaciones pendientes por ahora.</p>
      ) : (
        <div className="space-y-4">
          {requests.map((p) => {
            const doc = docsByUser[p.id];
            return (
              <VerificationReviewCard
                key={p.id}
                profile={p}
                frontUrl={doc ? urlByPath[doc.front_photo_path] : null}
                backUrl={doc ? urlByPath[doc.back_photo_path] : null}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
