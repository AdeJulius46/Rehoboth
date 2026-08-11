"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ColumnHeader } from "@/components/data-table/column-header";
import { RowActions } from "@/components/data-table/row-actions";
import { formatNaira } from "@/lib/currency";
import { deleteProduct } from "@/features/products/actions";
import type { ProductListRow } from "@/features/products/queries";

const STOCK_STATUS_LABEL = {
  in_stock: "In Stock",
  low_stock: "Low Stock",
  out_of_stock: "Out of stock",
} as const;

const STOCK_STATUS_VARIANT = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "danger",
} as const;

export function productColumns(isAdmin: boolean): ColumnDef<ProductListRow, unknown>[] {
  return [
    ...baseProductColumns,
    ...(isAdmin ? [actionsColumn] : []),
  ];
}

const baseProductColumns: ColumnDef<ProductListRow, unknown>[] = [
  {
    accessorKey: "name",
    header: () => <ColumnHeader label="Product Name" sortKey="name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Avatar size="sm">
          <AvatarImage src={row.original.imageUrl ?? undefined} />
          <AvatarFallback className="rounded-md">{row.original.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{row.original.name}</p>
          <p className="text-xs text-muted-foreground">{row.original.sku}</p>
        </div>
      </div>
    ),
  },
  { accessorKey: "category", header: "Category" },
  { accessorKey: "brand", header: "Brand", cell: ({ row }) => row.original.brand || "—" },
  {
    accessorKey: "sellingPrice",
    header: () => <ColumnHeader label="Unit Price" sortKey="sellingPrice" />,
    cell: ({ row }) => formatNaira(row.original.sellingPrice),
  },
  {
    accessorKey: "costPrice",
    header: () => <ColumnHeader label="Cost Price" sortKey="costPrice" />,
    cell: ({ row }) => formatNaira(row.original.costPrice),
  },
  { accessorKey: "quantity", header: "Stock Qty" },
  { accessorKey: "unit", header: "Unit" },
  {
    id: "stockStatus",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        label={STOCK_STATUS_LABEL[row.original.stockStatus]}
        variant={STOCK_STATUS_VARIANT[row.original.stockStatus]}
      />
    ),
  },
];

const actionsColumn: ColumnDef<ProductListRow, unknown> = {
  id: "actions",
  header: "",
  cell: ({ row }) => (
    <RowActions
      viewHref={`/products/${row.original.id}`}
      editHref={`/products/${row.original.id}/edit`}
      entityLabel="Product"
      onDelete={() => deleteProduct(row.original.id)}
    />
  ),
};
