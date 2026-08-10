import Link from "next/link";
import { Plus, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { DataTablePagination } from "@/components/data-table/pagination";
import { expenseColumns } from "@/features/expenses/components/columns";
import { ExpenseStats } from "@/features/expenses/components/expense-stats";
import { ExpenseFilters } from "@/features/expenses/components/expense-filters";
import { getExpenseStats, listExpenses } from "@/features/expenses/queries";

export default async function ExpensesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const sortBy = typeof params.sortBy === "string" ? params.sortBy : undefined;
  const sortDir = typeof params.sortDir === "string" ? params.sortDir : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const pageSize = typeof params.pageSize === "string" ? Number(params.pageSize) : 25;

  const [stats, { rows, totalItems }] = await Promise.all([
    getExpenseStats(),
    listExpenses({ q, status, category, sortBy, sortDir, page, pageSize }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Expenses Overview</h2>
        <Button render={<Link href="/expenses/new" />} nativeButton={false}>
          <Plus />
          Add Expense
        </Button>
      </div>

      <ExpenseStats stats={stats} />

      <Card className="gap-4 p-4">
        <DataTableToolbar searchPlaceholder="Search by payment ID, customer, invoice...">
          <ExpenseFilters />
        </DataTableToolbar>

        <DataTable
          columns={expenseColumns}
          data={rows}
          emptyState={
            <EmptyState
              icon={Wallet}
              title="No expenses yet"
              description="Get started by recording your first expense."
            />
          }
        />

        <DataTablePagination page={page} pageSize={pageSize} totalItems={totalItems} />
      </Card>
    </div>
  );
}
