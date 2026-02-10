"use client";

import { useCallback, useState } from "react";

interface ExportButtonProps {
  targetId: string;
  filename: string;
}

export default function ExportButton({
  targetId,
  filename,
}: ExportButtonProps) {
  const [exporting, setExporting] = useState(false);

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas");
      const element = document.getElementById(targetId);
      if (!element) return;

      const canvas = await html2canvas(element, {
        scale: 2,
        backgroundColor: "#fafafa",
        useCORS: true,
      });

      const link = document.createElement("a");
      link.download = `${filename}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (error) {
      console.error("Export failed:", error);
    } finally {
      setExporting(false);
    }
  }, [targetId, filename]);

  return (
    <button
      onClick={handleExport}
      disabled={exporting}
      className="px-5 py-2.5 bg-accent text-white text-[13px] font-medium rounded-lg hover:opacity-85 transition-opacity disabled:opacity-40"
    >
      {exporting ? "Exporting..." : "Export as PNG"}
    </button>
  );
}
