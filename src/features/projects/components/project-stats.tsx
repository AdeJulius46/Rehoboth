import { Building2, PlayCircle, CheckCircle2, PauseCircle, Wallet } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatNaira } from "@/lib/currency";
import type { getProjectStats } from "@/features/projects/queries";

export function ProjectStats({ stats }: { stats: Awaited<ReturnType<typeof getProjectStats>> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Total Projects" value={stats.total.toLocaleString()} icon={Building2} />
      <StatCard label="Active Projects" value={stats.active.toLocaleString()} icon={PlayCircle} />
      <StatCard label="Completed Projects" value={stats.completed.toLocaleString()} icon={CheckCircle2} />
      <StatCard label="On Hold Projects" value={stats.onHold.toLocaleString()} icon={PauseCircle} />
      <StatCard label="Total Project Value" value={formatNaira(stats.totalValue)} icon={Wallet} />
    </div>
  );
}
