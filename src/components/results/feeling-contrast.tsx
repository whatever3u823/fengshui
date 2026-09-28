import { ArrowDown, ArrowRight } from "lucide-react";
import type { ContrastItem, RoomAnalysis } from "@/lib/ai/schema";
import { GlossaryText } from "@/components/learn/term";
import { cn } from "@/lib/utils";

/**
 * "How the room feels": the three issues that weighed on the room beside the
 * three improvements that answer them, each named by the feeling it creates.
 * Warm clay for tension, soft sage for calm. Rows are paired so each
 * improvement sits directly beside the issue it answers.
 */

const TONE = {
  before: { card: "bg-opportunity-soft/70", word: "text-opportunity", dot: "bg-opportunity", label: "Before" },
  after: { card: "bg-strong-soft/80", word: "text-strong", dot: "bg-strong", label: "After" },
} as const;

function FeelingCard({ item, side }: { item: ContrastItem | undefined; side: "before" | "after" }) {
  if (!item) return <div aria-hidden />;
  const tone = TONE[side];
  return (
    <div className={cn("flex h-full flex-col rounded-3xl p-6 sm:p-8", tone.card)}>
      <p className={cn("text-xs font-medium tracking-[0.14em] uppercase md:hidden", tone.word)}>{tone.label}</p>
      <p className={cn("mt-2 font-display text-[2.25rem] font-medium leading-none md:mt-0 sm:text-[2.6rem]", tone.word)}>{item.feeling}</p>
      <p className="mt-4 text-[15px] font-medium leading-snug">{item.title}</p>
      <p className="mt-1.5 text-[15px] leading-relaxed text-foreground/70">
        <GlossaryText text={item.detail} />
      </p>
    </div>
  );
}

export function FeelingContrast({
  contrast,
  projected,
  className,
}: {
  contrast: RoomAnalysis["contrast"];
  projected: boolean;
  className?: string;
}) {
  const rows = Math.max(contrast.before.length, contrast.after.length);
  if (rows === 0) return null;

  return (
    <div className={className}>
      {/* Column headings (desktop); on phones each card carries its own label. */}
      <div className="mb-4 hidden grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] gap-x-3 px-2 text-sm md:grid">
        <p className="flex items-center gap-2.5 text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", TONE.before.dot)} aria-hidden /> Before: what weighed on the room
        </p>
        <span />
        <p className="flex items-center gap-2.5 text-muted-foreground">
          <span className={cn("size-1.5 rounded-full", TONE.after.dot)} aria-hidden /> After:{" "}
          {projected ? "what it gives you now" : "what the changes would give you"}
        </p>
      </div>

      <ol className="space-y-8 md:space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="reveal grid md:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] md:items-stretch md:gap-x-3">
            <FeelingCard item={contrast.before[i]} side="before" />
            <span className="relative z-10 -my-4 flex items-center justify-center md:my-0" aria-hidden>
              <span className="flex size-9 items-center justify-center rounded-full bg-background text-subtle-foreground shadow-[0_0_0_4px_var(--background)]">
                <ArrowDown className="size-4 md:hidden" strokeWidth={1.5} />
                <ArrowRight className="hidden size-4 md:block" strokeWidth={1.5} />
              </span>
            </span>
            <FeelingCard item={contrast.after[i]} side="after" />
          </li>
        ))}
      </ol>

      <p className="mt-8 text-center text-xs leading-relaxed text-subtle-foreground">
        Feelings describe common reactions to these arrangements, not guarantees of how anyone will feel.
      </p>
    </div>
  );
}
