import { ProjectForm } from "@/features/projects/components/project-form";
import { createProject } from "@/features/projects/actions";
import { getCustomerOptions, getAgentOptions } from "@/features/projects/queries";

export default async function AddProjectPage() {
  const [customerOptions, agentOptions] = await Promise.all([getCustomerOptions(), getAgentOptions()]);

  return (
    <ProjectForm
      mode="create"
      customerOptions={customerOptions}
      agentOptions={agentOptions}
      onSubmit={createProject}
    />
  );
}
