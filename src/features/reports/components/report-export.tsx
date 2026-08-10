"use client";

import * as React from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";

const ReportContentRefContext = React.createContext<React.RefObject<HTMLDivElement | null> | null>(null);

export function ReportExportProvider({ children }: { children: React.ReactNode }) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  return <ReportContentRefContext.Provider value={contentRef}>{children}</ReportContentRefContext.Provider>;
}

export function ReportExportContent({ children }: { children: React.ReactNode }) {
  const contentRef = React.useContext(ReportContentRefContext);
  return (
    <div ref={contentRef} className="space-y-6 bg-background">
      {children}
    </div>
  );
}

export function ReportExportButton() {
  const contentRef = React.useContext(ReportContentRefContext);
  const [isExporting, setIsExporting] = React.useState(false);

  async function handleExport() {
    const node = contentRef?.current;
    if (!node) return;
    setIsExporting(true);
    try {
      const { default: html2canvas } = await import("html2canvas-pro");
      const canvas = await html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
      const { jsPDF } = await import("jspdf");
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
        compress: true,
      });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.85), "JPEG", 0, 0, canvas.width, canvas.height);
      pdf.save(`rehoboth-report-${new Date().toISOString().slice(0, 10)}.pdf`);
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={isExporting}>
      <Download />
      {isExporting ? "Exporting..." : "Export Report"}
    </Button>
  );
}
