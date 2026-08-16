"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const METHODS = [
  {
    id: "efectivo",
    label: "Efectivo",
    desc: "Coordinás con el vendedor y pagás al recibir el artículo en persona.",
    note: "Sin protección automática — te recomendamos encontrarte en un lugar público y revisar el artículo antes de pagar.",
  },
  {
    id: "transferencia",
    label: "Transferencia",
    desc: "Coordinás la entrega y transferís por tu banco o app financiera.",
    note: "Pedile los datos bancarios al vendedor por el chat antes de transferir, y confirmá la entrega antes de dar la compra por cerrada.",
  },
];

export default function CheckoutForm({ product, seller }) {
  const [method, setMethod] = useState(null);
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const handleConfirm = async () => {
    if (!method) {
      setError("Elegí un método de coordinación.");
      return;
    }
    setError("");
    setBusy(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from("orders").insert({
      product_id: product.id,
      buyer_id: user.id,
      seller_id: product.seller_id,
      amount: product.price,
      method,
      note: note.trim() || null,
    });

    setBusy(false);
    if (insertError) {
      console.error(insertError);
      setError("No pudimos registrar la compra. Intentá de nuevo.");
      return;
    }
    setDone(true);
  };

  if (done) {
    return (
      <div className="rounded-2xl border border-line bg-paper p-5 text-center">
        <p className="mb-4 text-[15px] font-semibold text-ink">¡Compra registrada!</p>
        <p className="mb-4 text-sm text-muted">
          Coordiná la entrega directo con {seller?.name || "el vendedor"} por el chat de ReUsalo.
        </p>
        <Link
          href="/mensajes"
          className="mb-2 block w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
        >
          Ir al chat
        </Link>
        <Link href="/pedidos" className="mt-2 block text-sm font-medium text-brand hover:underline">
          Ver mis compras
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4 space-y-2">
        {METHODS.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => setMethod(m.id)}
            className={`w-full rounded-xl border p-3.5 text-left ${
              method === m.id ? "border-brand bg-brand-light" : "border-line bg-paper"
            }`}
          >
            <div className="text-sm font-semibold text-ink">{m.label}</div>
            <div className="mt-0.5 text-xs text-muted">{m.desc}</div>
          </button>
        ))}
      </div>

      {method && (
        <p className="mb-4 rounded-lg border border-dashed border-ochre bg-[#EFE7D2] px-3 py-2.5 text-xs text-[#5c5537]">
          {METHODS.find((m) => m.id === method).note}
        </p>
      )}

      <label className="mb-4 block">
        <span className="mb-1 block text-sm font-medium text-ink">Nota para el vendedor (opcional)</span>
        <textarea
          rows={2}
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Ej: puedo pasar a buscarlo el sábado"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
        />
      </label>

      {error && <p className="mb-3 text-sm text-coral">{error}</p>}

      <button
        onClick={handleConfirm}
        disabled={busy}
        className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? "Confirmando..." : "Confirmar compra"}
      </button>
    </div>
  );
}
