import * as React from "react";
import { cn } from "@/lib/utils";

/** A calm, centered status line: used for Demo Mode and other honest labels. */
export function Notice({ icon, children, className }: { icon?: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <div
      role="status"
      className={cn(
        "inline-flex max-w-3xl items-start gap-3 rounded-2xl bg-moderate-soft/70 px-5 py-3 text-left text-sm leading-relaxed sm:rounded-full [&_svg]:mt-[3px] [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:text-moderate",
        className,
      )}
    >
      {icon}
      <p>{children}</p>
    </div>
  );
}
