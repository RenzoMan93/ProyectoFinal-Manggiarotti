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

  const { data: pending } = await supabase
    .from("profiles")
    .select(
      "id, name, phone, document_number, birth_date, city, postal_code, kyc_documents(front_photo_path, back_photo_path, created_at)",
    )
    .eq("verification_status", "pending")
    .order("created_at", { foreignTable: "kyc_documents", ascending: false })
    .limit(1, { foreignTable: "kyc_documents" });

  const requests = pending || [];

  const paths = requests.flatMap((p) => {
    const doc = p.kyc_documents?.[0];
    return doc ? [doc.front_photo_path, doc.back_photo_path] : [];
  });

  const urlByPath = {};
  if (paths.length > 0) {
    const { data: signed } = await supabase.storage.from("kyc-documents").createSignedUrls(paths, 300);
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
            const doc = p.kyc_documents?.[0];
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
