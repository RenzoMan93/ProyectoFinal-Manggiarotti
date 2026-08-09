"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

// Componente invisible: suma una vista al producto cuando alguien entra a
// verlo, salvo que sea el propio vendedor mirando su publicación.
export default function ViewCounter({ productId, skip }) {
  useEffect(() => {
    if (skip) return;
    const supabase = createClient();
    supabase.rpc("increment_product_views", { p_product_id: productId });
  }, [productId, skip]);

  return null;
}
