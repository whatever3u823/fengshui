import { cn } from "@/lib/utils";

const STEPS = ["Photo", "Details", "Analysis", "Results"] as const;

/** A quiet sense of place: four words joined by hairlines, the current one in ink. */
export function Stepper({ current }: { current: 0 | 1 | 2 | 3 }) {
  return (
    <ol className="flex items-center justify-center gap-2.5 text-[13px] sm:gap-4 sm:text-sm" aria-label="Progress">
      {STEPS.map((label, i) => {
        const state = i < current ? "done" : i === current ? "current" : "upcoming";
        return (
          <li key={label} className="flex items-center gap-2.5 sm:gap-4" aria-current={state === "current" ? "step" : undefined}>
            <span className="flex items-center gap-2">
              <span
                className={cn(
                  "size-1.5 rounded-full transition-colors duration-500",
                  state === "done" && "bg-primary",
                  state === "current" && "bg-primary ring-4 ring-primary/15",
                  state === "upcoming" && "bg-border-strong",
                )}
                aria-hidden
              />
              <span
                className={cn(
                  "transition-colors duration-500",
                  state === "current" ? "font-medium text-foreground" : state === "done" ? "text-muted-foreground" : "text-subtle-foreground",
                )}
              >
                {label}
                {state === "done" && <span className="sr-only"> (done)</span>}
              </span>
            </span>
            {i < STEPS.length - 1 && <span className="h-px w-4 bg-border-strong sm:w-8" aria-hidden />}
          </li>
        );
      })}
    </ol>
  );
}
