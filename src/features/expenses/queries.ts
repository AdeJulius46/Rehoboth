import { db } from "@/lib/db";

const SORTABLE_FIELDS = ["number", "date", "amount", "createdAt"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export type ListExpensesParams = {
  q?: string;
  status?: string;
  category?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
};

export async function listExpenses(params: ListExpensesParams) {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), 100);

  const where = {
    ...(params.q
      ? {
          OR: [
            { number: { contains: params.q, mode: "insensitive" as const } },
            { description: { contains: params.q, mode: "insensitive" as const } },
            { vendor: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.status && params.status !== "all"
      ? { status: params.status as "PENDING" | "APPROVED" | "REJECTED" }
      : {}),
    ...(params.category && params.category !== "all" ? { category: params.category } : {}),
  };

  const orderBy = isSortableField(params.sortBy)
    ? { [params.sortBy]: params.sortDir === "desc" ? ("desc" as const) : ("asc" as const) }
    : { createdAt: "desc" as const };

  const [expenses, totalItems] = await Promise.all([
    db.expense.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { paidBy: true },
    }),
    db.expense.count({ where }),
  ]);

  const rows = expenses.map((expense) => {
    const { paidBy, ...rest } = expense;
    return { ...rest, amount: Number(expense.amount), paidByName: paidBy?.name ?? null };
  });

  return { rows, totalItems, page, pageSize };
}

export type ExpenseListRow = Awaited<ReturnType<typeof listExpenses>>["rows"][number];

export async function getExpenseStats() {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(startOfToday);
  startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalAgg, monthAgg, weekAgg, todayAgg] = await Promise.all([
    db.expense.aggregate({ _sum: { amount: true } }),
    db.expense.aggregate({ where: { date: { gte: startOfMonth } }, _sum: { amount: true } }),
    db.expense.aggregate({ where: { date: { gte: startOfWeek } }, _sum: { amount: true } }),
    db.expense.aggregate({ where: { date: { gte: startOfToday } }, _sum: { amount: true } }),
  ]);

  return {
    total: Number(totalAgg._sum.amount ?? 0),
    thisMonth: Number(monthAgg._sum.amount ?? 0),
    thisWeek: Number(weekAgg._sum.amount ?? 0),
    today: Number(todayAgg._sum.amount ?? 0),
  };
}

export async function getExpenseById(id: string) {
  const expense = await db.expense.findUnique({ where: { id }, include: { paidBy: true, approvedBy: true } });
  if (!expense) return null;

  return { ...expense, amount: Number(expense.amount) };
}

export async function generateExpenseNumber() {
  const year = new Date().getFullYear();
  const prefix = `EXP-${year}-`;
  const last = await db.expense.findFirst({
    where: { number: { startsWith: prefix } },
    orderBy: { number: "desc" },
    select: { number: true },
  });
  const lastSeq = last ? parseInt(last.number.slice(prefix.length), 10) : 0;
  return `${prefix}${String(lastSeq + 1).padStart(5, "0")}`;
}

export async function getPaidByOptions() {
  const staff = await db.staff.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, name: true, position: true },
    orderBy: { name: "asc" },
  });
  return staff.map((s) => ({ value: s.id, label: s.name, description: s.position }));
}
