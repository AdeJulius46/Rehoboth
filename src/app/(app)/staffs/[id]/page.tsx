import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Activity, Mail, MapPin, Phone } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { StatusBadge } from "@/components/ui/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { EmptyState } from "@/components/ui/empty-state";
import { PERSON_STATUS_VARIANT } from "@/lib/constants";
import { formatNaira } from "@/lib/currency";
import { getStaffById } from "@/features/staffs/queries";
import { StaffDetailActions } from "@/features/staffs/components/staff-detail-actions";

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default async function StaffDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const staff = await getStaffById(id);

  if (!staff) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <Card className="gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src={staff.imageUrl ?? undefined} />
              <AvatarFallback>{initials(staff.name)}</AvatarFallback>
            </Avatar>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-foreground">{staff.name}</h1>
              <StatusBadge
                label={staff.status === "ACTIVE" ? "Active" : "Inactive"}
                variant={PERSON_STATUS_VARIANT[staff.status]}
              />
            </div>
          </div>
          <StaffDetailActions id={staff.id} />
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <Phone className="size-4" />
            {staff.phone}
          </span>
          <span className="flex items-center gap-1.5">
            <Mail className="size-4" />
            {staff.email}
          </span>
          {staff.address ? (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {staff.address}
            </span>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          <StatusBadge label={`Employee ID: ${staff.employeeId}`} variant="neutral" />
          <StatusBadge label={`Department: ${staff.department}`} variant="neutral" />
          {staff.systemRole ? <StatusBadge label={`Role: ${staff.systemRole}`} variant="neutral" /> : null}
        </div>
      </Card>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="payment">Payment History</TabsTrigger>
          <TabsTrigger value="leave">Leave History</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-4 space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Overview</h2>
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="p-0 lg:col-span-1">
              <div className="space-y-4 p-5 text-sm">
                <div>
                  <p className="text-xs text-muted-foreground">Position</p>
                  <p className="text-foreground">{staff.position}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Join Date</p>
                  <p className="text-foreground">{format(staff.hireDate, "MMMM d, yyyy")}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Salary</p>
                  <p className="text-foreground">{formatNaira(staff.salary.toString())}</p>
                </div>
                {staff.dateOfBirth ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Date of Birth</p>
                    <p className="text-foreground">{format(staff.dateOfBirth, "MMMM d, yyyy")}</p>
                  </div>
                ) : null}
                {staff.emergencyContactName ? (
                  <div>
                    <p className="text-xs text-muted-foreground">Emergency Contact</p>
                    <p className="text-foreground">
                      {staff.emergencyContactName} — {staff.emergencyContactPhone}
                    </p>
                  </div>
                ) : null}
              </div>
            </Card>

            <Card className="p-0 lg:col-span-2">
              <div className="flex items-center justify-between border-b border-border p-5 pb-4">
                <h3 className="font-semibold text-foreground">Recent Activity</h3>
              </div>
              <div className="p-5 pt-0">
                <EmptyState icon={Activity} title="No activity yet" description="Activity will appear here as this staff member uses the system." />
              </div>
            </Card>
          </div>
        </TabsContent>

        {["payment", "leave", "performance", "history"].map((tab) => (
          <TabsContent key={tab} value={tab} className="mt-4">
            <Card className="p-0">
              <div className="p-5">
                <EmptyState
                  icon={Activity}
                  title={`No ${tab} data yet`}
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
