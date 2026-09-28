import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-medium leading-none tracking-wide",
  {
    variants: {
      variant: {
        default: "bg-muted text-muted-foreground",
        sage: "bg-sage-soft text-strong",
        outline: "border border-border text-muted-foreground",
        strong: "bg-strong-soft text-strong",
        moderate: "bg-moderate-soft text-moderate",
        opportunity: "bg-opportunity-soft text-opportunity",
        ink: "bg-primary text-primary-foreground",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

function Badge({ className, variant, ...props }: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
