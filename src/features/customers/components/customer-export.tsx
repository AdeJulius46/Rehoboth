"use client";

import * as React from "react";
import { Download } from "lucide-react";

import { Button } from "@/components/ui/button";
import { BRAND } from "@/lib/brand";
import { downloadCsv } from "@/lib/csv";
import { exportCustomersCsv } from "@/features/customers/actions";

export function CustomerExportButton({ q, status, type }: { q?: string; status?: string; type?: string }) {
  const [pending, startTransition] = React.useTransition();

  function handleExport() {
    startTransition(async () => {
      const csv = await exportCustomersCsv({ q, status, type });
      downloadCsv(`${BRAND.slug}-customers-${new Date().toISOString().slice(0, 10)}.csv`, csv);
    });
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={pending}>
      <Download />
      {pending ? "Exporting..." : "Export CSV"}
    </Button>
  );
}
