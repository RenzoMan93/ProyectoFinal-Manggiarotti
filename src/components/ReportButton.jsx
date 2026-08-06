"use client";

import { useState } from "react";
import ReportModal from "@/components/ReportModal";

export default function ReportButton({ type, targetId, label }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600"
      >
        🚩 {label}
      </button>
      {open && <ReportModal type={type} targetId={targetId} onClose={() => setOpen(false)} />}
    </>
  );
}
