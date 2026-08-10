import Link from "next/link";
import { Plus, Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { DataTablePagination } from "@/components/data-table/pagination";
import { projectColumns } from "@/features/projects/components/columns";
import { ProjectStats } from "@/features/projects/components/project-stats";
import { ProjectFilters } from "@/features/projects/components/project-filters";
import { getProjectStats, listProjects } from "@/features/projects/queries";

export default async function ProjectsPage({
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
    getProjectStats(),
    listProjects({ q, status, sortBy, sortDir, page, pageSize }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Projects Overview</h2>
        <Button render={<Link href="/projects/new" />} nativeButton={false}>
          <Plus />
          New Project
        </Button>
      </div>

      <ProjectStats stats={stats} />

      <Card className="gap-4 p-4">
        <DataTableToolbar searchPlaceholder="Search projects by name, customer, agent...">
          <ProjectFilters />
        </DataTableToolbar>

        <DataTable
          columns={projectColumns}
          data={rows}
          emptyState={
            <EmptyState
              icon={Building2}
              title="No projects yet"
              description="Get started by creating your first project."
            />
          }
        />

        <DataTablePagination page={page} pageSize={pageSize} totalItems={totalItems} />
      </Card>
    </div>
  );
}
