import Link from "next/link";
import { Plus, CreditCard } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { DataTablePagination } from "@/components/data-table/pagination";
import { paymentColumns } from "@/features/payments/components/columns";
import { PaymentStats } from "@/features/payments/components/payment-stats";
import { PaymentFilters } from "@/features/payments/components/payment-filters";
import { getPaymentStats, listPayments } from "@/features/payments/queries";

export default async function PaymentsPage({
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
    getPaymentStats(),
    listPayments({ q, status, sortBy, sortDir, page, pageSize }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Payments Overview</h2>
        <Button render={<Link href="/payments/new" />} nativeButton={false}>
          <Plus />
          Record Payment
        </Button>
      </div>

      <PaymentStats stats={stats} />

      <Card className="gap-4 p-4">
        <DataTableToolbar searchPlaceholder="Search by payment ID, customer, invoice...">
          <PaymentFilters />
        </DataTableToolbar>

        <DataTable
          columns={paymentColumns}
          data={rows}
          emptyState={
            <EmptyState
              icon={CreditCard}
              title="No payments yet"
              description="Get started by recording your first payment."
            />
          }
        />

        <DataTablePagination page={page} pageSize={pageSize} totalItems={totalItems} />
      </Card>
    </div>
  );
}
