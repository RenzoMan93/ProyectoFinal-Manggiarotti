"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileMenu({ unreadCount, profileName, verificationStatus, isAdmin }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const name = profileName || "Vos";

  return (
    <div className="relative sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir menú de cuenta"
        className="relative flex items-center gap-1.5 rounded-full border border-line bg-cream py-1 pl-1 pr-2.5"
      >
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-[11px] font-bold text-white">
          {name.charAt(0).toUpperCase()}
        </span>
        <span className="max-w-[84px] truncate text-[13px] font-semibold text-ink">{name}</span>
        <span className={`text-[9px] text-muted transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
        {unreadCount > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div className="absolute right-0 top-11 z-20 w-60 overflow-hidden rounded-2xl border border-line bg-paper shadow-lg">
            <Link
              href="/verificar"
              onClick={close}
              className="block border-b border-line bg-cream px-4 py-3 text-sm font-semibold text-ink"
            >
              Hola, {name}
              {verificationStatus === "approved" && " ✓ Verificado"}
              {verificationStatus === "pending" && " ⏳ Verificación pendiente"}
              {(!verificationStatus || verificationStatus === "none" || verificationStatus === "rejected") &&
                " · Verificar cuenta"}
            </Link>
            <div className="p-2">
              <Link
                href="/mensajes"
                onClick={close}
                className="flex items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-brand-light"
              >
                Mensajes
                {unreadCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-white">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/mis-productos"
                onClick={close}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-brand-light"
              >
                Mis publicaciones
              </Link>
              <Link
                href="/pedidos"
                onClick={close}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-brand-light"
              >
                Pedidos
              </Link>
              <Link
                href="/favoritos"
                onClick={close}
                className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ink hover:bg-brand-light"
              >
                Favoritos
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={close}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-ochre hover:bg-brand-light"
                >
                  Panel admin
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
