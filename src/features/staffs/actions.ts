"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { staffSchema } from "@/features/staffs/schema";
import { generateEmployeeId } from "@/features/staffs/queries";

export type ActionResult = { success: true } | { success: false; error: string };

function parseStaffForm(formData: FormData) {
  return staffSchema.safeParse({
    name: formData.get("name"),
    position: formData.get("position"),
    phone: formData.get("phone"),
    department: formData.get("department"),
    email: formData.get("email"),
    dateOfBirth: formData.get("dateOfBirth") || undefined,
    systemRole: formData.get("systemRole") || undefined,
    address: formData.get("address") || undefined,
    emergencyContactName: formData.get("emergencyContactName") || undefined,
    emergencyContactPhone: formData.get("emergencyContactPhone") || undefined,
    salary: formData.get("salary") || 0,
    imageUrl: formData.get("imageUrl") || undefined,
  });
}

export async function createStaff(formData: FormData): Promise<ActionResult> {
  const parsed = parseStaffForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.staff.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { success: false, error: "A staff member with this email already exists." };
  }

  const employeeId = await generateEmployeeId();
  const { dateOfBirth, ...rest } = parsed.data;
  const staff = await db.staff.create({
    data: {
      ...rest,
      employeeId,
      hireDate: new Date(),
      dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
    },
  });
  revalidatePath("/staffs");
  redirect(`/staffs/${staff.id}`);
}

export async function updateStaff(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseStaffForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.staff.findUnique({ where: { email: parsed.data.email } });
  if (existing && existing.id !== id) {
    return { success: false, error: "A staff member with this email already exists." };
  }

  const { dateOfBirth, ...rest } = parsed.data;
  await db.staff.update({
    where: { id },
    data: { ...rest, dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined },
  });
  revalidatePath("/staffs");
  revalidatePath(`/staffs/${id}`);
  redirect(`/staffs/${id}`);
}

export async function deleteStaff(id: string): Promise<ActionResult> {
  await db.staff.delete({ where: { id } });
  revalidatePath("/staffs");
  return { success: true };
}

export async function archiveStaff(id: string): Promise<ActionResult> {
  const staff = await db.staff.findUnique({ where: { id } });
  if (!staff) {
    return { success: false, error: "Staff not found" };
  }

  await db.staff.update({
    where: { id },
    data: { status: staff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });
  revalidatePath("/staffs");
  revalidatePath(`/staffs/${id}`);
  return { success: true };
}
