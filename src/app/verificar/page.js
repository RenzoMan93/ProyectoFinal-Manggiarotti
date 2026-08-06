import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VerifyForm from "@/components/VerifyForm";

export default async function VerifyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: profile } = await supabase.from("profiles").select("id_verified").eq("id", user.id).single();

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Verificar identidad</h1>
      {profile?.id_verified ? (
        <p className="rounded-lg bg-brand-light px-4 py-3 text-sm text-brand-dark">
          Tu cuenta ya está verificada. ✓
        </p>
      ) : (
        <>
          <p className="mb-6 text-sm text-gray-500">
            Subí una foto del frente y del dorso de tu cédula. Esta versión no hace una validación
            automática: al subir ambas fotos tu cuenta queda marcada como verificada.
          </p>
          <VerifyForm />
        </>
      )}
    </div>
  );
}
