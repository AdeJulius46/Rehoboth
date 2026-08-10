import { notFound } from "next/navigation";

import { AgentForm } from "@/features/agents/components/agent-form";
import { updateAgent } from "@/features/agents/actions";
import { getAgentById } from "@/features/agents/queries";

export default async function EditAgentPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const agent = await getAgentById(id);

  if (!agent) {
    notFound();
  }

  return (
    <AgentForm
      mode="edit"
      defaultValues={{
        name: agent.name,
        region: agent.region,
        phone: agent.phone,
        agentType: agent.agentType,
        email: agent.email,
        idNumber: agent.idNumber ?? undefined,
        commissionRate: Number(agent.commissionRate),
        bankName: agent.bankName ?? undefined,
        accountNumber: agent.accountNumber ?? undefined,
        accountName: agent.accountName ?? undefined,
        imageUrl: agent.imageUrl ?? undefined,
      }}
      onSubmit={updateAgent.bind(null, id)}
    />
  );
}
