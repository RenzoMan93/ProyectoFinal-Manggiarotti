"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function HideConversationButton({ conversationId, isBuyer, redirectTo, compact = true }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleHide = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirming) {
      setConfirming(true);
      return;
    }
    startTransition(async () => {
      const supabase = createClient();
      const field = isBuyer ? "deleted_by_buyer" : "deleted_by_seller";
      await supabase.from("conversations").update({ [field]: true }).eq("id", conversationId);
      if (redirectTo) router.push(redirectTo);
      else router.refresh();
    });
  };

  const handleCancel = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setConfirming(false);
  };

  if (confirming) {
    return (
      <div className="flex flex-shrink-0 gap-1.5">
        <button
          onClick={handleHide}
          disabled={pending}
          className="rounded-lg bg-coral px-2 py-1 text-[11px] font-semibold text-white hover:opacity-90 disabled:opacity-60"
        >
          {pending ? "..." : "Ocultar"}
        </button>
        <button
          onClick={handleCancel}
          className="rounded-lg border border-line px-2 py-1 text-[11px] font-semibold text-ink hover:bg-cream"
        >
          Cancelar
        </button>
      </div>
    );
  }

  if (compact) {
    return (
      <button
        onClick={handleHide}
        aria-label="Ocultar conversación"
        className="flex-shrink-0 rounded-lg p-1.5 text-muted hover:bg-cream hover:text-coral"
      >
        🗑
      </button>
    );
  }

  return (
    <button onClick={handleHide} className="flex items-center gap-1 text-xs text-muted hover:text-coral">
      🗑 Ocultar conversación
    </button>
  );
}
