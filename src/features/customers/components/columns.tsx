"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ColumnHeader } from "@/components/data-table/column-header";
import { RowActions } from "@/components/data-table/row-actions";
import { formatNaira } from "@/lib/currency";
import { PERSON_STATUS_VARIANT } from "@/lib/constants";
import { deleteCustomer } from "@/features/customers/actions";
import type { CustomerListRow } from "@/features/customers/queries";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const customerColumns: ColumnDef<CustomerListRow, unknown>[] = [
  {
    accessorKey: "name",
    header: () => <ColumnHeader label="Customer Name" sortKey="name" />,
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
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: () => <ColumnHeader label="Email" sortKey="email" />,
  },
  {
    accessorKey: "companyName",
    header: "Company",
    cell: ({ row }) => row.original.companyName || "—",
  },
  {
    accessorKey: "type",
    header: "Customer Type",
    cell: ({ row }) => (
      <StatusBadge
        label={row.original.type === "BUSINESS" ? "Company" : "Individual"}
        variant={row.original.type === "BUSINESS" ? "success" : "neutral"}
      />
    ),
  },
  {
    id: "totalPurchases",
    header: "Total Purchases",
    cell: () => formatNaira(0),
  },
  {
    accessorKey: "openingBalance",
    header: () => <ColumnHeader label="Outstanding Balance" sortKey="openingBalance" />,
    cell: ({ row }) => formatNaira(row.original.openingBalance),
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
        viewHref={`/customers/${row.original.id}`}
        editHref={`/customers/${row.original.id}/edit`}
        entityLabel="Customer"
        onDelete={() => deleteCustomer(row.original.id)}
      />
    ),
  },
];
