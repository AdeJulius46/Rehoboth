"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Download, Eye, FileText, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

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
import { deletePayment } from "@/features/payments/actions";
import { PaymentDetailDialog } from "@/features/payments/components/payment-detail-dialog";
import type { PaymentListRow } from "@/features/payments/queries";

export function PaymentRowActions({ payment }: { payment: PaymentListRow }) {
  const router = useRouter();
  const [detailOpen, setDetailOpen] = React.useState(false);
  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);

  async function handleDelete() {
    setIsDeleting(true);
    const result = await deletePayment(payment.id);
    setIsDeleting(false);
    setConfirmOpen(false);

    if (!result.success) {
      toast.error(result.error ?? "Failed to delete payment");
      return;
    }
    toast.success("Payment deleted");
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
            View Full Detail
          </DropdownMenuItem>
          {payment.invoiceId ? (
            <DropdownMenuItem onClick={() => router.push(`/invoices/${payment.invoiceId}`)}>
              <FileText />
              View Invoice
            </DropdownMenuItem>
          ) : null}
          <DropdownMenuItem onClick={() => window.open(`/payments/${payment.id}/receipt`, "_blank")}>
            <Download />
            Download Receipt
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => router.push(`/payments/${payment.id}/edit`)}>
            <Pencil />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" onClick={() => setConfirmOpen(true)}>
            <Trash2 />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <PaymentDetailDialog payment={payment} open={detailOpen} onOpenChange={setDetailOpen} />

      <Dialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete payment?</DialogTitle>
            <DialogDescription>This action cannot be undone.</DialogDescription>
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
