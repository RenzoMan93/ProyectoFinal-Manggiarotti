"use client";

import { useState } from "react";

export default function ShareButton({ title }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title, url: window.location.href });
      } catch {
        // el usuario canceló el share nativo, no hacemos nada
      }
    } else {
      setOpen((o) => !o);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Este bloque solo se renderiza después de que el usuario interactúa
  // (open pasa a true desde un click), así que acceder a window acá nunca
  // corre durante el render del servidor.
  const shareText = open ? encodeURIComponent(`Mirá esto en ReUsalo: ${title}`) : "";
  const shareUrl = open ? encodeURIComponent(window.location.href) : "";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={nativeShare}
        className="flex w-full items-center justify-center gap-2 rounded-lg border border-line py-2.5 text-sm font-semibold text-ink hover:bg-cream"
      >
        📤 Compartir
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 top-full z-20 mt-2 rounded-2xl border border-line bg-paper p-2 shadow-lg">
            <a
              href={`https://wa.me/?text=${shareText}%20${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"
            >
              WhatsApp
            </a>
            <a
              href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"
            >
              Facebook
            </a>
            <a
              href={`https://twitter.com/intent/tweet?text=${shareText}&url=${shareUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-cream"
            >
              X (Twitter)
            </a>
            <button
              type="button"
              onClick={copyLink}
              className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-ink hover:bg-cream"
            >
              {copied ? "¡Copiado!" : "Copiar link"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}
