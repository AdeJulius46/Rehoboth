import Image from "next/image";

import { BRAND } from "@/lib/brand";
import { cn } from "@/lib/utils";

export function Logo({ className, size = 96 }: { className?: string; size?: number }) {
  return (
    <Image
      src={BRAND.logo}
      alt={BRAND.name}
      width={size}
      height={size}
      className={cn("select-none", className)}
      priority
    />
  );
}
