import Image from "next/image";

import { cn } from "@/lib/utils";

export function Logo({ className, size = 96 }: { className?: string; size?: number }) {
  return (
    <Image
      src="/logo.png"
      alt="REHOBOTH Software Company"
      width={size}
      height={size}
      className={cn("select-none", className)}
      priority
    />
  );
}
