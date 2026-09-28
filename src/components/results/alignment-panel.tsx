import { ArrowRight } from "lucide-react";
import {
  ALIGNMENT_CATEGORIES,
  ALIGNMENT_LABELS,
  ALIGNMENT_RATING_LABELS,
  type AlignmentRating,
} from "@/lib/domain/options";
import { ALIGNMENT_EXPLAINERS, GLOSSARY, RATING_EXPLAINERS } from "@/lib/domain/glossary";
import type { RoomAnalysis } from "@/lib/ai/schema";
import { Badge } from "@/components/ui/badge";
import { GlossaryText, Term } from "@/components/learn/term";
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
    <Badge variant={RATING_VARIANT[rating]} className="shrink-0 gap-2 px-3 py-1.5" title={RATING_EXPLAINERS[rating]}>
      <RatingMeter rating={rating} />
      {ALIGNMENT_RATING_LABELS[rating]}
    </Badge>
  );
}

function RatingLegend() {
  return (
    <ul className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-sm text-muted-foreground" aria-label="What the ratings mean">
      {(["strong", "moderate", "opportunity"] as const).map((r) => (
        <li key={r} className="flex items-center gap-2.5">
          <RatingMeter rating={r} />
          <span>
            <span className="font-medium text-foreground">{ALIGNMENT_RATING_LABELS[r]}</span> · {RATING_EXPLAINERS[r]}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function AlignmentPanel({
  alignment,
  showProjected = true,
  className,
}: {
  alignment: RoomAnalysis["alignment"];
  showProjected?: boolean;
  className?: string;
}) {
  return (
    <div className={className}>
      <RatingLegend />
      <ul className="mt-10 border-b border-border">
        {ALIGNMENT_CATEGORIES.map((key) => {
          const entry = alignment[key];
          const explainer = ALIGNMENT_EXPLAINERS[key];
          return (
            <li
              key={key}
              className="reveal grid gap-4 border-t border-border py-7 md:grid-cols-[minmax(0,15rem)_minmax(0,19.5rem)_minmax(0,1fr)] md:items-start md:gap-8"
            >
              <div>
                <p className="font-display text-[1.6rem] font-medium leading-tight">{ALIGNMENT_LABELS[key]}</p>
                <p className="mt-1.5 text-sm leading-snug text-muted-foreground">{explainer.question}</p>
                <p className="mt-2 text-sm text-subtle-foreground">
                  Feng Shui idea: <Term id={explainer.term}>{GLOSSARY[explainer.term].term}</Term>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:pt-1.5">
                <span className="sr-only">As photographed:</span>
                <RatingBadge rating={entry.current} />
                {showProjected && entry.projected !== entry.current && (
                  <>
                    <ArrowRight className="size-3.5 shrink-0 text-subtle-foreground" strokeWidth={1.5} aria-hidden />
                    <span className="sr-only">After the changes:</span>
                    <RatingBadge rating={entry.projected} />
                  </>
                )}
              </div>
              <p className="text-[15px] leading-relaxed text-foreground/80 md:pt-1">
                <GlossaryText text={entry.note} skip={[explainer.term]} />
              </p>
            </li>
          );
        })}
      </ul>
      <p className="mx-auto mt-8 max-w-2xl text-center text-xs leading-relaxed text-subtle-foreground">
        {showProjected ? "Where a rating changes, the second shows the room with the suggested changes. " : ""}
        This assessment is an AI interpretation of traditional Feng Shui principles, not a scientific measurement.
      </p>
    </div>
  );
}
