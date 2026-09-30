import { TrendingUp, ShoppingCart, Receipt, Wallet, Package } from "lucide-react";

import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RevenueChart } from "@/features/reports/components/revenue-chart";
import { DonutChart } from "@/features/reports/components/donut-chart";
import { ReportPeriodFilter } from "@/features/reports/components/report-period-filter";
import { ReportExportButton } from "@/features/reports/components/report-export";
import { resolveReportRange, toDateKey } from "@/features/reports/period";
import { formatNaira } from "@/lib/currency";
import {
  getReportStats,
  getSalesTrend,
  getSalesByCategory,
  getTopSellingProducts,
} from "@/features/reports/queries";

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const range = resolveReportRange({
    period: typeof params.period === "string" ? params.period : undefined,
    from: typeof params.from === "string" ? params.from : undefined,
    to: typeof params.to === "string" ? params.to : undefined,
  });
  const lastDay = new Date(range.end);
  lastDay.setDate(lastDay.getDate() - 1);

  const [stats, trend, categoryBreakdown, topProducts] = await Promise.all([
    getReportStats(range),
    getSalesTrend(range),
    getSalesByCategory(range),
    getTopSellingProducts(5, range),
  ]);

  const categoryData = categoryBreakdown.map((c) => ({ label: c.category, value: c.value }));
  const totalCategoryValue = categoryBreakdown.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Report Overview</h2>
        <div className="flex flex-wrap items-center gap-2">
          <ReportPeriodFilter period={range.key} from={toDateKey(range.start)} to={toDateKey(lastDay)} />
          <ReportExportButton
            periodLabel={range.label}
            stats={stats}
            trend={trend}
            categories={categoryBreakdown}
            topProducts={topProducts}
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Total Revenue" value={formatNaira(stats.totalRevenue)} icon={Wallet} />
        <StatCard label="Total Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingCart} />
        <StatCard label="Total Expenses" value={formatNaira(stats.totalExpenses)} icon={Receipt} />
        <StatCard label="Net Profit" value={formatNaira(stats.netProfit)} icon={TrendingUp} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-4 p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground">Sales Overview</h3>
          <RevenueChart data={trend} />
        </Card>

        <Card className="gap-4 p-5">
          <h3 className="font-semibold text-foreground">Sales by Category</h3>
          {categoryData.length > 0 ? (
            <DonutChart centerLabel="Total Sales" centerValue={totalCategoryValue} data={categoryData} />
          ) : (
            <EmptyState icon={Package} title="No sales data" description="Category breakdown will appear here." />
          )}
        </Card>
      </div>

      <Card className="gap-4 p-0">
        <div className="border-b border-border p-5 pb-4">
          <h3 className="font-semibold text-foreground">Top Selling Products</h3>
        </div>
        <div className="p-5 pt-0">
          {topProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Total Sales</TableHead>
                  <TableHead>% of Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product) => (
                  <TableRow key={product.productId}>
                    <TableCell className="font-medium text-foreground">{product.name}</TableCell>
                    <TableCell>{product.unitsSold.toLocaleString()}</TableCell>
                    <TableCell>{formatNaira(product.totalSales)}</TableCell>
                    <TableCell>{product.percentage}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={ShoppingCart}
              title="No sales yet"
              description="Top selling products will appear here once sales are recorded."
            />
          )}
        </div>
      </Card>
    </div>
  );
}
