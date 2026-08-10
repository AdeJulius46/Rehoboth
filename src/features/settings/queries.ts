import { db } from "@/lib/db";

export async function getPendingUsers() {
  return db.user.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      jobTitle: true,
      department: true,
      requestedRole: true,
      createdAt: true,
    },
  });
}

export async function getAllUsers() {
  return db.user.findMany({
    where: { status: { in: ["ACTIVE", "INACTIVE"] } },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      createdAt: true,
    },
  });
}
