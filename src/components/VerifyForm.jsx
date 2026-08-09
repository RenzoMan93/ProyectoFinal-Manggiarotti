"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { resizeImageToBlob } from "@/lib/image";

const STEP_LABELS = ["Datos", "Documento", "Listo"];

export default function VerifyForm({ initialName, initialData }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState({
    nombre: initialName || "",
    documento: initialData?.documento || "",
    fechaNacimiento: initialData?.fechaNacimiento || "",
    ciudad: initialData?.ciudad || "",
    codigoPostal: initialData?.codigoPostal || "",
  });
  const [frente, setFrente] = useState(null);
  const [dorso, setDorso] = useState(null);
  const [previewFrente, setPreviewFrente] = useState(null);
  const [previewDorso, setPreviewDorso] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setData((d) => ({ ...d, [field]: e.target.value }));

  const step1Valid = Object.values(data).every((v) => v.trim().length > 0);
  const step2Valid = Boolean(frente && dorso);

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

  const goNext = () => {
    if (step === 1 && !step1Valid) return;
    setError("");
    setStep((s) => s + 1);
  };
  const goBack = () => setStep((s) => Math.max(1, s - 1));

  const handleFinish = async () => {
    if (!step2Valid) return;
    setError("");
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
        .update({
          name: data.nombre.trim(),
          document_number: data.documento.trim(),
          birth_date: data.fechaNacimiento,
          city: data.ciudad.trim(),
          postal_code: data.codigoPostal.trim(),
          verification_status: "pending",
          rejection_reason: null,
        })
        .eq("id", user.id);
      if (e4) throw e4;

      setStep(3);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("No pudimos completar la verificación. Intentá de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center gap-1.5">
        {STEP_LABELS.map((label, i) => {
          const n = i + 1;
          const state = n < step ? "done" : n === step ? "active" : "";
          return (
            <div key={label} className="flex flex-1 items-center gap-1.5">
              <div className="flex flex-col items-center gap-1">
                <div
                  className={`flex h-6 w-6 items-center justify-center rounded-full border text-[11px] font-bold ${
                    state === "done"
                      ? "border-ok bg-ok text-white"
                      : state === "active"
                        ? "border-ochre bg-ochre text-brand-dark"
                        : "border-line bg-cream text-muted"
                  }`}
                >
                  {state === "done" ? "✓" : n}
                </div>
                <span className="text-[8.5px] font-semibold text-muted">{label}</span>
              </div>
              {n < 3 && <div className={`h-0.5 flex-1 ${n < step ? "bg-ok" : "bg-line"}`} />}
            </div>
          );
        })}
      </div>

      {step === 1 && (
        <div>
          <h2 className="mb-1 font-serif text-xl font-semibold text-ink">Tus datos</h2>
          <p className="mb-5 text-sm text-muted">
            Los necesitamos para verificar tu identidad como comprador y vendedor en ReUsalo.
          </p>
          <div className="space-y-3.5">
            <Field label="Nombre completo">
              <input value={data.nombre} onChange={update("nombre")} className={inputClass} />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Documento (cédula)">
                <input value={data.documento} onChange={update("documento")} className={inputClass} />
              </Field>
              <Field label="Fecha de nacimiento">
                <input type="date" value={data.fechaNacimiento} onChange={update("fechaNacimiento")} className={inputClass} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ciudad">
                <input
                  value={data.ciudad}
                  onChange={update("ciudad")}
                  placeholder="Ej: Punta del Este"
                  className={inputClass}
                />
              </Field>
              <Field label="Código postal">
                <input value={data.codigoPostal} onChange={update("codigoPostal")} className={inputClass} />
              </Field>
            </div>
          </div>
        </div>
      )}

      {step === 2 && (
        <div>
          <h2 className="mb-1 font-serif text-xl font-semibold text-ink">Foto de tu documento</h2>
          <p className="mb-5 text-sm text-muted">Subí una foto del frente y del dorso de tu cédula.</p>

          <DocCard label="Frente del documento" preview={previewFrente} onChange={handleFile("frente")} inputId="frente" />
          <DocCard label="Dorso del documento" preview={previewDorso} onChange={handleFile("dorso")} inputId="dorso" />

          <div className="mt-2 flex gap-2 rounded-xl border border-dashed border-ochre bg-[#EFE7D2] p-3 text-xs leading-relaxed text-[#5c5537]">
            <span>🔒</span>
            <span>Tu documento se guarda en un almacenamiento privado, separado del resto de tu perfil.</span>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col items-center pt-4 text-center">
          <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-ochre">
            <span className="text-2xl">⏳</span>
          </div>
          <h2 className="mb-2 font-serif text-xl font-semibold text-ink">¡Listo, lo enviamos!</h2>
          <p className="mb-4 text-sm text-muted">
            Un administrador va a revisar tu cédula y te va a llegar la insignia de verificado apenas quede
            aprobada. Mientras tanto ya podés usar ReUsalo con normalidad.
          </p>
          <button
            type="button"
            onClick={() => router.push("/")}
            className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark"
          >
            Ir a ReUsalo
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-coral">{error}</p>}

      {step < 3 && (
        <div className="mt-6 flex gap-2.5">
          {step > 1 && (
            <button
              type="button"
              onClick={goBack}
              className="flex-1 rounded-lg border border-line py-2.5 text-sm font-semibold text-ink hover:bg-cream"
            >
              Atrás
            </button>
          )}
          {step === 1 && (
            <button
              type="button"
              onClick={goNext}
              disabled={!step1Valid}
              className="flex-[2] rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
            >
              Continuar
            </button>
          )}
          {step === 2 && (
            <button
              type="button"
              onClick={handleFinish}
              disabled={!step2Valid || busy}
              className="flex-[2] rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
            >
              {busy ? "Enviando..." : "Finalizar"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

const inputClass = "w-full rounded-lg border border-line bg-paper px-3 py-2 text-sm focus:border-brand focus:outline-none";

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-bold text-ink">{label}</span>
      {children}
    </label>
  );
}

function DocCard({ label, preview, onChange, inputId }) {
  return (
    <div className="mb-3 flex items-center gap-3 rounded-2xl border border-dashed border-line bg-paper p-3.5">
      <div className="h-11 w-16 flex-none overflow-hidden rounded-lg bg-cream">
        {preview && <img src={preview} alt={label} className="h-full w-full object-cover" />}
      </div>
      <div className="flex-1">
        <div className="text-[13px] font-bold text-ink">{label}</div>
        <div className={`text-[11px] ${preview ? "font-semibold text-ok" : "text-muted"}`}>
          {preview ? "✓ Cargada" : "Sin cargar"}
        </div>
      </div>
      <label
        htmlFor={inputId}
        className="flex-none cursor-pointer rounded-lg bg-brand px-3 py-2 text-[11.5px] font-bold text-white"
      >
        {preview ? "Cambiar" : "Subir foto"}
      </label>
      <input id={inputId} type="file" accept="image/*" onChange={onChange} className="hidden" />
    </div>
  );
}
