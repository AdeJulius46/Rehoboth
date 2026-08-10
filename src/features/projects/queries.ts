import { db } from "@/lib/db";

const SORTABLE_FIELDS = ["name", "code", "startDate", "endDate", "budget", "createdAt"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export type ListProjectsParams = {
  q?: string;
  status?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
};

export async function listProjects(params: ListProjectsParams) {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), 100);

  const where = {
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { code: { contains: params.q, mode: "insensitive" as const } },
            { customer: { name: { contains: params.q, mode: "insensitive" as const } } },
            { agent: { name: { contains: params.q, mode: "insensitive" as const } } },
          ],
        }
      : {}),
    ...(params.status && params.status !== "all"
      ? { status: params.status as "ACTIVE" | "COMPLETED" | "ON_HOLD" | "CANCELLED" }
      : {}),
  };

  const orderBy = isSortableField(params.sortBy)
    ? { [params.sortBy]: params.sortDir === "desc" ? ("desc" as const) : ("asc" as const) }
    : { createdAt: "desc" as const };

  const [projects, totalItems] = await Promise.all([
    db.project.findMany({
      where,
      orderBy,
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { customer: true, agent: true },
    }),
    db.project.count({ where }),
  ]);

  const rows = projects.map((project) => ({
    ...project,
    budget: Number(project.budget),
    customerName: project.customer?.name ?? null,
    agentName: project.agent?.name ?? null,
  }));

  return { rows, totalItems, page, pageSize };
}

export type ProjectListRow = Awaited<ReturnType<typeof listProjects>>["rows"][number];

export async function getProjectStats() {
  const [total, active, completed, onHold, valueAgg] = await Promise.all([
    db.project.count(),
    db.project.count({ where: { status: "ACTIVE" } }),
    db.project.count({ where: { status: "COMPLETED" } }),
    db.project.count({ where: { status: "ON_HOLD" } }),
    db.project.aggregate({ _sum: { budget: true } }),
  ]);

  return {
    total,
    active,
    completed,
    onHold,
    totalValue: Number(valueAgg._sum.budget ?? 0),
  };
}

export async function getProjectById(id: string) {
  const project = await db.project.findUnique({
    where: { id },
    include: { customer: true, agent: true },
  });
  if (!project) return null;

  return { ...project, budget: Number(project.budget) };
}

export async function getProjectsByCustomer(customerId: string, take = 5) {
  const projects = await db.project.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take,
  });
  return projects.map((project) => ({ ...project, budget: Number(project.budget) }));
}

export async function generateProjectCode() {
  const year = new Date().getFullYear();
  const prefix = `PRJ-${year}-`;
  const last = await db.project.findFirst({
    where: { code: { startsWith: prefix } },
    orderBy: { code: "desc" },
    select: { code: true },
  });
  const lastSeq = last ? parseInt(last.code.slice(prefix.length), 10) : 0;
  return `${prefix}${String(lastSeq + 1).padStart(4, "0")}`;
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
