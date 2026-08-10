"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { ColumnHeader } from "@/components/data-table/column-header";
import { RowActions } from "@/components/data-table/row-actions";
import { PERSON_STATUS_VARIANT } from "@/lib/constants";
import { deleteStaff } from "@/features/staffs/actions";
import type { StaffListRow } from "@/features/staffs/queries";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export const staffColumns: ColumnDef<StaffListRow, unknown>[] = [
  {
    accessorKey: "name",
    header: () => <ColumnHeader label="Staff Name" sortKey="name" />,
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
  { accessorKey: "employeeId", header: "Employee ID" },
  { accessorKey: "position", header: "Position" },
  { accessorKey: "department", header: "Department" },
  { accessorKey: "phone", header: "Phone" },
  { accessorKey: "email", header: () => <ColumnHeader label="Email" sortKey="email" /> },
  {
    accessorKey: "hireDate",
    header: () => <ColumnHeader label="Join Date" sortKey="hireDate" />,
    cell: ({ row }) => format(row.original.hireDate, "MMM d, yyyy"),
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
        viewHref={`/staffs/${row.original.id}`}
        editHref={`/staffs/${row.original.id}/edit`}
        entityLabel="Staff"
        onDelete={() => deleteStaff(row.original.id)}
      />
    ),
  },
];
