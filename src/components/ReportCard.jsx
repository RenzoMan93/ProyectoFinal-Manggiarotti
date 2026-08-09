"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/format";

export default function ReportCard({ report }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const resolve = () => {
    startTransition(async () => {
      const supabase = createClient();
      await supabase
        .from("reports")
        .update({ resolved: true, resolved_at: new Date().toISOString() })
        .eq("id", report.id);
      router.refresh();
    });
  };

  const target =
    report.type === "product"
      ? report.reported_product && (
          <Link href={`/producto/${report.reported_product.id}`} className="font-semibold text-brand-dark hover:underline">
            {report.reported_product.title}
          </Link>
        )
      : report.reported_user?.name;

  return (
    <div className="rounded-2xl border border-line bg-paper p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-cream px-2 py-0.5 text-[10px] font-bold text-ink">
          {report.type === "product" ? "PUBLICACIÓN" : "USUARIO"}
        </span>
        <span className="text-xs text-muted">{timeAgo(report.created_at)}</span>
      </div>
      <div className="mb-1 text-sm text-ink">
        Reportado: <strong>{target || "(eliminado)"}</strong>
      </div>
      <div className="mb-1 text-sm text-ink">
        Motivo: <strong>{report.reason}</strong>
      </div>
      {report.comment && <p className="mb-2 text-sm text-muted">&ldquo;{report.comment}&rdquo;</p>}
      <div className="mb-3 text-xs text-muted">Reportado por {report.reporter?.name || "Usuario"}</div>
      <button
        onClick={resolve}
        disabled={pending}
        className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink hover:bg-cream disabled:opacity-60"
      >
        {pending ? "..." : "Marcar resuelto"}
      </button>
    </div>
  );
}
