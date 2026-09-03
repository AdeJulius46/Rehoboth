"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { downloadCsv } from "@/lib/csv";
import { buildReportCsv, type ReportCsvData } from "@/features/reports/csv";

export function ReportExportButton(data: ReportCsvData) {
  function handleExport() {
    downloadCsv(
      `rehoboth-report-${new Date().toISOString().slice(0, 10)}.csv`,
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
