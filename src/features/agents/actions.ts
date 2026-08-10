"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { agentSchema } from "@/features/agents/schema";

export type ActionResult = { success: true } | { success: false; error: string };

function parseAgentForm(formData: FormData) {
  return agentSchema.safeParse({
    name: formData.get("name"),
    region: formData.get("region"),
    phone: formData.get("phone"),
    agentType: formData.get("agentType"),
    email: formData.get("email"),
    idNumber: formData.get("idNumber") || undefined,
    commissionRate: formData.get("commissionRate") || 0,
    bankName: formData.get("bankName") || undefined,
    accountNumber: formData.get("accountNumber") || undefined,
    accountName: formData.get("accountName") || undefined,
    imageUrl: formData.get("imageUrl") || undefined,
  });
}

export async function createAgent(formData: FormData): Promise<ActionResult> {
  const parsed = parseAgentForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.agent.findUnique({ where: { email: parsed.data.email } });
  if (existing) {
    return { success: false, error: "An agent with this email already exists." };
  }

  const agent = await db.agent.create({ data: parsed.data });
  revalidatePath("/agents");
  redirect(`/agents/${agent.id}`);
}

export async function updateAgent(id: string, formData: FormData): Promise<ActionResult> {
  const parsed = parseAgentForm(formData);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0].message };
  }

  const existing = await db.agent.findUnique({ where: { email: parsed.data.email } });
  if (existing && existing.id !== id) {
    return { success: false, error: "An agent with this email already exists." };
  }

  await db.agent.update({ where: { id }, data: parsed.data });
  revalidatePath("/agents");
  revalidatePath(`/agents/${id}`);
  redirect(`/agents/${id}`);
}

export async function deleteAgent(id: string): Promise<ActionResult> {
  await db.agent.delete({ where: { id } });
  revalidatePath("/agents");
  return { success: true };
}

export async function archiveAgent(id: string): Promise<ActionResult> {
  const agent = await db.agent.findUnique({ where: { id } });
  if (!agent) {
    return { success: false, error: "Agent not found" };
  }

  await db.agent.update({
    where: { id },
    data: { status: agent.status === "ACTIVE" ? "INACTIVE" : "ACTIVE" },
  });
  revalidatePath("/agents");
  revalidatePath(`/agents/${id}`);
  return { success: true };
}
