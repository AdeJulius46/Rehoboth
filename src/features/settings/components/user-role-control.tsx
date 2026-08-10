"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ROLES, type Role } from "@/lib/constants";
import { updateUserRole } from "@/features/settings/actions";

const ROLE_ITEMS = Object.fromEntries(ROLES.map((role) => [role, role])) as Record<Role, string>;

export function UserRoleControl({
  userId,
  name,
  currentRole,
  isCurrentUser,
  isProtected,
}: {
  userId: string;
  name: string;
  currentRole: Role;
  isCurrentUser: boolean;
  isProtected?: boolean;
}) {
  const router = useRouter();
  const [pendingRole, setPendingRole] = React.useState<Role | null>(null);
  const [isPending, setIsPending] = React.useState(false);

  if (isCurrentUser) {
    return <Badge variant="outline">{currentRole} (you)</Badge>;
  }

  if (isProtected) {
    return <Badge variant="outline">{currentRole} (protected)</Badge>;
  }

  async function handleConfirm() {
    if (!pendingRole) return;
    setIsPending(true);
    const result = await updateUserRole(userId, pendingRole);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      setPendingRole(null);
      return;
    }
    toast.success(`${name}'s role updated to ${pendingRole}`);
    setPendingRole(null);
    router.refresh();
  }

  return (
    <>
      <Select
        items={ROLE_ITEMS}
        value={currentRole}
        onValueChange={(value) => {
          if (value && value !== currentRole) setPendingRole(value as Role);
        }}
      >
        <SelectTrigger className="w-32">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ROLES.map((role) => (
            <SelectItem key={role} value={role}>
              {role}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Dialog open={pendingRole !== null} onOpenChange={(open) => !open && setPendingRole(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Change {name}&apos;s role to {pendingRole}?
            </DialogTitle>
            <DialogDescription>This changes what they can access immediately.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button onClick={handleConfirm} disabled={isPending}>
              {isPending ? "Updating..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
