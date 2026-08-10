import Link from "next/link";
import { Plus, ClipboardList } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { DataTablePagination } from "@/components/data-table/pagination";
import { invoiceColumns } from "@/features/invoices/components/columns";
import { InvoiceStats } from "@/features/invoices/components/invoice-stats";
import { InvoiceFilters } from "@/features/invoices/components/invoice-filters";
import { getInvoiceStats, listInvoices } from "@/features/invoices/queries";

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const sortBy = typeof params.sortBy === "string" ? params.sortBy : undefined;
  const sortDir = typeof params.sortDir === "string" ? params.sortDir : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const pageSize = typeof params.pageSize === "string" ? Number(params.pageSize) : 25;

  const [stats, { rows, totalItems }] = await Promise.all([
    getInvoiceStats(),
    listInvoices({ q, status, sortBy, sortDir, page, pageSize }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Invoices Overview</h2>
        <Button render={<Link href="/invoices/new" />} nativeButton={false}>
          <Plus />
          New Invoice
        </Button>
      </div>

      <InvoiceStats stats={stats} />

      <Card className="gap-4 p-4">
        <DataTableToolbar searchPlaceholder="Search invoices by number, customer, agent...">
          <InvoiceFilters />
        </DataTableToolbar>

        <DataTable
          columns={invoiceColumns}
          data={rows}
          emptyState={
            <EmptyState
              icon={ClipboardList}
              title="No invoices yet"
              description="Get started by creating your first invoice."
            />
          }
        />

        <DataTablePagination page={page} pageSize={pageSize} totalItems={totalItems} />
      </Card>
    </div>
  );
}
