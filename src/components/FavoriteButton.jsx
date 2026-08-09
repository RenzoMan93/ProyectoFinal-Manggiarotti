"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function FavoriteButton({ productId, initialFavorite, loggedIn, variant = "card" }) {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(initialFavorite);
  const [pending, startTransition] = useTransition();

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!loggedIn) {
      router.push("/ingresar");
      return;
    }

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      router.push("/ingresar");
      return;
    }

    const next = !isFavorite;
    setIsFavorite(next);

    startTransition(async () => {
      if (next) {
        await supabase.from("favorites").insert({ user_id: user.id, product_id: productId });
      } else {
        await supabase.from("favorites").delete().eq("user_id", user.id).eq("product_id", productId);
      }
      router.refresh();
    });
  };

  const size = variant === "detail" ? 34 : 30;

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-label={isFavorite ? "Quitar de favoritos" : "Agregar a favoritos"}
      className="flex items-center justify-center rounded-full border border-line bg-paper/90 shadow-sm disabled:opacity-60"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.5}
        height={size * 0.5}
        viewBox="0 0 24 24"
        fill={isFavorite ? "#C4593B" : "none"}
        stroke={isFavorite ? "#C4593B" : "#7A7568"}
        strokeWidth="2"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
