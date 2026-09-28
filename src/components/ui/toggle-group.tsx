"use client";

import * as React from "react";
import * as ToggleGroupPrimitive from "@radix-ui/react-toggle-group";
import { cn } from "@/lib/utils";

/** shadcn/ui-style wrapper around Radix ToggleGroup, styled as selectable chips. */
function ToggleGroup({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Root>) {
  return (
    <ToggleGroupPrimitive.Root data-slot="toggle-group" className={cn("flex flex-wrap gap-2", className)} {...props} />
  );
}

function ToggleGroupItem({ className, ...props }: React.ComponentProps<typeof ToggleGroupPrimitive.Item>) {
  return (
    <ToggleGroupPrimitive.Item
      data-slot="toggle-group-item"
      className={cn(
        "inline-flex min-h-11 items-center gap-2.5 rounded-2xl border border-border bg-surface/60 px-4 text-[15px] text-foreground",
        "transition-[background-color,border-color,color] duration-300 ease-calm",
        "hover:border-border-strong hover:bg-surface",
        "data-[state=on]:border-primary data-[state=on]:bg-primary data-[state=on]:text-primary-foreground",
        "disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

export { ToggleGroup, ToggleGroupItem };
