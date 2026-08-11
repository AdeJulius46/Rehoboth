"use client";

import { Package } from "lucide-react";

import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { productColumns } from "@/features/products/components/columns";
import type { ProductListRow } from "@/features/products/queries";

export function ProductsDataTable({ data, isAdmin }: { data: ProductListRow[]; isAdmin: boolean }) {
  return (
    <DataTable
      columns={productColumns(isAdmin)}
      data={data}
      emptyState={
        <EmptyState icon={Package} title="No products yet" description="Get started by adding your first product." />
      }
    />
  );
}
