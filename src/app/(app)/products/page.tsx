import Link from "next/link";
import { Plus } from "lucide-react";

import { auth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { DataTablePagination } from "@/components/data-table/pagination";
import { ProductsDataTable } from "@/features/products/components/products-data-table";
import { ProductStats } from "@/features/products/components/product-stats";
import { ProductFilters } from "@/features/products/components/product-filters";
import { getProductStats, listProducts } from "@/features/products/queries";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await auth();
  const isAdmin = session?.user?.role === "ADMIN";

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const category = typeof params.category === "string" ? params.category : undefined;
  const sortBy = typeof params.sortBy === "string" ? params.sortBy : undefined;
  const sortDir = typeof params.sortDir === "string" ? params.sortDir : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const pageSize = typeof params.pageSize === "string" ? Number(params.pageSize) : 25;

  const [stats, { rows, totalItems }] = await Promise.all([
    getProductStats(),
    listProducts({ q, status, category, sortBy, sortDir, page, pageSize }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Products Overview</h2>
        {isAdmin && (
          <Button render={<Link href="/products/new" />} nativeButton={false}>
            <Plus />
            Add Product
          </Button>
        )}
      </div>

      <ProductStats stats={stats} />

      <Card className="gap-4 p-4">
        <DataTableToolbar searchPlaceholder="Search by product name, category...">
          <ProductFilters />
        </DataTableToolbar>

        <ProductsDataTable data={rows} isAdmin={isAdmin} />

        <DataTablePagination page={page} pageSize={pageSize} totalItems={totalItems} />
      </Card>
    </div>
  );
}
