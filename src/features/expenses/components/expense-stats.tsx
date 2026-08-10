import { Wallet, CalendarRange, CalendarDays, Calendar } from "lucide-react";

import { StatCard } from "@/components/ui/stat-card";
import { formatNaira } from "@/lib/currency";
import type { getExpenseStats } from "@/features/expenses/queries";

export function ExpenseStats({ stats }: { stats: Awaited<ReturnType<typeof getExpenseStats>> }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard label="Total Expenses" value={formatNaira(stats.total)} icon={Wallet} caption="All time" />
      <StatCard label="This Month" value={formatNaira(stats.thisMonth)} icon={CalendarRange} />
      <StatCard label="This Week" value={formatNaira(stats.thisWeek)} icon={CalendarDays} />
      <StatCard label="Today" value={formatNaira(stats.today)} icon={Calendar} />
    </div>
  );
}
