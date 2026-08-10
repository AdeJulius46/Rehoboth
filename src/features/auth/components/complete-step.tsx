"use client";

import { useRouter } from "next/navigation";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";

export function CompleteStep() {
  const router = useRouter();

  return (
    <div className="space-y-6 text-center">
      <div className="mx-auto flex size-24 items-center justify-center rounded-3xl bg-primary/10">
        <div className="flex size-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Check className="size-8" />
        </div>
      </div>
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-foreground">Registration complete!</h1>
        <p className="text-sm text-muted-foreground">
          Your account has been submitted for approval.
        </p>
        <p className="text-sm text-muted-foreground">Welcome to REHOBOTH Company Management System</p>
      </div>
      <Button onClick={() => router.push("/login?registered=1")}>
        Go to home
        <ArrowRight />
      </Button>
    </div>
  );
}
