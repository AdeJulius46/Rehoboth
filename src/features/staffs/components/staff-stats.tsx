import { Users, UserCheck, UserMinus, Wallet } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatNaira } from "@/lib/currency";
import type { getStaffStats } from "@/features/staffs/queries";

export function StaffStats({ stats }: { stats: Awaited<ReturnType<typeof getStaffStats>> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Staff" value={stats.total.toLocaleString()} icon={Users} />
      <StatCard label="Active Staff" value={stats.active.toLocaleString()} icon={UserCheck} />
      <StatCard label="Inactive Staff" value={stats.inactive.toLocaleString()} icon={UserMinus} />
      <StatCard label="Total Payroll" value={formatNaira(stats.totalPayroll)} icon={Wallet} />
    </div>
  );
}
