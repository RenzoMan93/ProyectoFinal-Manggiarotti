import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VerifyForm from "@/components/VerifyForm";

export default async function VerifyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, document_number, birth_date, city, postal_code, verification_status, rejection_reason")
    .eq("id", user.id)
    .single();

  if (profile?.verification_status === "approved") {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 font-serif text-2xl font-semibold text-ink">Verificar identidad</h1>
        <p className="rounded-lg bg-brand-light px-4 py-3 text-sm text-brand-dark">
          Tu cuenta ya está verificada. ✓
        </p>
      </div>
    );
  }

  if (profile?.verification_status === "pending") {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 font-serif text-2xl font-semibold text-ink">Verificar identidad</h1>
        <p className="mb-4 rounded-lg bg-[#FBF3DF] px-4 py-3 text-sm text-[#7a5c0c]">
          ⏳ Recibimos tus datos y tu documento. Un administrador los está revisando — te va a aparecer la
          insignia de verificado apenas quede aprobado. Mientras tanto ya podés usar ReUsalo con normalidad.
        </p>
        <Link
          href="/"
          className="inline-block rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Ir a ReUsalo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      {profile?.verification_status === "rejected" && (
        <p className="mb-4 rounded-lg bg-[#FBEAE5] px-4 py-3 text-sm text-coral">
          No pudimos validar tu documento{profile?.rejection_reason ? `: ${profile.rejection_reason}` : "."} Por
          favor, revisá los datos y volvé a subir las fotos de tu cédula.
        </p>
      )}
      <VerifyForm
        initialName={profile?.name || ""}
        initialData={{
          documento: profile?.document_number || "",
          fechaNacimiento: profile?.birth_date || "",
          ciudad: profile?.city || "",
          codigoPostal: profile?.postal_code || "",
        }}
      />
    </div>
  );
}
