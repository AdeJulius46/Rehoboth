import { Users, UserCheck, UserX, Receipt, Wallet } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatNaira } from "@/lib/currency";
import type { getAgentStats } from "@/features/agents/queries";

export function AgentStats({ stats }: { stats: Awaited<ReturnType<typeof getAgentStats>> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      <StatCard label="Total Agents" value={stats.total.toLocaleString()} icon={Users} />
      <StatCard label="Active Agents" value={stats.active.toLocaleString()} icon={UserCheck} />
      <StatCard label="Inactive Agents" value={stats.inactive.toLocaleString()} icon={UserX} />
      <StatCard label="Total Sales" value={formatNaira(0)} icon={Receipt} />
      <StatCard label="Commission Paid" value={formatNaira(0)} icon={Wallet} />
    </div>
  );
}
