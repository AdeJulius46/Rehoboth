"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { ColumnHeader } from "@/components/data-table/column-header";
import { RowActions } from "@/components/data-table/row-actions";
import { formatNaira } from "@/lib/currency";
import { PROJECT_STATUS_VARIANT } from "@/lib/constants";
import { deleteProject } from "@/features/projects/actions";
import { progressIndicatorClass } from "@/features/projects/progress-color";
import type { ProjectListRow } from "@/features/projects/queries";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export const projectColumns: ColumnDef<ProjectListRow, unknown>[] = [
  {
    accessorKey: "code",
    header: () => <ColumnHeader label="Project Code" sortKey="code" />,
    cell: ({ row }) => <span className="font-medium text-foreground">{row.original.code}</span>,
  },
  {
    accessorKey: "name",
    header: () => <ColumnHeader label="Project Name" sortKey="name" />,
  },
  {
    id: "customerName",
    header: "Customer",
    cell: ({ row }) => row.original.customerName || "—",
  },
  {
    id: "agentName",
    header: "Agent",
    cell: ({ row }) => row.original.agentName || "—",
  },
  {
    accessorKey: "startDate",
    header: () => <ColumnHeader label="Start Date" sortKey="startDate" />,
    cell: ({ row }) => formatDate(row.original.startDate),
  },
  {
    accessorKey: "endDate",
    header: () => <ColumnHeader label="Due Date" sortKey="endDate" />,
    cell: ({ row }) => (row.original.endDate ? formatDate(row.original.endDate) : "—"),
  },
  {
    accessorKey: "budget",
    header: () => <ColumnHeader label="Value" sortKey="budget" />,
    cell: ({ row }) => formatNaira(row.original.budget),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <StatusBadge label={STATUS_LABELS[row.original.status]} variant={PROJECT_STATUS_VARIANT[row.original.status]} />
    ),
  },
  {
    accessorKey: "progress",
    header: "Progress",
    cell: ({ row }) => (
      <div className="flex items-center gap-2">
        <Progress
          value={row.original.progress}
          className="w-20"
          indicatorClassName={progressIndicatorClass(row.original.progress)}
        />
        <span className="text-xs text-muted-foreground">{row.original.progress}%</span>
      </div>
    ),
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => (
      <RowActions
        viewHref={`/projects/${row.original.id}`}
        editHref={`/projects/${row.original.id}/edit`}
        entityLabel="Project"
        onDelete={() => deleteProject(row.original.id)}
      />
    ),
  },
];
