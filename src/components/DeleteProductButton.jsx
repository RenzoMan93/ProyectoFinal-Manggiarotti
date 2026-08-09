"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function DeleteProductButton({ productId }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("products").delete().eq("id", productId);
      router.push("/");
      router.refresh();
    });
  };

  if (confirming) {
    return (
      <div className="flex gap-2">
        <button
          onClick={handleDelete}
          disabled={pending}
          className="flex-1 rounded-lg bg-coral py-2.5 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "Borrando..." : "Sí, borrar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-lg border border-line py-2.5 text-sm font-semibold text-ink hover:bg-cream"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="w-full rounded-lg border border-coral/30 py-2.5 text-sm font-semibold text-coral hover:bg-coral/10"
    >
      Borrar publicación
    </button>
  );
}
