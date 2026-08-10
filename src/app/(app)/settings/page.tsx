import { ShieldAlert, UserPlus, Users } from "lucide-react";
import { format } from "date-fns";

import { auth } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PendingUserActions } from "@/features/settings/components/pending-user-actions";
import { UserRoleControl } from "@/features/settings/components/user-role-control";
import { getAllUsers, getPendingUsers } from "@/features/settings/queries";
import { SYSTEM_ADMIN_EMAIL } from "@/features/settings/constants";

export default async function SettingsPage() {
  const session = await auth();

  if (session?.user?.role !== "ADMIN") {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold text-foreground">Settings</h2>
        <Card className="p-0">
          <div className="p-5">
            <EmptyState
              icon={ShieldAlert}
              title="Admins only"
              description="Only an administrator can access account settings."
            />
          </div>
        </Card>
      </div>
    );
  }

  const [pendingUsers, allUsers] = await Promise.all([getPendingUsers(), getAllUsers()]);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-foreground">Settings</h2>

      <Card className="gap-4 p-0">
        <div className="flex items-center justify-between border-b border-border p-5 pb-4">
          <div>
            <h3 className="font-semibold text-foreground">Pending Approvals</h3>
            <p className="text-sm text-muted-foreground">
              New self-registered accounts waiting for an admin to approve or reject them.
            </p>
          </div>
        </div>
        <div className="p-5 pt-0">
          {pendingUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Job Title</TableHead>
                  <TableHead>Requested Role</TableHead>
                  <TableHead>Registered</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.jobTitle ?? "—"}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{user.requestedRole ?? "STAFF"}</Badge>
                    </TableCell>
                    <TableCell>{format(user.createdAt, "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <PendingUserActions userId={user.id} name={user.name} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState
              icon={UserPlus}
              title="No pending accounts"
              description="New registrations awaiting approval will show up here."
            />
          )}
        </div>
      </Card>

      <Card className="gap-4 p-0">
        <div className="flex items-center justify-between border-b border-border p-5 pb-4">
          <div>
            <h3 className="font-semibold text-foreground">All Users</h3>
            <p className="text-sm text-muted-foreground">Manage roles for active accounts.</p>
          </div>
        </div>
        <div className="p-5 pt-0">
          {allUsers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Role</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {allUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <StatusBadge
                        label={user.status === "ACTIVE" ? "Active" : "Inactive"}
                        variant={user.status === "ACTIVE" ? "success" : "neutral"}
                      />
                    </TableCell>
                    <TableCell>{format(user.createdAt, "MMM d, yyyy")}</TableCell>
                    <TableCell className="flex justify-end">
                      <UserRoleControl
                        userId={user.id}
                        name={user.name}
                        currentRole={user.role}
                        isCurrentUser={user.id === session.user.id}
                        isProtected={user.email === SYSTEM_ADMIN_EMAIL}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <EmptyState icon={Users} title="No users yet" description="Approved accounts will show up here." />
          )}
        </div>
      </Card>
    </div>
  );
}
