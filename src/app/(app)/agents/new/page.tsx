"use client";

import { AgentForm } from "@/features/agents/components/agent-form";
import { createAgent } from "@/features/agents/actions";

export default function AddAgentPage() {
  return <AgentForm mode="create" onSubmit={createAgent} />;
}
