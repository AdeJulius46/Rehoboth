import Link from "next/link";
import { Plus, ShoppingCart } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { DataTablePagination } from "@/components/data-table/pagination";
import { saleColumns } from "@/features/sales/components/columns";
import { SaleStats } from "@/features/sales/components/sale-stats";
import { SaleFilters } from "@/features/sales/components/sale-filters";
import { getSaleStats, listSales } from "@/features/sales/queries";

export default async function SalesPage({
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
    getSaleStats(),
    listSales({ q, status, sortBy, sortDir, page, pageSize }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Sales Overview</h2>
        <Button render={<Link href="/sales/new" />} nativeButton={false}>
          <Plus />
          New Sale
        </Button>
      </div>

      <SaleStats stats={stats} />

      <Card className="gap-4 p-4">
        <DataTableToolbar searchPlaceholder="Search sales by invoice no, customer, agent...">
          <SaleFilters />
        </DataTableToolbar>

        <DataTable
          columns={saleColumns}
          data={rows}
          emptyState={
            <EmptyState icon={ShoppingCart} title="No sales yet" description="Get started by recording your first sale." />
          }
        />

        <DataTablePagination page={page} pageSize={pageSize} totalItems={totalItems} />
      </Card>
    </div>
  );
}
