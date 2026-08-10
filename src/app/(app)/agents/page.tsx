import Link from "next/link";
import { Plus, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/toolbar";
import { DataTablePagination } from "@/components/data-table/pagination";
import { agentColumns } from "@/features/agents/components/columns";
import { AgentStats } from "@/features/agents/components/agent-stats";
import { AgentFilters } from "@/features/agents/components/agent-filters";
import { getAgentStats, listAgents } from "@/features/agents/queries";

export default async function AgentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : undefined;
  const status = typeof params.status === "string" ? params.status : undefined;
  const agentType = typeof params.agentType === "string" ? params.agentType : undefined;
  const sortBy = typeof params.sortBy === "string" ? params.sortBy : undefined;
  const sortDir = typeof params.sortDir === "string" ? params.sortDir : undefined;
  const page = typeof params.page === "string" ? Number(params.page) : 1;
  const pageSize = typeof params.pageSize === "string" ? Number(params.pageSize) : 25;

  const [stats, { rows, totalItems }] = await Promise.all([
    getAgentStats(),
    listAgents({ q, status, agentType, sortBy, sortDir, page, pageSize }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Agents Overview</h2>
        <Button render={<Link href="/agents/new" />} nativeButton={false}>
          <Plus />
          Add Agent
        </Button>
      </div>

      <AgentStats stats={stats} />

      <Card className="gap-4 p-4">
        <DataTableToolbar searchPlaceholder="Search agent by name, phone, email...">
          <AgentFilters />
        </DataTableToolbar>

        <DataTable
          columns={agentColumns}
          data={rows}
          emptyState={
            <EmptyState icon={Users} title="No agents yet" description="Get started by adding your first agent." />
          }
        />

        <DataTablePagination page={page} pageSize={pageSize} totalItems={totalItems} />
      </Card>
    </div>
  );
}
