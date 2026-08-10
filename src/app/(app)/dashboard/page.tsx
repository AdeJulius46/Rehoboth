import Link from "next/link";
import {
  Wallet,
  ShoppingCart,
  Package,
  Users,
  User,
  UsersRound,
  Warehouse,
  CreditCard,
  UserPlus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatCard } from "@/components/ui/stat-card";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RevenueChart } from "@/features/reports/components/revenue-chart";
import { DonutChart } from "@/features/reports/components/donut-chart";
import { formatNaira } from "@/lib/currency";
import { SALE_STATUS_VARIANT } from "@/lib/constants";
import {
  getDashboardStats,
  getSalesTrend,
  getFinancialBreakdown,
  getWarehouseStockSummary,
  getRecentSales,
  getRecentActivity,
  getLowStockAlerts,
} from "@/features/reports/queries";

const SALE_STATUS_LABELS: Record<string, string> = {
  PENDING: "Pending",
  COMPLETED: "Paid",
  CANCELLED: "Cancelled",
};

const ACTIVITY_ICONS = {
  sale: ShoppingCart,
  payment: CreditCard,
  product: Package,
  customer: UserPlus,
};

function timeAgo(date: Date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes === 1 ? "" : "s"} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export default async function DashboardPage() {
  const [stats, trend, financial, warehouseStock, recentSales, recentActivity, lowStock] = await Promise.all([
    getDashboardStats(),
    getSalesTrend(30),
    getFinancialBreakdown(),
    getWarehouseStockSummary(),
    getRecentSales(5),
    getRecentActivity(5),
    getLowStockAlerts(5),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-semibold text-foreground">Welcome Back</h2>
        <Button render={<Link href="/sales/new" />} nativeButton={false}>
          <ShoppingCart />
          New Sale
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <StatCard label="Total Revenue" value={formatNaira(stats.totalRevenue)} icon={Wallet} />
        <StatCard label="Total Orders" value={stats.totalOrders.toLocaleString()} icon={ShoppingCart} />
        <StatCard label="Total Customers" value={stats.totalCustomers.toLocaleString()} icon={Users} />
        <StatCard label="Total Agents" value={stats.totalAgents.toLocaleString()} icon={User} />
        <StatCard label="Total Staff" value={stats.totalStaff.toLocaleString()} icon={UsersRound} />
        <StatCard label="Total Products" value={stats.totalProducts.toLocaleString()} icon={Package} />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-4 p-5 lg:col-span-2">
          <h3 className="font-semibold text-foreground">Sales Overview</h3>
          <RevenueChart data={trend} />
        </Card>

        <Card className="gap-4 p-5">
          <h3 className="font-semibold text-foreground">Financial Overview</h3>
          <DonutChart
            centerLabel="Total Profit"
            centerValue={financial.totalProfit}
            data={[
              { label: "Total Revenue", value: financial.totalRevenue },
              { label: "Total Expenses", value: financial.totalExpenses },
            ]}
          />
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="gap-4 p-0 lg:col-span-2">
          <div className="flex items-center justify-between border-b border-border p-5 pb-4">
            <h3 className="font-semibold text-foreground">Recent Sales</h3>
            <Button variant="outline" size="sm" render={<Link href="/sales" />} nativeButton={false}>
              View All
            </Button>
          </div>
          <div className="p-5 pt-0">
            {recentSales.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Invoice No</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSales.map((sale) => (
                    <TableRow key={sale.id}>
                      <TableCell className="font-medium text-foreground">{sale.number}</TableCell>
                      <TableCell>{sale.customerName}</TableCell>
                      <TableCell>{formatNaira(sale.total)}</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={SALE_STATUS_LABELS[sale.status]}
                          variant={SALE_STATUS_VARIANT[sale.status]}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState icon={ShoppingCart} title="No sales yet" description="Recent sales will appear here." />
            )}
          </div>
        </Card>

        <Card className="gap-4 p-0">
          <div className="flex items-center justify-between border-b border-border p-5 pb-4">
            <h3 className="font-semibold text-foreground">Warehouse Stock</h3>
          </div>
          <div className="space-y-4 p-5 pt-0">
            <div className="flex items-center gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Warehouse className="size-5" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{warehouseStock.totalItems.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Total items in stock</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <div>
                <p className="text-muted-foreground">Low Stock Items</p>
                <p className="font-semibold text-warning">{warehouseStock.lowStockItems}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Out of Stock Items</p>
                <p className="font-semibold text-destructive">{warehouseStock.outOfStockItems}</p>
              </div>
            </div>
            <Button
              variant="outline"
              className="w-full"
              render={<Link href="/warehouses" />}
              nativeButton={false}
            >
              View Warehouse
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="gap-4 p-0">
          <div className="flex items-center justify-between border-b border-border p-5 pb-4">
            <h3 className="font-semibold text-foreground">Recent Activity</h3>
          </div>
          <div className="p-5 pt-0">
            {recentActivity.length > 0 ? (
              <div className="divide-y divide-border">
                {recentActivity.map((activity, index) => {
                  const Icon = ACTIVITY_ICONS[activity.icon];
                  return (
                    <div key={index} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Icon className="size-4" />
                        </div>
                        <span className="text-foreground">{activity.text}</span>
                      </div>
                      <span className="shrink-0 text-xs text-muted-foreground">{timeAgo(activity.date)}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <EmptyState icon={UserPlus} title="No activity yet" description="Recent activity will appear here." />
            )}
          </div>
        </Card>

        <Card className="gap-4 p-0">
          <div className="flex items-center justify-between border-b border-border p-5 pb-4">
            <h3 className="font-semibold text-foreground">Low Stock Alert</h3>
            <Button variant="outline" size="sm" render={<Link href="/products" />} nativeButton={false}>
              View All
            </Button>
          </div>
          <div className="p-5 pt-0">
            {lowStock.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Available Stock</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lowStock.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell className="font-medium text-foreground">{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>
                        <StatusBadge
                          label={item.status === "out" ? "Out of Stock" : "Low"}
                          variant={item.status === "out" ? "danger" : "warning"}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState icon={Package} title="All stocked up" description="No low-stock products right now." />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
