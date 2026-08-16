"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ChatButton({ productId, sellerId, variant = "full" }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  const openChat = async () => {
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/ingresar");
      return;
    }

    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("product_id", productId)
      .eq("buyer_id", user.id)
      .maybeSingle();

    if (existing) {
      router.push(`/mensajes/${existing.id}`);
      return;
    }

    const { data: created, error } = await supabase
      .from("conversations")
      .insert({ product_id: productId, buyer_id: user.id, seller_id: sellerId })
      .select("id")
      .single();

    setBusy(false);
    if (error) {
      console.error(error);
      return;
    }
    router.push(`/mensajes/${created.id}`);
  };

  if (variant === "icon") {
    return (
      <button
        onClick={openChat}
        disabled={busy}
        aria-label="Chatear con el vendedor"
        className="flex h-[52px] w-[52px] flex-none items-center justify-center rounded-2xl border-2 border-brand bg-paper text-brand disabled:opacity-60"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
        </svg>
      </button>
    );
  }

  return (
    <button
      onClick={openChat}
      disabled={busy}
      className="block w-full rounded-lg border border-brand py-2.5 text-center text-sm font-semibold text-brand hover:bg-brand-light disabled:opacity-60"
    >
      Chatear con el vendedor
    </button>
  );
}
