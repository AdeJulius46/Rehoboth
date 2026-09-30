"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { downloadCsv } from "@/lib/csv";
import { buildReportCsv, type ReportCsvData } from "@/features/reports/csv";

export function ReportExportButton(data: ReportCsvData) {
  function handleExport() {
    downloadCsv(
      `${BRAND.slug}-report-${new Date().toISOString().slice(0, 10)}.csv`,
      buildReportCsv(data)
    );
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download />
      Export CSV
    </Button>
  );
}
