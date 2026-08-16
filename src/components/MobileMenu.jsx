"use client";

import Link from "next/link";
import { useState } from "react";

export default function MobileMenu({ unreadCount, profileName, verificationStatus, isAdmin }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <div className="relative sm:hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Abrir menú"
        className="relative flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-brand-light"
      >
        <span className="text-xl leading-none">☰</span>
        {unreadCount > 0 && (
          <span className="absolute right-0 top-0 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-coral text-[9px] font-bold text-white">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={close} />
          <div className="absolute right-0 top-11 z-20 w-56 rounded-2xl border border-line bg-paper p-2 shadow-lg">
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
            <div className="my-1 border-t border-line" />
            <Link
              href="/verificar"
              onClick={close}
              className="block rounded-lg px-3 py-2.5 text-sm text-muted hover:bg-brand-light"
            >
              Hola, {profileName || "vos"}
              {verificationStatus === "approved" && " ✓"}
              {verificationStatus === "pending" && " ⏳"}
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
