import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import VerifyForm from "@/components/VerifyForm";

export default async function VerifyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const { data: profile } = await supabase.from("profiles").select("name, id_verified").eq("id", user.id).single();

  if (profile?.id_verified) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 font-serif text-2xl font-semibold text-ink">Verificar identidad</h1>
        <p className="rounded-lg bg-brand-light px-4 py-3 text-sm text-brand-dark">
          Tu cuenta ya está verificada. ✓
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <VerifyForm initialName={profile?.name || ""} />
    </div>
  );
}
