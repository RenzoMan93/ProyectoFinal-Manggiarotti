"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ProductStatusToggle({ productId, status }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isSold = status === "vendido";

  const toggle = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("products")
        .update({ status: isSold ? "disponible" : "vendido" })
        .eq("id", productId);
      router.refresh();
    });
  };

  return (
    <button
      onClick={toggle}
      disabled={pending}
      className="w-full rounded-lg border border-line py-2.5 text-sm font-semibold text-ink hover:bg-cream disabled:opacity-60"
    >
      {isSold ? "Reactivar publicación" : "Marcar como vendido"}
    </button>
  );
}
