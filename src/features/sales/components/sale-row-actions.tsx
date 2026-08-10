"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Eye, MoreHorizontal, Pencil, Receipt, Trash2 } from "lucide-react";

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
import { deleteSale } from "@/features/sales/actions";
import { SaleDetailDialog } from "@/features/sales/components/sale-detail-dialog";
import type { SaleListRow } from "@/features/sales/queries";

export function SaleRowActions({ sale }: { sale: SaleListRow }) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deleteSale(sale.id);
    setIsDeleting(false);
    setConfirmOpen(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to delete sale");
      return;
    }
    toast.success("Sale deleted");
    router.refresh();
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" />}>
          <MoreHorizontal />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setDetailOpen(true)}>
            <Eye />
            View
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/sales/${sale.id}/edit`)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          {sale.status === "COMPLETED" ? (
            <DropdownMenuItem onClick={() => window.open(`/sales/${sale.id}/receipt`, "_blank")}>
              <Receipt />
              Download Receipt
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <SaleDetailDialog sale={sale} open={detailOpen} onOpenChange={setDetailOpen} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete sale?</DialogTitle>
            <DialogDescription>This restores any deducted stock and cannot be undone.</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" />}>Cancel</DialogClose>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
