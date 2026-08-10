import { db } from "@/lib/db";

const SORTABLE_FIELDS = ["number", "date", "total", "createdAt"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export type ListSalesParams = {
  q?: string;
  status?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
};

export async function listSales(params: ListSalesParams) {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), 100);

  const where = {
    ...(params.q
      ? {
          OR: [
            { number: { contains: params.q, mode: "insensitive" as const } },
            { customer: { name: { contains: params.q, mode: "insensitive" as const } } },
            { agent: { name: { contains: params.q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(params.status && params.status !== "all"
      ? { status: params.status as "PENDING" | "COMPLETED" | "CANCELLED" }
      : {}),
  };

  const orderBy = isSortableField(params.sortBy)
    ? { [params.sortBy]: params.sortDir === "desc" ? ("desc" as const) : ("asc" as const) }
    : { createdAt: "desc" as const };

  const [sales, totalItems] = await Promise.all([
    db.sale.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: true, agent: true, items: true, invoice: { select: { status: true } } },
    }),
    db.sale.count({ where }),
  ]);

  const rows = sales.map((sale) => {
    const { items, customer, agent, invoice, ...rest } = sale;
    return {
      ...rest,
      subtotal: Number(sale.subtotal),
      tax: Number(sale.tax),
      total: Number(sale.total),
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      agentName: agent?.name ?? null,
      itemCount: items.length,
      invoiceStatus: invoice?.status ?? null,
    };
  });

  return { rows, totalItems, page, pageSize };
}

export type SaleListRow = Awaited<ReturnType<typeof listSales>>["rows"][number];

export async function getSaleStats() {
  const [totalOrders, pendingSales, revenueAgg, distinctCustomers] = await Promise.all([
    db.sale.count(),
    db.sale.count({ where: { status: "PENDING" } }),
    db.sale.aggregate({ where: { status: "COMPLETED" }, _sum: { total: true } }),
    db.sale.findMany({ distinct: ["customerId"], select: { customerId: true } }),
  ]);

  return {
    totalRevenue: Number(revenueAgg._sum.total ?? 0),
    totalOrders,
    totalCustomers: distinctCustomers.length,
    pendingSales,
  };
}

export async function getSaleById(id: string) {
  const sale = await db.sale.findUnique({
    where: { id },
    include: {
      customer: true,
      agent: true,
      warehouse: true,
      items: { include: { product: true } },
      invoice: { select: { id: true, number: true, status: true } },
    },
  });
  if (!sale) return null;

  return {
    ...sale,
    subtotal: Number(sale.subtotal),
    tax: Number(sale.tax),
    total: Number(sale.total),
    items: sale.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount),
      lineTotal: Number(item.lineTotal),
      product: { ...item.product, costPrice: Number(item.product.costPrice), sellingPrice: Number(item.product.sellingPrice) },
    })),
  };
}

export async function getRecentSalesByCustomer(customerId: string, take = 5) {
  const sales = await db.sale.findMany({
    where: { customerId },
    orderBy: { date: "desc" },
    take,
  });
  return sales.map((sale) => ({ ...sale, total: Number(sale.total) }));
}

export async function getRecentSalesByAgent(agentId: string, take = 5) {
  const sales = await db.sale.findMany({
    where: { agentId },
    include: { customer: true },
    orderBy: { date: "desc" },
    take,
  });
  return sales.map((sale) => ({ ...sale, total: Number(sale.total), customerName: sale.customer.name }));
}

export async function generateSaleNumber() {
  const year = new Date().getFullYear();
  const prefix = `SALE-${year}-`;
  const last = await db.sale.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const lastSeq = last ? parseInt(last.number.slice(prefix.length), 10) : 0;
  return `${prefix}${String(lastSeq + 1).padStart(5, "0")}`;
}

export async function getCustomerOptions() {
  const customers = await db.customer.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, companyName: true },
    orderBy: { name: "asc" },
  });
  return customers.map((c) => ({ value: c.id, label: c.companyName ? `${c.name} (${c.companyName})` : c.name }));
}

export async function getAgentOptions() {
  const agents = await db.agent.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, region: true },
    orderBy: { name: "asc" },
  });
  return agents.map((a) => ({ value: a.id, label: a.name, description: a.region }));
}

export async function getWarehouseOptions() {
  const warehouses = await db.warehouse.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, code: true },
    orderBy: { name: "asc" },
  });
  return warehouses.map((w) => ({ value: w.id, label: w.name, description: w.code }));
}

export async function getProductPickerOptions() {
  const products = await db.product.findMany({
    where: { status: "ACTIVE" },
    select: {
      id: true,
      name: true,
      sku: true,
      sellingPrice: true,
      stock: { select: { warehouseId: true, quantity: true } },
    },
    orderBy: { name: "asc" },
  });

  return products.map((product) => ({
    id: product.id,
    name: product.name,
    sku: product.sku,
    sellingPrice: Number(product.sellingPrice),
    stockByWarehouse: Object.fromEntries(product.stock.map((s) => [s.warehouseId, s.quantity])),
  }));
}
