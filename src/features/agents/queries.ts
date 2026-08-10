import { db } from "@/lib/db";

const SORTABLE_FIELDS = ["name", "email", "createdAt", "commissionRate"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export type ListAgentsParams = {
  q?: string;
  status?: string;
  agentType?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
};

export async function listAgents(params: ListAgentsParams) {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), 100);

  const where = {
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } },
            { phone: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.status && params.status !== "all" ? { status: params.status as "ACTIVE" | "INACTIVE" } : {}),
    ...(params.agentType && params.agentType !== "all"
      ? { agentType: params.agentType as "SALES" | "COLLECTION" }
      : {}),
  };

  const orderBy = isSortableField(params.sortBy)
    ? { [params.sortBy]: params.sortDir === "desc" ? ("desc" as const) : ("asc" as const) }
    : { createdAt: "desc" as const };

  const [agents, totalItems] = await Promise.all([
    db.agent.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    db.agent.count({ where }),
  ]);

  const rows = agents.map((agent) => ({
    ...agent,
    commissionRate: Number(agent.commissionRate),
  }));

  return { rows, totalItems, page, pageSize };
}

export type AgentListRow = Awaited<ReturnType<typeof listAgents>>["rows"][number];

export async function getAgentStats() {
  const [total, active, inactive] = await Promise.all([
    db.agent.count(),
    db.agent.count({ where: { status: "ACTIVE" } }),
    db.agent.count({ where: { status: "INACTIVE" } }),
  ]);

  return { total, active, inactive };
}

export async function getAgentById(id: string) {
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent) return null;

  return { ...agent, commissionRate: Number(agent.commissionRate) };
}
