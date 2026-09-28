import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  [
    "group/btn inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full font-medium tracking-[0.005em]",
    "transition-[background-color,color,border-color,box-shadow,transform] duration-300 ease-calm active:scale-[0.985]",
    "disabled:pointer-events-none disabled:opacity-40",
    "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 [&_svg]:transition-transform [&_svg]:duration-300",
    "hover:[&_svg.lucide-arrow-right]:translate-x-0.5",
  ].join(" "),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-[0_12px_32px_-14px_rgba(34,56,44,0.55)] hover:bg-pine hover:shadow-[0_14px_36px_-14px_rgba(34,56,44,0.7)]",
        outline: "border border-border-strong bg-surface/50 text-foreground hover:border-primary/35 hover:bg-surface",
        secondary: "bg-sage-soft text-foreground hover:bg-[#d7e2d1]",
        ghost: "text-foreground hover:bg-muted/70",
        link: "h-auto rounded-none px-0 text-foreground underline decoration-foreground/25 decoration-1 underline-offset-[6px] hover:decoration-foreground/70 active:scale-100",
      },
      size: {
        default: "h-11 px-6 text-[15px]",
        sm: "h-9 px-4 text-sm",
        lg: "h-[3.25rem] px-8 text-[15px]",
        icon: "size-11",
      },
    },
    compoundVariants: [{ variant: "link", className: "h-auto min-h-11 px-0" }],
    defaultVariants: { variant: "default", size: "default" },
  },
);

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}

export { Button, buttonVariants };
