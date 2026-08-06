"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function OrderActions({ orderId, status, role }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const updateStatus = (next) => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase.from("orders").update({ status: next }).eq("id", orderId);
      router.refresh();
    });
  };

  const canMarkEnviado = role === "seller" && status === "coordinando";
  const canConfirmar = role === "buyer" && status === "enviado";
  const canReportar = status === "coordinando" || status === "enviado";

  if (!canMarkEnviado && !canConfirmar && !canReportar) return null;

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {canMarkEnviado && (
        <button
          onClick={() => updateStatus("enviado")}
          disabled={pending}
          className="rounded-lg border border-brand px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand-light disabled:opacity-60"
        >
          Marcar como enviado
        </button>
      )}
      {canConfirmar && (
        <button
          onClick={() => updateStatus("confirmado")}
          disabled={pending}
          className="rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          Confirmar recepción
        </button>
      )}
      {canReportar && (
        <button
          onClick={() => updateStatus("en_disputa")}
          disabled={pending}
          className="rounded-lg border border-red-300 px-2.5 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
        >
          Reportar problema
        </button>
      )}
    </div>
  );
}
