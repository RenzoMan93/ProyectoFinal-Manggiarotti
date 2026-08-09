"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", phone: "", email: "", password: "", acceptedTerms: false });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");
  const [code, setCode] = useState("");
  const [resendMsg, setResendMsg] = useState("");

  const update = (field) => (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setForm((f) => ({ ...f, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const phoneDigits = form.phone.replace(/\D/g, "");
    if (!form.name.trim()) return setError("Ingresá tu nombre.");
    if (phoneDigits.length < 8) return setError("Ingresá un teléfono válido (con WhatsApp).");
    if (form.password.length < 6) return setError("La contraseña debe tener al menos 6 caracteres.");
    if (!form.acceptedTerms) return setError("Tenés que aceptar los Términos y Condiciones para crear tu cuenta.");

    setBusy(true);
    const supabase = createClient();
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: { data: { name: form.name.trim(), phone: phoneDigits } },
    });
    setBusy(false);

    if (signUpError) {
      if (signUpError.message?.includes("profiles_phone_key")) {
        setError("Ya existe una cuenta con ese teléfono.");
      } else if (signUpError.message?.toLowerCase().includes("already registered")) {
        setError("Ya existe una cuenta con ese email. Iniciá sesión.");
      } else {
        setError(signUpError.message || "No pudimos crear tu cuenta.");
      }
      return;
    }

    if (data.session) {
      router.push("/");
      router.refresh();
      return;
    }

    setPendingEmail(form.email.trim());
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    if (!code.trim()) return setError("Ingresá el código que te llegó por email.");

    setBusy(true);
    const supabase = createClient();
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email: pendingEmail,
      token: code.trim(),
      type: "signup",
    });
    setBusy(false);

    if (verifyError) {
      setError("Código incorrecto o vencido. Probá de nuevo o reenvialo.");
      return;
    }

    router.push("/");
    router.refresh();
  };

  const handleResend = async () => {
    setResendMsg("");
    const supabase = createClient();
    const { error: resendError } = await supabase.auth.resend({ type: "signup", email: pendingEmail });
    setResendMsg(resendError ? "No pudimos reenviar el código." : "Te reenviamos el código.");
  };

  if (pendingEmail) {
    return (
      <div className="mx-auto max-w-md">
        <h1 className="mb-2 font-serif text-2xl font-semibold text-ink">Confirmá tu email</h1>
        <p className="mb-6 text-sm text-muted">
          Te mandamos un código de 6 dígitos a <strong>{pendingEmail}</strong>. Ingresalo acá abajo.
        </p>
        <form onSubmit={handleVerify} className="space-y-4">
          <input
            required
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="000000"
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 text-center text-lg tracking-[0.3em] focus:border-brand focus:outline-none"
          />
          {error && <p className="text-sm text-coral">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
          >
            {busy ? "Confirmando..." : "Confirmar código"}
          </button>
        </form>
        <button onClick={handleResend} className="mt-4 text-sm font-medium text-brand hover:underline">
          Reenviar código
        </button>
        {resendMsg && <p className="mt-2 text-xs text-muted">{resendMsg}</p>}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md">
      <h1 className="mb-6 font-serif text-2xl font-semibold text-ink">Creá tu cuenta</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Nombre">
          <input
            required
            value={form.name}
            onChange={update("name")}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 focus:border-brand focus:outline-none"
          />
        </Field>
        <Field label="Teléfono (con WhatsApp)">
          <input
            required
            type="tel"
            value={form.phone}
            onChange={update("phone")}
            placeholder="09X XXX XXX"
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 focus:border-brand focus:outline-none"
          />
        </Field>
        <Field label="Email">
          <input
            required
            type="email"
            value={form.email}
            onChange={update("email")}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 focus:border-brand focus:outline-none"
          />
        </Field>
        <Field label="Contraseña">
          <input
            required
            type="password"
            minLength={6}
            value={form.password}
            onChange={update("password")}
            className="w-full rounded-lg border border-line bg-paper px-3 py-2 focus:border-brand focus:outline-none"
          />
        </Field>

        <label className="flex items-start gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={form.acceptedTerms}
            onChange={update("acceptedTerms")}
            className="mt-0.5"
          />
          <span>
            Acepto los{" "}
            <Link href="/terminos" target="_blank" className="font-medium text-brand hover:underline">
              Términos y Condiciones
            </Link>
            .
          </span>
        </label>

        {error && <p className="text-sm text-coral">{error}</p>}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
        >
          {busy ? "Creando cuenta..." : "Crear cuenta"}
        </button>
      </form>

      <p className="mt-4 text-sm text-muted">
        ¿Ya tenés cuenta?{" "}
        <Link href="/ingresar" className="font-medium text-brand hover:underline">
          Ingresá
        </Link>
      </p>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}
