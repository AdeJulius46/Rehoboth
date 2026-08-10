import { db } from "@/lib/db";

export async function getDashboardStats() {
  const [revenueAgg, totalOrders, totalCustomers, totalAgents, totalStaff, totalProducts] = await Promise.all([
    db.sale.aggregate({ where: { status: "COMPLETED" }, _sum: { total: true } }),
    db.sale.count(),
    db.customer.count(),
    db.agent.count(),
    db.staff.count(),
    db.product.count(),
  ]);

  return {
    totalRevenue: Number(revenueAgg._sum.total ?? 0),
    totalOrders,
    totalCustomers,
    totalAgents,
    totalStaff,
    totalProducts,
  };
}

export async function getReportStats() {
  const [revenueAgg, totalOrders, expenseAgg] = await Promise.all([
    db.sale.aggregate({ where: { status: "COMPLETED" }, _sum: { total: true } }),
    db.sale.count(),
    db.expense.aggregate({ _sum: { amount: true } }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.total ?? 0);
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);

  return {
    totalRevenue,
    totalOrders,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
  };
}

export async function getFinancialBreakdown() {
  const [revenueAgg, expenseAgg] = await Promise.all([
    db.sale.aggregate({ where: { status: "COMPLETED" }, _sum: { total: true } }),
    db.expense.aggregate({ _sum: { amount: true } }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.total ?? 0);
  const totalExpenses = Number(expenseAgg._sum.amount ?? 0);

  return {
    totalRevenue,
    totalExpenses,
    totalProfit: totalRevenue - totalExpenses,
  };
}

export async function getSalesTrend(days = 30) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);

  const sales = await db.sale.findMany({
    where: { status: "COMPLETED", date: { gte: since } },
    select: { date: true, total: true },
  });

  const byDay = new Map<string, number>();
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    byDay.set(d.toISOString().slice(0, 10), 0);
  }
  for (const sale of sales) {
    const key = new Date(sale.date).toISOString().slice(0, 10);
    if (byDay.has(key)) {
      byDay.set(key, (byDay.get(key) ?? 0) + Number(sale.total));
    }
  }

  return Array.from(byDay.entries()).map(([date, revenue]) => ({ date, revenue }));
}

export async function getSalesByCategory() {
  const items = await db.saleItem.findMany({
    where: { sale: { status: "COMPLETED" } },
    select: { lineTotal: true, product: { select: { category: true } } },
  });

  const byCategory = new Map<string, number>();
  for (const item of items) {
    const key = item.product.category;
    byCategory.set(key, (byCategory.get(key) ?? 0) + Number(item.lineTotal));
  }

  return Array.from(byCategory.entries())
    .map(([category, value]) => ({ category, value }))
    .sort((a, b) => b.value - a.value);
}

export async function getTopSellingProducts(limit = 5) {
  const grouped = await db.saleItem.groupBy({
    by: ["productId"],
    where: { sale: { status: "COMPLETED" } },
    _sum: { quantity: true, lineTotal: true },
  });

  const totalRevenue = grouped.reduce((sum, g) => sum + Number(g._sum.lineTotal ?? 0), 0);
  const sorted = grouped
    .map((g) => ({
      productId: g.productId,
      unitsSold: g._sum.quantity ?? 0,
      totalSales: Number(g._sum.lineTotal ?? 0),
    }))
    .sort((a, b) => b.totalSales - a.totalSales)
    .slice(0, limit);

  const products = await db.product.findMany({
    where: { id: { in: sorted.map((s) => s.productId) } },
    select: { id: true, name: true },
  });
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  return sorted.map((row) => ({
    ...row,
    name: nameById.get(row.productId) ?? "Unknown product",
    percentage: totalRevenue > 0 ? Math.round((row.totalSales / totalRevenue) * 1000) / 10 : 0,
  }));
}

export async function getRecentSales(limit = 5) {
  const sales = await db.sale.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    include: { customer: true },
  });

  return sales.map((sale) => ({
    id: sale.id,
    number: sale.number,
    customerName: sale.customer.name,
    total: Number(sale.total),
    status: sale.status,
  }));
}

export async function getLowStockAlerts(limit = 5) {
  const stock = await db.stock.findMany({
    include: { product: { select: { id: true, name: true, reorderLevel: true } } },
  });

  return stock
    .filter((s) => s.quantity <= s.product.reorderLevel)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, limit)
    .map((s) => ({
      productId: s.product.id,
      name: s.product.name,
      quantity: s.quantity,
      status: s.quantity === 0 ? ("out" as const) : ("low" as const),
    }));
}

export async function getWarehouseStockSummary() {
  const stock = await db.stock.findMany({ include: { product: { select: { reorderLevel: true } } } });

  const totalItems = stock.reduce((sum, s) => sum + s.quantity, 0);
  const lowStockItems = stock.filter((s) => s.quantity > 0 && s.quantity <= s.product.reorderLevel).length;
  const outOfStockItems = stock.filter((s) => s.quantity === 0).length;

  return { totalItems, lowStockItems, outOfStockItems };
}

type RecentActivityItem = { icon: "sale" | "payment" | "product" | "customer"; text: string; date: Date };

export async function getRecentActivity(limit = 5): Promise<RecentActivityItem[]> {
  const [sales, payments, products, customers] = await Promise.all([
    db.sale.findMany({ orderBy: { createdAt: "desc" }, take: limit, include: { customer: true } }),
    db.payment.findMany({ orderBy: { createdAt: "desc" }, take: limit, where: { status: "COMPLETED" } }),
    db.product.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
    db.customer.findMany({ orderBy: { createdAt: "desc" }, take: limit }),
  ]);

  const items: RecentActivityItem[] = [
    ...sales.map((s) => ({
      icon: "sale" as const,
      text: `New sale recorded for ${s.customer.name}`,
      date: s.createdAt,
    })),
    ...payments.map((p) => ({
      icon: "payment" as const,
      text: `Payment of ${Number(p.amount).toLocaleString("en-NG", { style: "currency", currency: "NGN" })} received`,
      date: p.createdAt,
    })),
    ...products.map((p) => ({
      icon: "product" as const,
      text: `New product "${p.name}" added`,
      date: p.createdAt,
    })),
    ...customers.map((c) => ({
      icon: "customer" as const,
      text: `New customer registered: ${c.name}`,
      date: c.createdAt,
    })),
  ];

  return items.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
}
