"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const REASONS = ["Estafa o fraude", "Producto prohibido o ilegal", "Contenido inapropiado", "Trato irrespetuoso", "Otro"];

export default function ReportModal({ type, targetId, onClose }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [comment, setComment] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    await supabase.from("reports").insert({
      type,
      reported_product_id: type === "product" ? targetId : null,
      reported_user_id: type === "user" ? targetId : null,
      reporter_id: user.id,
      reason,
      comment: comment.trim() || null,
    });

    setBusy(false);
    setDone(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center" onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-sm rounded-t-2xl bg-white p-5 sm:rounded-2xl"
      >
        {done ? (
          <>
            <p className="mb-4 text-sm font-semibold text-gray-900">Gracias, vamos a revisar tu reporte.</p>
            <button
              onClick={onClose}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
            >
              Cerrar
            </button>
          </>
        ) : (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900">
                {type === "product" ? "Reportar publicación" : "Reportar usuario"}
              </h3>
              <button onClick={onClose} aria-label="Cerrar" className="text-gray-500">
                ✕
              </button>
            </div>

            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Motivo</span>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </label>

            <label className="mb-4 block">
              <span className="mb-1 block text-sm font-medium text-gray-700">Contanos qué pasó (opcional)</span>
              <textarea
                rows={3}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand focus:outline-none"
              />
            </label>

            <button
              onClick={submit}
              disabled={busy}
              className="w-full rounded-lg bg-red-50 py-2.5 text-sm font-semibold text-red-700 hover:bg-red-100 disabled:opacity-60"
            >
              {busy ? "Enviando..." : "Enviar reporte"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
