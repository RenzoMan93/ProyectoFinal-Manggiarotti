"use client";

import Link from "next/link";
import { useState } from "react";

const ITEMS = [
  { href: "/mensajes", icon: "💬", label: "Mensajes", showBadge: true },
  { href: "/mis-productos", icon: "🏷️", label: "Mis publicaciones" },
  { href: "/pedidos", icon: "📦", label: "Pedidos" },
  { href: "/favoritos", icon: "❤️", label: "Favoritos" },
];

export default function MobileMenu({ unreadCount, profileName, verificationStatus, isAdmin }) {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const name = profileName || "Vos";

  const statusLabel =
    verificationStatus === "approved"
      ? "Cuenta verificada ✓"
      : verificationStatus === "pending"
        ? "Verificación pendiente ⏳"
        : "Verificar mi cuenta";

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
          <div className="absolute right-0 top-11 z-20 w-64 overflow-hidden rounded-2xl border border-line bg-paper shadow-lg">
            <Link
              href="/verificar"
              onClick={close}
              className="flex items-center gap-3 border-b border-line bg-brand-light px-4 py-3.5"
            >
              <span className="flex h-10 w-10 flex-none items-center justify-center rounded-full bg-brand text-base font-bold text-white">
                {name.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0">
                <div className="truncate text-sm font-bold text-ink">{name}</div>
                <div className="text-xs text-brand-dark">{statusLabel}</div>
              </span>
            </Link>

            <div className="px-2 pb-2 pt-1">
              <div className="px-2.5 pb-1 pt-2 text-[10px] font-bold uppercase tracking-wide text-muted">
                Mi cuenta
              </div>
              {ITEMS.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={close}
                  className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-ink hover:bg-brand-light"
                >
                  <span className="text-base leading-none">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  {item.showBadge && unreadCount > 0 && (
                    <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-bold text-white">
                      {unreadCount}
                    </span>
                  )}
                </Link>
              ))}
              {isAdmin && (
                <>
                  <div className="px-2.5 pb-1 pt-3 text-[10px] font-bold uppercase tracking-wide text-muted">
                    Administración
                  </div>
                  <Link
                    href="/admin"
                    onClick={close}
                    className="flex items-center gap-3 rounded-lg px-2.5 py-2.5 text-sm font-medium text-ochre hover:bg-brand-light"
                  >
                    <span className="text-base leading-none">🛠️</span>
                    <span>Panel admin</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
