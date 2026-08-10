import Link from "next/link";
import { Plus, Warehouse } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { DataTablePagination } from "@/components/data-table/pagination";
import { warehouseColumns } from "@/features/warehouses/components/columns";
import { WarehouseStats } from "@/features/warehouses/components/warehouse-stats";
import { WarehouseFilters } from "@/features/warehouses/components/warehouse-filters";
import { getWarehouseStats, listWarehouses } from "@/features/warehouses/queries";

export default async function WarehousesPage({
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
    getWarehouseStats(),
    listWarehouses({ q, status, sortBy, sortDir, page, pageSize }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Warehouses Overview</h2>
        <Button render={<Link href="/warehouses/new" />} nativeButton={false}>
          <Plus />
          Add Warehouse
        </Button>
      </div>

      <WarehouseStats stats={stats} />

      <Card className="gap-4 p-4">
        <DataTableToolbar searchPlaceholder="Search warehouses by name, code, manager...">
          <WarehouseFilters />
        </DataTableToolbar>

        <DataTable
          columns={warehouseColumns}
          data={rows}
          emptyState={
            <EmptyState icon={Warehouse} title="No warehouses yet" description="Get started by adding your first warehouse." />
          }
        />

        <DataTablePagination page={page} pageSize={pageSize} totalItems={totalItems} />
      </Card>
    </div>
  );
}
