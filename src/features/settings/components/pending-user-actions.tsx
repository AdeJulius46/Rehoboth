"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Check, X } from "lucide-react";

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
import { approveUser, rejectUser } from "@/features/settings/actions";

export function PendingUserActions({ userId, name }: { userId: string; name: string }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  async function handleApprove() {
    setIsPending(true);
    const result = await approveUser(userId);
    setIsPending(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`${name} approved`);
    router.refresh();
  }

  async function handleReject() {
    setIsPending(true);
    const result = await rejectUser(userId);
    setIsPending(false);
    setConfirmOpen(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success(`${name} rejected`);
    router.refresh();
  }

  return (
    <div className="flex items-center justify-end gap-2">
      <Button size="sm" onClick={handleApprove} disabled={isPending}>
        <Check />
        Approve
      </Button>
      <Button size="sm" variant="outline" onClick={() => setConfirmOpen(true)} disabled={isPending}>
        <X />
        Reject
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject {name}&apos;s registration?</DialogTitle>
            <DialogDescription>
              Their account will be marked inactive and they won&apos;t be able to log in. You can reverse this
              later if needed.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleReject} disabled={isPending}>
              {isPending ? "Rejecting..." : "Reject"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
