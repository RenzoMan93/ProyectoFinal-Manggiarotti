"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CONDITIONS, DEPARTAMENTOS } from "@/lib/constants";
import { resizeImageToBlob } from "@/lib/image";

const emptyForm = {
  title: "",
  description: "",
  color: "",
  price: "",
  category: CATEGORIES[0].id,
  condition: CONDITIONS[0],
  location: DEPARTAMENTOS[0],
};

export default function PublishForm() {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [photoFile, setPhotoFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePhoto = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.title.trim() || !form.description.trim() || !form.price) {
      setError("Completá título, descripción y precio.");
      return;
    }
    if (Number(form.price) <= 0 || Number.isNaN(Number(form.price))) {
      setError("Ingresá un precio válido.");
      return;
    }
    if (!photoFile) {
      setError("Subí una foto del artículo.");
      return;
    }

    setBusy(true);
    const supabase = createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/ingresar");
      return;
    }

    try {
      const blob = await resizeImageToBlob(photoFile);
      const path = `${user.id}/${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("product-photos")
        .upload(path, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;

      const {
        data: { publicUrl },
      } = supabase.storage.from("product-photos").getPublicUrl(path);

      const { data: inserted, error: insertError } = await supabase
        .from("products")
        .insert({
          seller_id: user.id,
          title: form.title.trim(),
          description: form.description.trim(),
          color: form.color.trim() || null,
          price: Number(form.price),
          category: form.category,
          condition: form.condition,
          location: form.location,
          photo_url: publicUrl,
        })
        .select("id")
        .single();
      if (insertError) throw insertError;

      router.push(`/producto/${inserted.id}`);
      router.refresh();
    } catch (err) {
      console.error(err);
      setError("No pudimos publicar tu artículo. Intentá de nuevo.");
      setBusy(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <span className="mb-1 block text-sm font-medium text-gray-700">Foto del artículo</span>
        <label
          htmlFor="foto"
          className="flex h-36 cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50 text-gray-500"
        >
          {preview ? (
            <img src={preview} alt="Vista previa" className="h-full w-full rounded-xl object-cover" />
          ) : (
            <>
              <span className="text-sm font-semibold">Subir foto</span>
              <span className="text-xs text-gray-400">JPG o PNG</span>
            </>
          )}
        </label>
        <input id="foto" type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
      </div>

      <Field label="Título">
        <input
          required
          maxLength={80}
          value={form.title}
          onChange={update("title")}
          placeholder="Ej: Bicicleta rodado 26"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
        />
      </Field>

      <Field label="Descripción">
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={update("description")}
          placeholder="Contá el estado, detalles, motivo de venta..."
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
        />
      </Field>

      <Field label="Color (opcional)">
        <input
          maxLength={30}
          value={form.color}
          onChange={update("color")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
        />
      </Field>

      <Field label="Precio (UYU)">
        <input
          required
          type="number"
          min="0"
          value={form.price}
          onChange={update("price")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
        />
      </Field>

      <Field label="Categoría">
        <select
          value={form.category}
          onChange={update("category")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
        >
          {CATEGORIES.map((c) => (
            <option key={c.id} value={c.id}>
              {c.label}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Estado">
        <select
          value={form.condition}
          onChange={update("condition")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
        >
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </Field>

      <Field label="Ubicación">
        <select
          value={form.location}
          onChange={update("location")}
          className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand focus:outline-none"
        >
          {DEPARTAMENTOS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-lg bg-brand py-2.5 font-semibold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {busy ? "Publicando..." : "Publicar"}
      </button>
    </form>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">{label}</span>
      {children}
    </label>
  );
}
