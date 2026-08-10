"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import { generateInvoiceFromSale } from "@/features/invoices/actions";

export function GenerateInvoiceButton({
  saleId,
  invoice,
}: {
  saleId: string;
  invoice: { id: string; number: string } | null;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = React.useState(false);

  if (invoice) {
    return (
      <Button variant="outline" render={<Link href={`/invoices/${invoice.id}`} />} nativeButton={false}>
        <FileText />
        View Invoice
      </Button>
    );
  }

  async function handleGenerate() {
    setIsPending(true);
    const result = await generateInvoiceFromSale(saleId);
    setIsPending(false);
    if (result && !result.success) {
      toast.error(result.error ?? "Failed to generate invoice");
      return;
    }
    router.refresh();
  }

  return (
    <Button variant="outline" onClick={handleGenerate} disabled={isPending}>
      <FileText />
      {isPending ? "Generating..." : "Generate Invoice"}
    </Button>
  );
}
