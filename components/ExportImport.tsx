"use client";

import { useRef } from "react";
import { useCertProgress } from "@/hooks/useCertProgress";

export default function ExportImport() {
  const { exportData, importData } = useCertProgress();
  const fileRef = useRef<HTMLInputElement>(null);

  function handleExport() {
    const blob = new Blob([exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cert-tracker-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = ev.target?.result as string;
      const ok = importData(text);
      if (!ok) alert("Invalid backup file — import failed.");
      e.target.value = "";
    };
    reader.readAsText(file);
  }

  return (
    <div className="flex gap-2">
      <button onClick={handleExport} className="btn !text-[10px] !py-1">
        ⭳ Export
      </button>
      <button onClick={() => fileRef.current?.click()} className="btn !text-[10px] !py-1">
        ⭱ Import
      </button>
      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleImport}
      />
    </div>
  );
}
