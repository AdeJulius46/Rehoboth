"use client";

import * as React from "react";
import { Download, Image as ImageIcon, Printer } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PrintableDocument({
  fileName,
  children,
}: {
  fileName: string;
  children: React.ReactNode;
}) {
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [isExporting, setIsExporting] = React.useState<"pdf" | "image" | null>(null);

  function handlePrint() {
    window.print();
  }

  async function renderCanvas() {
    const node = contentRef.current;
    if (!node) return null;
    const { default: html2canvas } = await import("html2canvas-pro");
    return html2canvas(node, { scale: 2, backgroundColor: "#ffffff", useCORS: true });
  }

  async function handleDownloadImage() {
    setIsExporting("image");
    try {
      const canvas = await renderCanvas();
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `${fileName}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setIsExporting(null);
    }
  }

  async function handleDownloadPdf() {
    setIsExporting("pdf");
    try {
      const canvas = await renderCanvas();
      if (!canvas) return;
      const { jsPDF } = await import("jspdf");

      const imgWidthPx = canvas.width;
      const imgHeightPx = canvas.height;
      const pdf = new jsPDF({
        orientation: imgWidthPx > imgHeightPx ? "landscape" : "portrait",
        unit: "px",
        format: [imgWidthPx, imgHeightPx],
        compress: true,
      });
      pdf.addImage(canvas.toDataURL("image/jpeg", 0.85), "JPEG", 0, 0, imgWidthPx, imgHeightPx);
      pdf.save(`${fileName}.pdf`);
    } finally {
      setIsExporting(null);
    }
  }

  return (
    <div>
      <div className="mx-auto mb-4 flex max-w-3xl flex-wrap items-center justify-end gap-2 print:hidden">
        <Button variant="outline" onClick={handlePrint}>
          <Printer />
          Print
        </Button>
        <Button variant="outline" onClick={handleDownloadImage} disabled={isExporting !== null}>
          <ImageIcon />
          {isExporting === "image" ? "Exporting..." : "Download Image"}
        </Button>
        <Button onClick={handleDownloadPdf} disabled={isExporting !== null}>
          <Download />
          {isExporting === "pdf" ? "Exporting..." : "Download PDF"}
        </Button>
      </div>
      <div ref={contentRef}>{children}</div>
    </div>
  );
}
