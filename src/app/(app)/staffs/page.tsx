import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { DataTablePagination } from "@/components/data-table/pagination";
import { staffColumns } from "@/features/staffs/components/columns";
import { StaffStats } from "@/features/staffs/components/staff-stats";
import { StaffFilters } from "@/features/staffs/components/staff-filters";
import { getStaffStats, listStaffs } from "@/features/staffs/queries";

export default async function StaffsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const department = typeof params.department === "string" ? params.department : undefined;
  const sortBy = typeof params.sortBy === "string" ? params.sortBy : undefined;
  const sortDir = typeof params.sortDir === "string" ? params.sortDir : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const pageSize = typeof params.pageSize === "string" ? Number(params.pageSize) : 25;

  const [stats, { rows, totalItems }] = await Promise.all([
    getStaffStats(),
    listStaffs({ q, status, department, sortBy, sortDir, page, pageSize }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Staffs Overview</h2>
        <Button render={<Link href="/staffs/new" />} nativeButton={false}>
          <Plus />
          Add Staff
        </Button>
      </div>

      <StaffStats stats={stats} />

      <Card className="gap-4 p-4">
        <DataTableToolbar searchPlaceholder="Search staffs by employee id, phone, email...">
          <StaffFilters />
        </DataTableToolbar>

        <DataTable
          columns={staffColumns}
          data={rows}
          emptyState={
            <EmptyState icon={Users} title="No staff yet" description="Get started by adding your first staff member." />
          }
        />

        <DataTablePagination page={page} pageSize={pageSize} totalItems={totalItems} />
      </Card>
    </div>
  );
}
