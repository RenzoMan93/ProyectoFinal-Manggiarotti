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
          className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60"
        >
          {pending ? "Borrando..." : "Sí, borrar"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="flex-1 rounded-lg border border-gray-300 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50"
        >
          Cancelar
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleDelete}
      className="w-full rounded-lg border border-red-200 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-50"
    >
      Borrar publicación
    </button>
  );
}
