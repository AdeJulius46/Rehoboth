import { db } from "@/lib/db";

export type NotificationsData = {
  lowStock: { id: string; productId: string; name: string; quantity: number; status: "out" | "low" }[];
  overdueInvoices: { id: string; number: string; dueDate: Date; total: number }[];
  recentPayments: { id: string; reference: string; amount: number }[];
  recentSales: { id: string; number: string; customerName: string; total: number }[];
  pendingExpenses: { id: string; description: string; amount: number }[];
  newStaff: { id: string; name: string }[];
  totalCount: number;
};

const RECENT_DAYS = 3;
const NEW_STAFF_DAYS = 7;
const SECTION_LIMIT = 5;

export async function getNotifications(): Promise<NotificationsData> {
  const recentSince = new Date();
  recentSince.setDate(recentSince.getDate() - RECENT_DAYS);

  const staffSince = new Date();
  staffSince.setDate(staffSince.getDate() - NEW_STAFF_DAYS);

  const [stock, overdueInvoices, recentPayments, recentSales, pendingExpenses, newStaff] = await Promise.all([
    db.stock.findMany({
      include: { product: { select: { id: true, name: true, reorderLevel: true } } },
    }),
    db.invoice.findMany({
      where: { dueDate: { lt: new Date() }, status: { not: "PAID" } },
      orderBy: { dueDate: "asc" },
      take: SECTION_LIMIT,
    }),
    db.payment.findMany({
      where: { status: "COMPLETED", createdAt: { gte: recentSince } },
      orderBy: { createdAt: "desc" },
      take: SECTION_LIMIT,
    }),
    db.sale.findMany({
      where: { createdAt: { gte: recentSince } },
      orderBy: { createdAt: "desc" },
      take: SECTION_LIMIT,
      include: { customer: { select: { name: true } } },
    }),
    db.expense.findMany({
      where: { status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: SECTION_LIMIT,
    }),
    db.staff.findMany({
      where: { createdAt: { gte: staffSince } },
      orderBy: { createdAt: "desc" },
      take: SECTION_LIMIT,
    }),
  ]);

  const lowStock = stock
    .filter((s) => s.quantity <= s.product.reorderLevel)
    .sort((a, b) => a.quantity - b.quantity)
    .slice(0, SECTION_LIMIT)
    .map((s) => ({
      id: s.id,
      productId: s.product.id,
      name: s.product.name,
      quantity: s.quantity,
      status: (s.quantity === 0 ? "out" : "low") as "out" | "low",
    }));

  const overdue = overdueInvoices.map((inv) => ({
    id: inv.id,
    number: inv.number,
    dueDate: inv.dueDate,
    total: Number(inv.total),
  }));

  const payments = recentPayments.map((p) => ({
    id: p.id,
    reference: p.reference,
    amount: Number(p.amount),
  }));

  const sales = recentSales.map((s) => ({
    id: s.id,
    number: s.number,
    customerName: s.customer.name,
    total: Number(s.total),
  }));

  const expenses = pendingExpenses.map((e) => ({
    id: e.id,
    description: e.description,
    amount: Number(e.amount),
  }));

  const staff = newStaff.map((s) => ({ id: s.id, name: s.name }));

  const totalCount = lowStock.length + overdue.length + payments.length + sales.length + expenses.length + staff.length;

  return {
    lowStock,
    overdueInvoices: overdue,
    recentPayments: payments,
    recentSales: sales,
    pendingExpenses: expenses,
    newStaff: staff,
    totalCount,
  };
}
