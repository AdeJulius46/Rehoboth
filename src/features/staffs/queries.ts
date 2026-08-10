import { db } from "@/lib/db";

const SORTABLE_FIELDS = ["name", "email", "createdAt", "salary", "hireDate"] as const;
type SortableField = (typeof SORTABLE_FIELDS)[number];

function isSortableField(value: string | undefined): value is SortableField {
  return !!value && (SORTABLE_FIELDS as readonly string[]).includes(value);
}

export type ListStaffsParams = {
  q?: string;
  status?: string;
  department?: string;
  sortBy?: string;
  sortDir?: string;
  page?: number;
  pageSize?: number;
};

export async function listStaffs(params: ListStaffsParams) {
  const page = Math.max(params.page ?? 1, 1);
  const pageSize = Math.min(Math.max(params.pageSize ?? 25, 1), 100);

  const where = {
    ...(params.q
      ? {
          OR: [
            { name: { contains: params.q, mode: "insensitive" as const } },
            { email: { contains: params.q, mode: "insensitive" as const } },
            { phone: { contains: params.q, mode: "insensitive" as const } },
            { employeeId: { contains: params.q, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(params.status && params.status !== "all" ? { status: params.status as "ACTIVE" | "INACTIVE" } : {}),
    ...(params.department && params.department !== "all" ? { department: params.department } : {}),
  };

  const orderBy = isSortableField(params.sortBy)
    ? { [params.sortBy]: params.sortDir === "desc" ? ("desc" as const) : ("asc" as const) }
    : { createdAt: "desc" as const };

  const [staffs, totalItems] = await Promise.all([
    db.staff.findMany({ where, orderBy, skip: (page - 1) * pageSize, take: pageSize }),
    db.staff.count({ where }),
  ]);

  const rows = staffs.map((staff) => ({ ...staff, salary: Number(staff.salary) }));

  return { rows, totalItems, page, pageSize };
}

export type StaffListRow = Awaited<ReturnType<typeof listStaffs>>["rows"][number];

export async function getStaffStats() {
  const [total, active, inactive, payroll] = await Promise.all([
    db.staff.count(),
    db.staff.count({ where: { status: "ACTIVE" } }),
    db.staff.count({ where: { status: "INACTIVE" } }),
    db.staff.aggregate({ _sum: { salary: true } }),
  ]);

  return { total, active, inactive, totalPayroll: Number(payroll._sum.salary ?? 0) };
}

export async function getStaffById(id: string) {
  const staff = await db.staff.findUnique({ where: { id } });
  if (!staff) return null;

  return { ...staff, salary: Number(staff.salary) };
}

export async function generateEmployeeId() {
  const prefix = "STAFF-";
  const last = await db.staff.findFirst({ orderBy: { employeeId: "desc" }, select: { employeeId: true } });
  const lastSeq = last ? parseInt(last.employeeId.slice(prefix.length), 10) : 0;
  return `${prefix}${String(lastSeq + 1).padStart(4, "0")}`;
}
