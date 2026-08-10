import { db } from "@/lib/db";

const SORTABLE_FIELDS = ["reference", "date", "amount", "createdAt"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export type ListPaymentsParams = {
  q?: string;
  status?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
};

export async function listPayments(params: ListPaymentsParams) {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), 100);

  const where = {
    ...(params.q
      ? {
          OR: [
            { reference: { contains: params.q, mode: "insensitive" as const } },
            { customer: { name: { contains: params.q, mode: "insensitive" as const } } },
            { invoice: { number: { contains: params.q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(params.status && params.status !== "all"
      ? { status: params.status as "PENDING" | "COMPLETED" | "FAILED" }
      : {}),
  };

  const orderBy = isSortableField(params.sortBy)
    ? { [params.sortBy]: params.sortDir === "desc" ? ("desc" as const) : ("asc" as const) }
    : { createdAt: "desc" as const };

  const [payments, totalItems] = await Promise.all([
    db.payment.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: true, invoice: true },
    }),
    db.payment.count({ where }),
  ]);

  const rows = payments.map((payment) => {
    const { customer, invoice, ...rest } = payment;
    return {
      ...rest,
      amount: Number(payment.amount),
      customerName: customer?.name ?? "—",
      customerPhone: customer?.phone ?? null,
      customerEmail: customer?.email ?? null,
      invoiceId: invoice?.id ?? null,
      invoiceNumber: invoice?.number ?? null,
      invoiceTotal: invoice ? Number(invoice.total) : null,
    };
  });

  return { rows, totalItems, page, pageSize };
}

export type PaymentListRow = Awaited<ReturnType<typeof listPayments>>["rows"][number];

export async function getPaymentStats() {
  const [totalAgg, receivedAgg, pendingAgg, failedAgg] = await Promise.all([
    db.payment.aggregate({ _sum: { amount: true } }),
    db.payment.aggregate({ where: { status: "COMPLETED" }, _sum: { amount: true } }),
    db.payment.aggregate({ where: { status: "PENDING" }, _sum: { amount: true } }),
    db.payment.aggregate({ where: { status: "FAILED" }, _sum: { amount: true } }),
  ]);

  return {
    total: Number(totalAgg._sum.amount ?? 0),
    received: Number(receivedAgg._sum.amount ?? 0),
    pending: Number(pendingAgg._sum.amount ?? 0),
    failed: Number(failedAgg._sum.amount ?? 0),
  };
}

export async function getPaymentById(id: string) {
  const payment = await db.payment.findUnique({
    where: { id },
    include: { customer: true, invoice: true },
  });
  if (!payment) return null;

  let balanceBeforePayment: number | null = null;
  if (payment.invoice) {
    const otherPayments = await db.payment.findMany({
      where: { invoiceId: payment.invoiceId, status: "COMPLETED", id: { not: payment.id } },
      select: { amount: true },
    });
    const otherPaid = otherPayments.reduce((sum, p) => sum + Number(p.amount), 0);
    balanceBeforePayment = Number(payment.invoice.total) - otherPaid;
  }

  return {
    ...payment,
    amount: Number(payment.amount),
    invoice: payment.invoice
      ? {
          ...payment.invoice,
          subtotal: Number(payment.invoice.subtotal),
          discount: Number(payment.invoice.discount),
          tax: Number(payment.invoice.tax),
          total: Number(payment.invoice.total),
        }
      : null,
    balanceBeforePayment,
  };
}

export async function getPaymentReceiptData(id: string) {
  const payment = await db.payment.findUnique({
    where: { id },
    include: {
      customer: true,
      invoice: { include: { items: true } },
    },
  });
  if (!payment) return null;

  return {
    ...payment,
    amount: Number(payment.amount),
    invoice: payment.invoice
      ? {
          ...payment.invoice,
          total: Number(payment.invoice.total),
          items: payment.invoice.items.map((item) => ({
            ...item,
            unitPrice: Number(item.unitPrice),
            discount: Number(item.discount),
            lineTotal: Number(item.lineTotal),
          })),
        }
      : null,
  };
}

export async function generatePaymentReference() {
  const year = new Date().getFullYear();
  const prefix = `PAY-${year}-`;
  const last = await db.payment.findFirst({
    where: { reference: { startsWith: prefix } },
    orderBy: { reference: "desc" },
    select: { reference: true },
  });
  const lastSeq = last ? parseInt(last.reference.slice(prefix.length), 10) : 0;
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

export async function getInvoiceOptions() {
  const invoices = await db.invoice.findMany({
    select: { id: true, number: true, customerId: true, total: true },
    orderBy: { number: "desc" },
  });
  return invoices.map((i) => ({ id: i.id, number: i.number, customerId: i.customerId, total: Number(i.total) }));
}
