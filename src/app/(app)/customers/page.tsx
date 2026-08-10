import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { DataTablePagination } from "@/components/data-table/pagination";
import { customerColumns } from "@/features/customers/components/columns";
import { CustomerStats } from "@/features/customers/components/customer-stats";
import { CustomerFilters } from "@/features/customers/components/customer-filters";
import { getCustomerStats, listCustomers } from "@/features/customers/queries";

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const type = typeof params.type === "string" ? params.type : undefined;
  const sortBy = typeof params.sortBy === "string" ? params.sortBy : undefined;
  const sortDir = typeof params.sortDir === "string" ? params.sortDir : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const pageSize = typeof params.pageSize === "string" ? Number(params.pageSize) : 25;

  const [stats, { rows, totalItems }] = await Promise.all([
    getCustomerStats(),
    listCustomers({ q, status, type, sortBy, sortDir, page, pageSize }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Customers Overview</h2>
        <Button render={<Link href="/customers/new" />} nativeButton={false}>
          <Plus />
          Add Customer
        </Button>
      </div>

      <CustomerStats stats={stats} />

      <Card className="gap-4 p-4">
        <DataTableToolbar searchPlaceholder="Search customers by name, phone, email...">
          <CustomerFilters />
        </DataTableToolbar>

        <DataTable
          columns={customerColumns}
          data={rows}
          emptyState={
            <EmptyState
              icon={Users}
              title="No customers yet"
              description="Get started by adding your first customer."
            />
          }
        />

        <DataTablePagination page={page} pageSize={pageSize} totalItems={totalItems} />
      </Card>
    </div>
  );
}
