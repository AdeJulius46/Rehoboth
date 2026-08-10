import { db } from "@/lib/db";

const SORTABLE_FIELDS = ["number", "issueDate", "dueDate", "total", "createdAt"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export type ListInvoicesParams = {
  q?: string;
  status?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
};

export async function listInvoices(params: ListInvoicesParams) {
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
      ? { status: params.status as "DRAFT" | "SENT" | "PAID" | "OVERDUE" }
      : {}),
  };

  const orderBy = isSortableField(params.sortBy)
    ? { [params.sortBy]: params.sortDir === "desc" ? ("desc" as const) : ("asc" as const) }
    : { createdAt: "desc" as const };

  const [invoices, totalItems] = await Promise.all([
    db.invoice.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        customer: true,
        agent: true,
        payments: { where: { status: "COMPLETED" }, select: { amount: true } },
      },
    }),
    db.invoice.count({ where }),
  ]);

  const rows = invoices.map((invoice) => {
    const { customer, agent, payments, ...rest } = invoice;
    const paidAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const total = Number(invoice.total);
    return {
      ...rest,
      subtotal: Number(invoice.subtotal),
      discount: Number(invoice.discount),
      tax: Number(invoice.tax),
      total,
      paidAmount,
      dueAmount: Math.max(total - paidAmount, 0),
      customerName: customer.name,
      agentName: agent?.name ?? null,
    };
  });

  return { rows, totalItems, page, pageSize };
}

export type InvoiceListRow = Awaited<ReturnType<typeof listInvoices>>["rows"][number];

export async function getInvoiceStats() {
  const [total, invoices, overdue] = await Promise.all([
    db.invoice.count(),
    db.invoice.findMany({
      include: { payments: { where: { status: "COMPLETED" }, select: { amount: true } } },
    }),
    db.invoice.count({ where: { status: "OVERDUE" } }),
  ]);

  let totalInvoiced = 0;
  let totalPaid = 0;
  for (const invoice of invoices) {
    totalInvoiced += Number(invoice.total);
    totalPaid += invoice.payments.reduce((sum, p) => sum + Number(p.amount), 0);
  }

  return {
    total,
    totalInvoiced,
    totalPaid,
    totalOutstanding: Math.max(totalInvoiced - totalPaid, 0),
    overdue,
  };
}

export async function getInvoiceById(id: string) {
  const invoice = await db.invoice.findUnique({
    where: { id },
    include: {
      customer: true,
      agent: true,
      items: { include: { product: true } },
      payments: { orderBy: { date: "desc" } },
      sale: { select: { id: true, number: true } },
    },
  });
  if (!invoice) return null;

  const paidAmount = invoice.payments
    .filter((p) => p.status === "COMPLETED")
    .reduce((sum, p) => sum + Number(p.amount), 0);
  const total = Number(invoice.total);

  return {
    ...invoice,
    subtotal: Number(invoice.subtotal),
    discount: Number(invoice.discount),
    tax: Number(invoice.tax),
    total,
    paidAmount,
    dueAmount: Math.max(total - paidAmount, 0),
    items: invoice.items.map((item) => ({
      ...item,
      unitPrice: Number(item.unitPrice),
      discount: Number(item.discount),
      lineTotal: Number(item.lineTotal),
    })),
    payments: invoice.payments.map((p) => ({ ...p, amount: Number(p.amount) })),
  };
}

export async function generateInvoiceNumber() {
  const year = new Date().getFullYear();
  const prefix = `INV-${year}-`;
  const last = await db.invoice.findFirst({
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

export async function getProductPickerOptions() {
  const products = await db.product.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, sku: true, sellingPrice: true },
    orderBy: { name: "asc" },
  });
  return products.map((p) => ({ id: p.id, name: p.name, sku: p.sku, sellingPrice: Number(p.sellingPrice) }));
}
