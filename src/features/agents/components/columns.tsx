"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ColumnHeader } from "@/components/data-table/column-header";
import { RowActions } from "@/components/data-table/row-actions";
import { formatNaira } from "@/lib/currency";
import { PERSON_STATUS_VARIANT } from "@/lib/constants";
import { deleteAgent } from "@/features/agents/actions";
import type { AgentListRow } from "@/features/agents/queries";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const agentColumns: ColumnDef<AgentListRow, unknown>[] = [
  {
    accessorKey: "name",
    header: () => <ColumnHeader label="Agent Name" sortKey="name" />,
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
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "email", header: () => <ColumnHeader label="Email" sortKey="email" /> },
  { accessorKey: "region", header: "Territory" },
  {
    accessorKey: "agentType",
    header: "Agent Type",
    cell: ({ row }) => (
      <StatusBadge
        label={row.original.agentType === "SALES" ? "Sales Agent" : "Collection Agent"}
        variant={row.original.agentType === "SALES" ? "success" : "neutral"}
      />
    ),
  },
  { id: "totalSales", header: "Total Sales", cell: () => formatNaira(0) },
  {
    accessorKey: "commissionRate",
    header: () => <ColumnHeader label="Commission" sortKey="commissionRate" />,
    cell: ({ row }) => `${row.original.commissionRate}%`,
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
        viewHref={`/agents/${row.original.id}`}
        editHref={`/agents/${row.original.id}/edit`}
        entityLabel="Agent"
        onDelete={() => deleteAgent(row.original.id)}
      />
    ),
  },
];
