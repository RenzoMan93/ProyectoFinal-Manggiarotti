"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToBlob } from "@/lib/image";

export default function VerifyForm() {
  const router = useRouter();
  const [frente, setFrente] = useState(null);
  const [dorso, setDorso] = useState(null);
  const [previewFrente, setPreviewFrente] = useState(null);
  const [previewDorso, setPreviewDorso] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const handleFile = (side) => (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (side === "frente") {
      setFrente(file);
      setPreviewFrente(url);
    } else {
      setDorso(file);
      setPreviewDorso(url);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!frente || !dorso) {
      setError("Subí las dos fotos (frente y dorso).");
      return;
    }

    setBusy(true);
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    try {
      const frenteBlob = await resizeImageToBlob(frente, 1400, 0.85);
      const dorsoBlob = await resizeImageToBlob(dorso, 1400, 0.85);

      const frontPath = `${user.id}/frente-${Date.now()}.jpg`;
      const backPath = `${user.id}/dorso-${Date.now()}.jpg`;

      const { error: e1 } = await supabase.storage
        .from("kyc-documents")
        .upload(frontPath, frenteBlob, { contentType: "image/jpeg" });
      if (e1) throw e1;

      const { error: e2 } = await supabase.storage
        .from("kyc-documents")
        .upload(backPath, dorsoBlob, { contentType: "image/jpeg" });
      if (e2) throw e2;

      const { error: e3 } = await supabase.from("kyc_documents").insert({
        user_id: user.id,
        front_photo_path: frontPath,
        back_photo_path: backPath,
      });
      if (e3) throw e3;

      const { error: e4 } = await supabase
        .from("profiles")
        .update({ id_verified: true, id_verified_at: new Date().toISOString() })
        .eq("id", user.id);
      if (e4) throw e4;

      router.push("/");
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("No pudimos completar la verificación. Intentá de nuevo.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PhotoField label="Frente de la cédula" preview={previewFrente} onChange={handleFile("frente")} inputId="frente" />
      <PhotoField label="Dorso de la cédula" preview={previewDorso} onChange={handleFile("dorso")} inputId="dorso" />

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? "Subiendo..." : "Verificar mi identidad"}
      </button>
    </form>
  );
}

function PhotoField({ label, preview, onChange, inputId }) {
  return (
    <div>
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      <label
        htmlFor={inputId}
        className="flex h-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500"
      >
        {preview ? (
          <img src={preview} alt={label} className="h-full w-full rounded-xl object-cover" />
        ) : (
          <span className="text-sm font-semibold">Subir foto</span>
        )}
      </label>
      <input id={inputId} type="file" accept="image/*" onChange={onChange} className="hidden" />
    </div>
  );
}
