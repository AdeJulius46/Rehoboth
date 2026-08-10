"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ColumnHeader } from "@/components/data-table/column-header";
import { RowActions } from "@/components/data-table/row-actions";
import { formatNaira } from "@/lib/currency";
import { PERSON_STATUS_VARIANT } from "@/lib/constants";
import { deleteWarehouse } from "@/features/warehouses/actions";
import type { WarehouseListRow } from "@/features/warehouses/queries";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const warehouseColumns: ColumnDef<WarehouseListRow, unknown>[] = [
  {
    accessorKey: "name",
    header: () => <ColumnHeader label="Warehouse Name" sortKey="name" />,
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Avatar size="sm">
          <AvatarImage src={row.original.imageUrl ?? undefined} />
          <AvatarFallback>{initials(row.original.name)}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-foreground">{row.original.name}</span>
      </div>
    ),
  },
  { accessorKey: "code", header: () => <ColumnHeader label="Code" sortKey="code" /> },
  { accessorKey: "location", header: "Location" },
  {
    accessorKey: "manager",
    header: "Manager",
    cell: ({ row }) => row.original.manager || "—",
  },
  { accessorKey: "itemsInStock", header: "Items in Stock" },
  {
    accessorKey: "stockValue",
    header: "Stock Value",
    cell: ({ row }) => formatNaira(row.original.stockValue),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge
        label={row.original.status === "ACTIVE" ? "Active" : "Inactive"}
        variant={PERSON_STATUS_VARIANT[row.original.status]}
      />
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <RowActions
        viewHref={`/warehouses/${row.original.id}`}
        editHref={`/warehouses/${row.original.id}/edit`}
        entityLabel="Warehouse"
        onDelete={() => deleteWarehouse(row.original.id)}
      />
    ),
  },
];
