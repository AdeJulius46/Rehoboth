import { notFound } from "next/navigation";
import { Building2, Calendar, User, Wallet } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PROJECT_STATUS_VARIANT } from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { getProjectById } from "@/features/projects/queries";
import { ProjectDetailActions } from "@/features/projects/components/project-detail-actions";
import { progressIndicatorClass } from "@/features/projects/progress-color";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "In Progress",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
  CANCELLED: "Cancelled",
};

function formatDate(date: Date | null) {
  if (!date) return "—";
  return new Date(date).toLocaleDateString("en-NG", { month: "short", day: "numeric", year: "numeric" });
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProjectById(id);

  if (!project) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>
                <Building2 className="size-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground">{project.name}</h1>
                <StatusBadge label={STATUS_LABELS[project.status]} variant={PROJECT_STATUS_VARIANT[project.status]} />
              </div>
              <p className="text-sm text-muted-foreground">{project.code}</p>
            </div>
          </div>
          <ProjectDetailActions id={project.id} />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          {project.customer ? (
            <span className="flex items-center gap-1.5">
              <User className="size-4" />
              {project.customer.name}
            </span>
          ) : null}
          {project.agent ? (
            <span className="flex items-center gap-1.5">
              <User className="size-4" />
              {project.agent.name}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5">
            <Calendar className="size-4" />
            {formatDate(project.startDate)} — {formatDate(project.endDate)}
          </span>
        </div>

        {project.description ? <p className="text-sm text-foreground">{project.description}</p> : null}

        <div className="flex items-center gap-3 pt-1">
          <Progress
            value={project.progress}
            className="w-48"
            indicatorClassName={progressIndicatorClass(project.progress)}
          />
          <span className="text-sm text-muted-foreground">{project.progress}%</span>
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Tasks</TabsTrigger>
          <TabsTrigger value="payment">Payment</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="activity">Activity Log</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="p-0">
              <div className="flex items-center justify-between border-b border-border p-5 pb-4">
                <h3 className="font-semibold text-foreground">Project Timeline</h3>
              </div>
              <div className="space-y-3 p-5 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Project Created</span>
                  <span className="text-foreground">{formatDate(project.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Project Started</span>
                  <span className="text-foreground">{formatDate(project.startDate)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Last Updated</span>
                  <span className="text-foreground">{formatDate(project.updatedAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due Date</span>
                  <span className="text-foreground">{formatDate(project.endDate)}</span>
                </div>
              </div>
            </Card>

            <Card className="p-0">
              <div className="flex items-center justify-between border-b border-border p-5 pb-4">
                <h3 className="font-semibold text-foreground">Financial Summary</h3>
              </div>
              <div className="space-y-3 p-5 pt-4 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Project Value</span>
                  <span className="text-foreground">{formatNaira(project.budget)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount Spent</span>
                  <span className="text-foreground">{formatNaira(0)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Due Amount</span>
                  <span className="text-foreground">{formatNaira(project.budget)}</span>
                </div>
              </div>
            </Card>
          </div>

          <Card className="p-0">
            <div className="flex items-center justify-between border-b border-border p-5 pb-4">
              <h3 className="font-semibold text-foreground">Recent Activities</h3>
            </div>
            <div className="p-5 pt-0">
              <EmptyState
                icon={Wallet}
                title="No activity yet"
                description="Activity tracking will be available once the module is built."
              />
            </div>
          </Card>
        </TabsContent>

        {["tasks", "payment", "documents", "activity"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="p-0">
              <div className="p-5">
                <EmptyState
                  icon={Building2}
                  title={`No ${tab} yet`}
                  description="This section will be available once the related module is built."
                />
              </div>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
