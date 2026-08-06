"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function ReviewForm({ orderId, sellerId, buyerId }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    const supabase = createClient();
    const { error } = await supabase.from("reviews").insert({
      order_id: orderId,
      seller_id: sellerId,
      buyer_id: buyerId,
      rating,
      comment: comment.trim() || null,
    });
    setBusy(false);
    if (error) {
      console.error(error);
      return;
    }
    router.refresh();
  };

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="mt-2 rounded-lg border border-brand px-2.5 py-1 text-xs font-semibold text-brand hover:bg-brand-light"
      >
        Calificar al vendedor
      </button>
    );
  }

  return (
    <div className="mt-2 rounded-lg border border-gray-200 p-3">
      <div className="mb-2 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)} aria-label={`Calificar con ${n} estrellas`}>
            <span className={n <= rating ? "text-amber-400" : "text-gray-300"} style={{ fontSize: 20 }}>
              ★
            </span>
          </button>
        ))}
      </div>
      <textarea
        rows={2}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Comentario (opcional)"
        className="mb-2 w-full rounded-lg border border-gray-300 px-2.5 py-1.5 text-xs focus:border-brand focus:outline-none"
      />
      <button
        onClick={submit}
        disabled={busy}
        className="rounded-lg bg-brand px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? "Enviando..." : "Enviar calificación"}
      </button>
    </div>
  );
}
