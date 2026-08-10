"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { projectSchema } from "@/features/projects/schema";
import { generateProjectCode } from "@/features/projects/queries";

export type ActionResult = { success: true } | { success: false; error: string };

function parseProjectForm(formData: FormData) {
  return projectSchema.safeParse({
    name: formData.get("name"),
    code: formData.get("code") || undefined,
    customerId: formData.get("customerId") || undefined,
    agentId: formData.get("agentId") || undefined,
    description: formData.get("description") || undefined,
    startDate: formData.get("startDate"),
    endDate: formData.get("endDate") || undefined,
    budget: formData.get("budget") || 0,
    status: formData.get("status") || "ACTIVE",
    progress: formData.get("progress") || 0,
  });
}

export async function createProject(formData: FormData): Promise<ActionResult> {
  const code = (formData.get("code") as string) || (await generateProjectCode());
  formData.set("code", code);
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { customerId, agentId, startDate, endDate, ...rest } = parsed.data;

  const project = await db.project.create({
    data: {
      ...rest,
      code,
      customerId: customerId || null,
      agentId: agentId || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProject(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseProjectForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const { customerId, agentId, startDate, endDate, ...rest } = parsed.data;

  await db.project.update({
    where: { id },
    data: {
      ...rest,
      customerId: customerId || null,
      agentId: agentId || null,
      startDate: new Date(startDate),
      endDate: endDate ? new Date(endDate) : null,
    },
  });
  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  redirect(`/projects/${id}`);
}

export async function deleteProject(id: string): Promise<ActionResult> {
  await db.project.delete({ where: { id } });
  revalidatePath("/projects");
  return { success: true };
}
