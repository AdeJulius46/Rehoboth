import Link from "next/link";
import { ArrowLeft, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export function PageHeader({
  title,
  count,
  backHref,
  action,
}: {
  title: string;
  count?: number;
  backHref?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: LucideIcon;
  };
}) {
  const ActionIcon = action?.icon;

  return (
    <div className="flex   items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        {backHref ? (
          <Link
            href={backHref}
            className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Link>
        ) : null}
        {/* <h1 className="text-2xl font-semibold text-foreground">{title}</h1> */}
        {count !== undefined ? (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {count}
          </span>
        ) : null}
      </div>
      {action ? (
        action.href ? (
          <Button nativeButton={false} render={<Link href={action.href} />}>
            {ActionIcon ? <ActionIcon /> : null}
            {action.label}
          </Button>
        ) : (
          <Button onClick={action.onClick}>
            {ActionIcon ? <ActionIcon /> : null}
            {action.label}
          </Button>
        )
      ) : null}
    </div>
  );
}
