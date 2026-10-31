"use client";

import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { downloadCsv } from "@/lib/csv";
import { buildExpenseCsv } from "@/features/expenses/csv";
import type { ExpenseExportRow } from "@/features/expenses/queries";

export function ExpenseExportButton({ rows }: { rows: ExpenseExportRow[] }) {
  function handleExport() {
    downloadCsv(`${BRAND.slug}-expenses-${new Date().toISOString().slice(0, 10)}.csv`, buildExpenseCsv(rows));
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={rows.length === 0}>
      <Download />
      Export CSV
    </Button>
  );
}
