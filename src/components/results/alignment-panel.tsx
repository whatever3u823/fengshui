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
    <Badge variant={RATING_VARIANT[rating]} className="shrink-0 gap-1.5 px-2.5 py-1" title={RATING_EXPLAINERS[rating]}>
      <RatingMeter rating={rating} />
      {ALIGNMENT_RATING_LABELS[rating]}
    </Badge>
  );
}

function RatingLegend() {
  return (
    <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-muted-foreground" aria-label="What the ratings mean">
      {(["strong", "moderate", "opportunity"] as const).map((r) => (
        <li key={r} className="flex items-center gap-2">
          <RatingBadge rating={r} />
          <span>{RATING_EXPLAINERS[r]}</span>
        </li>
      ))}
    </ul>
  );
}

export function AlignmentPanel({ alignment, showProjected = true }: { alignment: RoomAnalysis["alignment"]; showProjected?: boolean }) {
  return (
    <div className="space-y-6">
      <RatingLegend />
      <ul className="divide-y divide-border rounded-2xl border border-border/80 bg-surface/70 px-5 backdrop-blur-sm sm:px-6">
        {ALIGNMENT_CATEGORIES.map((key) => {
          const entry = alignment[key];
          const explainer = ALIGNMENT_EXPLAINERS[key];
          return (
            <li
              key={key}
              className="grid gap-3 py-5 md:grid-cols-[minmax(0,15rem)_minmax(0,18.5rem)_minmax(0,1fr)] md:items-start md:gap-6"
            >
              <div>
                <p className="font-display text-[1.45rem] leading-tight">{ALIGNMENT_LABELS[key]}</p>
                <p className="mt-1 text-[13px] leading-snug text-muted-foreground">{explainer.question}</p>
                <p className="mt-1.5 text-xs text-subtle-foreground">
                  Feng Shui idea: <Term id={explainer.term}>{GLOSSARY[explainer.term].term}</Term>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:flex-nowrap md:pt-1">
                <span className="sr-only">As photographed:</span>
                <RatingBadge rating={entry.current} />
                {showProjected && entry.projected !== entry.current && (
                  <>
                    <ArrowRight className="size-3.5 shrink-0 text-subtle-foreground" aria-hidden />
                    <span className="sr-only">After the changes:</span>
                    <RatingBadge rating={entry.projected} />
                  </>
                )}
              </div>
              <p className="text-sm leading-relaxed text-foreground/80 md:pt-1">
                <GlossaryText text={entry.note} skip={[explainer.term]} />
              </p>
            </li>
          );
        })}
      </ul>
      <p className="text-xs leading-relaxed text-subtle-foreground">
        {showProjected ? "Left: the room as photographed. Right: with the suggested changes. " : ""}
        This assessment is an AI interpretation of traditional Feng Shui principles, not a scientific measurement.
      </p>
    </div>
  );
}
