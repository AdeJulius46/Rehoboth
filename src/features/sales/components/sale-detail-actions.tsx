"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckCircle2, ChevronDown, Pencil, XCircle, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deleteSale, updateSaleStatus } from "@/features/sales/actions";

export function SaleDetailActions({ id, status }: { id: string; status: "PENDING" | "COMPLETED" | "CANCELLED" }) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isPending, setIsPending] = React.useState(false);

  async function handleStatusChange(next: "PENDING" | "COMPLETED" | "CANCELLED") {
    const result = await updateSaleStatus(id, next);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Sale status updated");
    router.refresh();
  }

  async function handleDelete() {
    setIsPending(true);
    const result = await deleteSale(id);
    setIsPending(false);
    setConfirmOpen(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to delete sale");
      return;
    }
    toast.success("Sale deleted");
    router.push("/sales");
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="outline" />}>
          Actions
          <ChevronDown />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {status !== "COMPLETED" ? (
            <DropdownMenuItem onClick={() => handleStatusChange("COMPLETED")}>
              <CheckCircle2 />
              Mark as Completed
            </DropdownMenuItem>
          ) : null}
          {status !== "CANCELLED" ? (
            <DropdownMenuItem variant="destructive" onClick={() => handleStatusChange("CANCELLED")}>
              <XCircle />
              Cancel Sale
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 />
            Delete Sale
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button nativeButton={false} render={<Link href={`/sales/${id}/edit`} />}>
        <Pencil />
        Edit
      </Button>

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete sale?</DialogTitle>
            <DialogDescription>
              This restores any deducted stock and cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isPending}>
              {isPending ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
