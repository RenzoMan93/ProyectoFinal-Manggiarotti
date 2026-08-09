"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CATEGORIES, CONDITIONS, DEPARTAMENTOS } from "@/lib/constants";
import { resizeImageToBlob } from "@/lib/image";

const MAX_PHOTOS = 5;

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
  const [photos, setPhotos] = useState([]); // [{ file, preview }]
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const update = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const handlePhotos = (e) => {
    const files = Array.from(e.target.files || []).slice(0, MAX_PHOTOS - photos.length);
    if (files.length === 0) return;
    const next = files.map((file) => ({ file, preview: URL.createObjectURL(file) }));
    setPhotos((p) => [...p, ...next].slice(0, MAX_PHOTOS));
    e.target.value = "";
  };

  const removePhoto = (index) => {
    setPhotos((p) => p.filter((_, i) => i !== index));
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
    if (photos.length === 0) {
      setError("Subí al menos una foto del artículo.");
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
      const photoUrls = [];
      for (let i = 0; i < photos.length; i++) {
        const blob = await resizeImageToBlob(photos[i].file);
        const path = `${user.id}/${Date.now()}-${i}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("product-photos")
          .upload(path, blob, { contentType: "image/jpeg" });
        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("product-photos").getPublicUrl(path);
        photoUrls.push(publicUrl);
      }

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
          photo_urls: photoUrls,
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
        <span className="mb-1 block text-sm font-medium text-ink">
          Fotos del artículo <span className="text-coral">*</span>
        </span>
        <div className="grid grid-cols-3 gap-2">
          {photos.map((p, i) => (
            <div key={p.preview} className="relative aspect-square overflow-hidden rounded-xl border border-line">
              <img src={p.preview} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                aria-label="Quitar foto"
                className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-ink/60 text-white"
              >
                ✕
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label
              htmlFor="fotos"
              className="flex aspect-square cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line bg-cream text-brand"
            >
              <span className="text-xl leading-none">+</span>
              <span className="text-[11px] font-semibold">Agregar foto</span>
            </label>
          )}
        </div>
        <input id="fotos" type="file" accept="image/*" multiple onChange={handlePhotos} className="hidden" />
        <p className="mt-2 text-xs text-muted">Hasta {MAX_PHOTOS} fotos. La primera va a ser la foto de portada.</p>
      </div>

      <Field label="Título">
        <input
          required
          maxLength={80}
          value={form.title}
          onChange={update("title")}
          placeholder="Ej: Bicicleta rodado 26"
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 focus:border-brand focus:outline-none"
        />
      </Field>

      <Field label="Descripción">
        <textarea
          required
          rows={3}
          value={form.description}
          onChange={update("description")}
          placeholder="Contá el estado, detalles, motivo de venta..."
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 focus:border-brand focus:outline-none"
        />
      </Field>

      <Field label="Color (opcional)">
        <input
          maxLength={30}
          value={form.color}
          onChange={update("color")}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 focus:border-brand focus:outline-none"
        />
      </Field>

      <Field label="Precio (UYU)">
        <input
          required
          type="number"
          min="0"
          value={form.price}
          onChange={update("price")}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 focus:border-brand focus:outline-none"
        />
      </Field>

      <Field label="Categoría">
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <PillOption
              key={c.id}
              label={c.label}
              selected={form.category === c.id}
              onClick={() => setForm((f) => ({ ...f, category: c.id }))}
            />
          ))}
        </div>
      </Field>

      <Field label="Estado">
        <div className="flex flex-wrap gap-2">
          {CONDITIONS.map((c) => (
            <PillOption
              key={c}
              label={c}
              selected={form.condition === c}
              onClick={() => setForm((f) => ({ ...f, condition: c }))}
            />
          ))}
        </div>
      </Field>

      <Field label="Ubicación">
        <select
          value={form.location}
          onChange={update("location")}
          className="w-full rounded-lg border border-line bg-paper px-3 py-2 focus:border-brand focus:outline-none"
        >
          {DEPARTAMENTOS.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
      </Field>

      {error && <p className="text-sm text-coral">{error}</p>}

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
      <span className="mb-1 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  );
}

function PillOption({ label, selected, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3.5 py-2 text-[13px] font-medium ${
        selected ? "border-brand bg-brand text-white" : "border-line bg-cream text-ink"
      }`}
    >
      {label}
    </button>
  );
}
