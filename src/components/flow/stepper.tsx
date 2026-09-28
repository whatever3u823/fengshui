import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Photo", "Details", "Analysis", "Results"] as const;

export function Stepper({ current }: { current: 0 | 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center gap-2 text-[13px] sm:gap-3" aria-label="Progress">
      {STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <li key={label} className="flex items-center gap-2 sm:gap-3" aria-current={state === "current" ? "step" : undefined}>
            <span
              className={cn(
                "flex size-5 items-center justify-center rounded-full border text-[10px] font-medium transition-colors",
                state === "done" && "border-primary bg-primary text-primary-foreground",
                state === "current" && "border-primary text-foreground",
                state === "upcoming" && "border-border-strong text-subtle-foreground",
              )}
            >
              {state === "done" ? <Check className="size-3" strokeWidth={2.5} /> : i + 1}
            </span>
            <span className={cn("hidden sm:inline", state === "upcoming" ? "text-subtle-foreground" : "text-foreground")}>{label}</span>
            {i < STEPS.length - 1 && <span className="h-px w-5 bg-border-strong sm:w-8" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
