import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import PublishForm from "@/components/PublishForm";

export default async function PublishPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/ingresar");

  return (
    <div className="mx-auto max-w-lg">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Publicar un artículo</h1>
      <PublishForm />
    </div>
  );
}
