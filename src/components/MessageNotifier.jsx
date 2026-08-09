"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

// Componente invisible: refresca el layout (badge de "Mensajes" en el
// header, lista de conversaciones) cuando llega un mensaje nuevo en
// cualquier conversación del usuario, sin que tenga que recargar la página.
export default function MessageNotifier() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();
    let channel;
    let cancelled = false;

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (cancelled || !user) return;
      channel = supabase
        .channel("inbox-messages")
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, () => {
          router.refresh();
        })
        .subscribe();
    });

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [router]);

  return null;
}
