"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ChatButton({ productId, sellerId }) {
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
