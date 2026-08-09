"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const OPTIONS = [
  { value: "disponible", label: "Disponible" },
  { value: "pausado", label: "Ocultar" },
  { value: "vendido", label: "Vendido" },
];

export default function ProductStatusToggle({ productId, status }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const setStatus = (value) => {
    if (value === status || pending) return;
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("products").update({ status: value }).eq("id", productId);
      router.refresh();
    });
  };

  return (
    <div className="flex gap-1.5">
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setStatus(opt.value)}
          disabled={pending}
          className={`flex-1 rounded-lg border py-2 text-xs font-semibold disabled:opacity-60 ${
            status === opt.value
              ? "border-brand bg-brand-light text-brand-dark"
              : "border-line text-ink hover:bg-cream"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
