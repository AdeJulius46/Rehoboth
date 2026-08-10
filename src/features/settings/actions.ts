"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { Role } from "@/lib/constants";
import { generateEmployeeId } from "@/features/staffs/queries";
import { SYSTEM_ADMIN_EMAIL } from "@/features/settings/constants";

export type ActionResult = { success: true } | { success: false; error: string };

async function requireAdmin() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return { session: null, error: "Only an administrator can do this." } as const;
  }
  return { session, error: null } as const;
}

export async function approveUser(userId: string): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { success: false, error };

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "PENDING") {
    return { success: false, error: "This account is no longer pending." };
  }

  const role = user.requestedRole ?? user.role;

  await db.user.update({ where: { id: userId }, data: { status: "ACTIVE", role } });

  if (role === "STAFF") {
    const existingStaff = await db.staff.findUnique({ where: { userId } });
    if (!existingStaff) {
      try {
        const employeeId = await generateEmployeeId();
        await db.staff.create({
          data: {
            userId,
            employeeId,
            name: user.name,
            email: user.email,
            phone: user.phone ?? "",
            department: user.department ?? "General",
            position: user.jobTitle ?? "Staff",
            salary: 0,
            hireDate: new Date(),
            status: "ACTIVE",
          },
        });
      } catch (staffError) {
        // Approval itself already succeeded — don't fail the whole action over the HR
        // record (e.g. a manually-created Staff row already has this email). The admin
        // can add the HR profile by hand via Staffs → Add Staff if this happens.
        console.error("Failed to auto-create Staff record for approved user", userId, staffError);
      }
    }
  }

  revalidatePath("/settings");
  revalidatePath("/staffs");
  return { success: true };
}

export async function rejectUser(userId: string): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { success: false, error };

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user || user.status !== "PENDING") {
    return { success: false, error: "This account is no longer pending." };
  }

  await db.user.update({ where: { id: userId }, data: { status: "INACTIVE" } });

  revalidatePath("/settings");
  return { success: true };
}

export async function updateUserRole(userId: string, role: Role): Promise<ActionResult> {
  const { session, error } = await requireAdmin();
  if (!session) return { success: false, error };

  if (session.user.id === userId) {
    return { success: false, error: "You can't change your own role." };
  }

  const user = await db.user.findUnique({ where: { id: userId } });
  if (!user) {
    return { success: false, error: "User not found." };
  }
  if (user.role === role) {
    return { success: true };
  }

  if (user.email === SYSTEM_ADMIN_EMAIL) {
    return { success: false, error: "The system admin account's role can't be changed." };
  }

  if (user.role === "ADMIN" && role !== "ADMIN") {
    const adminCount = await db.user.count({ where: { role: "ADMIN", status: "ACTIVE" } });
    if (adminCount <= 1) {
      return { success: false, error: "There must be at least one admin." };
    }
  }

  await db.user.update({ where: { id: userId }, data: { role } });

  revalidatePath("/settings");
  return { success: true };
}
