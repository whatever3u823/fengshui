import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * A quiet, native <details> disclosure: keyboard and screen-reader friendly
 * with no script. One style for every "more detail" affordance in the app.
 */
export function Disclosure({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <details className={cn("group border-b border-border", className)}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-6 [&::-webkit-details-marker]:hidden">
        <span>
          <span className="block font-display text-[1.6rem] font-medium leading-tight">{title}</span>
          {description && <span className="mt-1 block text-sm text-muted-foreground">{description}</span>}
        </span>
        <span
          aria-hidden
          className="relative flex size-9 shrink-0 items-center justify-center rounded-full border border-border-strong text-muted-foreground transition-colors duration-300 group-hover:border-primary/40 group-hover:text-foreground"
        >
          <span className="absolute h-px w-3 bg-current" />
          <span className="absolute h-3 w-px bg-current transition-transform duration-300 ease-calm group-open:scale-y-0" />
        </span>
      </summary>
      <div className="animate-fade-in pb-8">{children}</div>
    </details>
  );
}
