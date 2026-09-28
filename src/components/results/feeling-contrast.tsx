import { ArrowDown, ArrowRight } from "lucide-react";
import type { ContrastItem, RoomAnalysis } from "@/lib/ai/schema";
import { GlossaryText } from "@/components/learn/term";
import { cn } from "@/lib/utils";

/**
 * "How the room feels": the three issues that weighed on the room beside the
 * three improvements that answer them, each named by the feeling it creates.
 * Clay tones and a jagged mark for tension; sage tones and the ripple motif
 * for calm. Rows are paired so each improvement sits next to its issue.
 */

function TensionMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M3 8l3-3 3 3 3-3 3 3 3-3 3 3" />
      <path d="M3 14l3-3 3 3 3-3 3 3 3-3 3 3" opacity={0.6} />
      <path d="M3 20l3-3 3 3 3-3 3 3 3-3 3 3" opacity={0.3} />
    </svg>
  );
}

function CalmMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
      <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="6" opacity={0.6} />
      <circle cx="12" cy="12" r="10" opacity={0.3} />
    </svg>
  );
}

const TONE = {
  before: {
    card: "border-opportunity/15 bg-opportunity-soft/60",
    word: "text-opportunity",
    mark: TensionMark,
    label: "Before",
  },
  after: {
    card: "border-strong/15 bg-strong-soft/70",
    word: "text-strong",
    mark: CalmMark,
    label: "After",
  },
} as const;

function FeelingCard({ item, side }: { item: ContrastItem | undefined; side: "before" | "after" }) {
  if (!item) return <div aria-hidden />;
  const tone = TONE[side];
  const Mark = tone.mark;
  return (
    <div className={cn("flex h-full flex-col gap-2 rounded-2xl border p-5 backdrop-blur-sm sm:p-6", tone.card)}>
      <p className={cn("text-[11px] font-medium uppercase tracking-[0.16em] md:hidden", tone.word)}>{tone.label}</p>
      <p className={cn("flex items-center gap-2.5 font-display text-[2rem] leading-none", tone.word)}>
        <Mark className="size-5 shrink-0" />
        {item.feeling}
      </p>
      <p className="mt-1 text-[15px] font-medium leading-snug text-foreground">{item.title}</p>
      <p className="text-sm leading-relaxed text-foreground/70">
        <GlossaryText text={item.detail} />
      </p>
    </div>
  );
}

export function FeelingContrast({ contrast, projected }: { contrast: RoomAnalysis["contrast"]; projected: boolean }) {
  const rows = Math.max(contrast.before.length, contrast.after.length);
  if (rows === 0) return null;

  return (
    <section aria-labelledby="feel-heading" className="space-y-6">
      <div>
        <p className="eyebrow mb-2">The difference</p>
        <h2 id="feel-heading" className="font-display text-4xl sm:text-5xl">
          How the room feels
        </h2>
      </div>

      {/* Column headings (desktop); on phones each card carries its own label. */}
      <div className="hidden grid-cols-[minmax(0,1fr)_2.75rem_minmax(0,1fr)] gap-x-3 md:grid">
        <p className="flex items-center gap-2 text-sm font-medium text-opportunity">
          <TensionMark className="size-4" /> Before · what weighed on the room
        </p>
        <span />
        <p className="flex items-center gap-2 text-sm font-medium text-strong">
          <CalmMark className="size-4" /> After · {projected ? "what it gives you now" : "what the changes would give you"}
        </p>
      </div>

      <ol className="space-y-6 md:space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <li
            key={i}
            className="reveal grid gap-2 md:grid-cols-[minmax(0,1fr)_2.75rem_minmax(0,1fr)] md:items-stretch md:gap-x-3 md:gap-y-0"
          >
            <FeelingCard item={contrast.before[i]} side="before" />
            <span className="relative z-10 -my-5 flex items-center justify-center md:my-0" aria-hidden>
              <span className="flex size-9 items-center justify-center rounded-full border border-border bg-surface text-subtle-foreground shadow-sm">
                <ArrowDown className="size-4 md:hidden" />
                <ArrowRight className="hidden size-4 md:block" />
              </span>
            </span>
            <FeelingCard item={contrast.after[i]} side="after" />
          </li>
        ))}
      </ol>

      <p className="text-xs leading-relaxed text-subtle-foreground">
        Feelings describe common reactions to these arrangements, not guarantees of how anyone will feel.
      </p>
    </section>
  );
}
