import { db } from "@/lib/db";

const SORTABLE_FIELDS = ["name", "email", "createdAt", "openingBalance"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export type ListCustomersParams = {
  q?: string;
  status?: string;
  type?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
};

export async function listCustomers(params: ListCustomersParams) {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), 100);

  const where = {
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } },
            { phone: { contains: params.q, mode: "insensitive" as const } },
            { companyName: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.status && params.status !== "all" ? { status: params.status as "ACTIVE" | "INACTIVE" } : {}),
    ...(params.type && params.type !== "all" ? { type: params.type as "INDIVIDUAL" | "BUSINESS" } : {}),
  };

  const orderBy = isSortableField(params.sortBy)
    ? { [params.sortBy]: params.sortDir === "desc" ? ("desc" as const) : ("asc" as const) }
    : { createdAt: "desc" as const };

  const [customers, totalItems] = await Promise.all([
    db.customer.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.customer.count({ where }),
  ]);

  const rows = customers.map((customer) => ({
    ...customer,
    creditLimit: customer.creditLimit ? Number(customer.creditLimit) : null,
    openingBalance: Number(customer.openingBalance),
  }));

  return { rows, totalItems, page, pageSize };
}

export type CustomerListRow = Awaited<ReturnType<typeof listCustomers>>["rows"][number];

export async function getCustomerStats() {
  const [total, active, inactive, newThisMonth, outstanding] = await Promise.all([
    db.customer.count(),
    db.customer.count({ where: { status: "ACTIVE" } }),
    db.customer.count({ where: { status: "INACTIVE" } }),
    db.customer.count({
      where: { createdAt: { gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) } },
    }),
    db.customer.aggregate({ _sum: { openingBalance: true } }),
  ]);

  return {
    total,
    active,
    inactive,
    newThisMonth,
    totalOutstanding: Number(outstanding._sum.openingBalance ?? 0),
  };
}

export async function getCustomerById(id: string) {
  const customer = await db.customer.findUnique({ where: { id } });
  if (!customer) return null;

  return {
    ...customer,
    creditLimit: customer.creditLimit ? Number(customer.creditLimit) : null,
    openingBalance: Number(customer.openingBalance),
  };
}
