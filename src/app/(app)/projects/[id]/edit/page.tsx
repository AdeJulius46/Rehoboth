import { notFound } from "next/navigation";

import { ProjectForm } from "@/features/projects/components/project-form";
import { updateProject } from "@/features/projects/actions";
import { getProjectById, getCustomerOptions, getAgentOptions } from "@/features/projects/queries";

function toDateInputValue(date: Date | null) {
  if (!date) return undefined;
  return new Date(date).toISOString().slice(0, 10);
}

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, customerOptions, agentOptions] = await Promise.all([
    getProjectById(id),
    getCustomerOptions(),
    getAgentOptions(),
  ]);

  if (!project) {
    notFound();
  }

  return (
    <ProjectForm
      mode="edit"
      customerOptions={customerOptions}
      agentOptions={agentOptions}
      defaultValues={{
        name: project.name,
        code: project.code,
        customerId: project.customerId ?? "",
        agentId: project.agentId ?? "",
        description: project.description ?? undefined,
        startDate: toDateInputValue(project.startDate),
        endDate: toDateInputValue(project.endDate),
        budget: project.budget,
        status: project.status,
        progress: project.progress,
      }}
      onSubmit={updateProject.bind(null, id)}
    />
  );
}
