"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function VerificationReviewCard({ profile, frontUrl, backUrl }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState("");

  const approve = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({
          id_verified: true,
          id_verified_at: new Date().toISOString(),
          verification_status: "approved",
          rejection_reason: null,
        })
        .eq("id", profile.id);
      router.refresh();
    });
  };

  const reject = () => {
    if (!reason.trim()) return;
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("profiles")
        .update({ id_verified: false, verification_status: "rejected", rejection_reason: reason.trim() })
        .eq("id", profile.id);
      router.refresh();
    });
  };

  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <div className="mb-3 grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
        <div>
          <span className="text-xs font-bold text-muted">Nombre</span>
          <div className="text-ink">{profile.name}</div>
        </div>
        <div>
          <span className="text-xs font-bold text-muted">Documento</span>
          <div className="text-ink">{profile.document_number}</div>
        </div>
        <div>
          <span className="text-xs font-bold text-muted">Fecha de nacimiento</span>
          <div className="text-ink">{profile.birth_date}</div>
        </div>
        <div>
          <span className="text-xs font-bold text-muted">Ciudad / CP</span>
          <div className="text-ink">
            {profile.city} · {profile.postal_code}
          </div>
        </div>
        {profile.phone && (
          <div>
            <span className="text-xs font-bold text-muted">Teléfono</span>
            <div className="text-ink">{profile.phone}</div>
          </div>
        )}
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <div className="mb-1 text-xs font-bold text-muted">Frente</div>
          {frontUrl ? (
            <img src={frontUrl} alt="Frente del documento" className="h-40 w-full rounded-lg object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg bg-cream text-xs text-muted">
              Sin foto
            </div>
          )}
        </div>
        <div>
          <div className="mb-1 text-xs font-bold text-muted">Dorso</div>
          {backUrl ? (
            <img src={backUrl} alt="Dorso del documento" className="h-40 w-full rounded-lg object-cover" />
          ) : (
            <div className="flex h-40 items-center justify-center rounded-lg bg-cream text-xs text-muted">
              Sin foto
            </div>
          )}
        </div>
      </div>

      {rejecting ? (
        <div className="space-y-2">
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Motivo del rechazo (se lo mostramos a la persona)"
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={() => setRejecting(false)}
              className="flex-1 rounded-lg border border-line py-2 text-sm font-semibold text-ink hover:bg-cream"
            >
              Cancelar
            </button>
            <button
              onClick={reject}
              disabled={pending || !reason.trim()}
              className="flex-1 rounded-lg bg-coral py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-60"
            >
              {pending ? "..." : "Confirmar rechazo"}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            onClick={() => setRejecting(true)}
            disabled={pending}
            className="flex-1 rounded-lg border border-coral/40 py-2 text-sm font-semibold text-coral hover:bg-coral/10 disabled:opacity-60"
          >
            Rechazar
          </button>
          <button
            onClick={approve}
            disabled={pending}
            className="flex-1 rounded-lg bg-brand py-2 text-sm font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {pending ? "..." : "Aprobar"}
          </button>
        </div>
      )}
    </div>
  );
}
