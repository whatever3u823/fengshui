import { ArrowRight } from "lucide-react";
import {
  ALIGNMENT_CATEGORIES,
  ALIGNMENT_LABELS,
  ALIGNMENT_RATING_LABELS,
  type AlignmentRating,
} from "@/lib/domain/options";
import type { RoomAnalysis } from "@/lib/ai/schema";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const RATING_VARIANT: Record<AlignmentRating, "strong" | "moderate" | "opportunity" | "outline"> = {
  strong: "strong",
  moderate: "moderate",
  opportunity: "opportunity",
  not_applicable: "outline",
};

/** Three-step meter; intentionally qualitative, never a numeric score. */
function RatingMeter({ rating }: { rating: AlignmentRating }) {
  const filled = rating === "strong" ? 3 : rating === "moderate" ? 2 : rating === "opportunity" ? 1 : 0;
  const color =
    rating === "strong" ? "bg-strong" : rating === "moderate" ? "bg-moderate" : rating === "opportunity" ? "bg-opportunity" : "";
  return (
    <span className="flex gap-0.5" aria-hidden>
      {[0, 1, 2].map((i) => (
        <span key={i} className={cn("h-1 w-4 rounded-full", i < filled ? color : "bg-border")} />
      ))}
    </span>
  );
}

export function RatingBadge({ rating }: { rating: AlignmentRating }) {
  return (
    <Badge variant={RATING_VARIANT[rating]} className="shrink-0 gap-1.5 px-2 py-1">
      <RatingMeter rating={rating} />
      {ALIGNMENT_RATING_LABELS[rating]}
    </Badge>
  );
}

export function AlignmentPanel({ alignment, showProjected = true }: { alignment: RoomAnalysis["alignment"]; showProjected?: boolean }) {
  return (
    <div>
      <div className="hidden grid-cols-[minmax(0,11rem)_minmax(0,18.5rem)_minmax(0,1fr)] gap-6 border-b border-border pb-3 text-[11px] font-medium uppercase tracking-[0.14em] text-subtle-foreground md:grid">
        <span>Principle</span>
        <span>{showProjected ? "Photographed → Proposed" : "Photographed"}</span>
        <span>Why</span>
      </div>
      <ul className="divide-y divide-border">
        {ALIGNMENT_CATEGORIES.map((key) => {
          const entry = alignment[key];
          return (
            <li
              key={key}
              className="grid gap-2 py-4 md:grid-cols-[minmax(0,11rem)_minmax(0,18.5rem)_minmax(0,1fr)] md:items-center md:gap-6"
            >
              <span className="text-[15px] font-medium">{ALIGNMENT_LABELS[key]}</span>
              <span className="flex flex-wrap items-center gap-2 md:flex-nowrap">
                <RatingBadge rating={entry.current} />
                {showProjected && entry.projected !== entry.current && (
                  <>
                    <ArrowRight className="size-3.5 shrink-0 text-subtle-foreground" aria-label="after changes" />
                    <RatingBadge rating={entry.projected} />
                  </>
                )}
              </span>
              <span className="text-sm leading-relaxed text-muted-foreground">{entry.note}</span>
            </li>
          );
        })}
      </ul>
      <p className="mt-5 text-xs leading-relaxed text-subtle-foreground">
        This assessment is an AI interpretation of traditional Feng Shui principles, not a scientific measurement.
      </p>
    </div>
  );
}
