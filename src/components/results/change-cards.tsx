import {
  Columns2,
  Eraser,
  Frame,
  Lamp,
  Layers,
  Leaf,
  Move,
  RotateCw,
  Route,
  Shapes,
  Sparkle,
  Sprout,
  type LucideIcon,
} from "lucide-react";
import type { AnalysisChange, AnalysisIssue } from "@/lib/ai/schema";
import { ISSUE_PRINCIPLES } from "@/lib/domain/glossary";
import { GlossaryText, Term } from "@/components/learn/term";
import { cn } from "@/lib/utils";

const CHANGE_ICONS: Record<AnalysisChange["type"], LucideIcon> = {
  move_furniture: Move,
  reorient_furniture: RotateCw,
  remove_clutter: Eraser,
  add_plant: Sprout,
  adjust_lighting: Lamp,
  add_lighting: Lamp,
  add_textile: Layers,
  adjust_decor: Shapes,
  adjust_artwork: Frame,
  add_natural_material: Leaf,
  improve_symmetry: Columns2,
  clear_pathway: Route,
  other: Sparkle,
};

/** The Feng Shui idea behind a change, taken from the first issue it addresses. */
function principleFor(change: AnalysisChange, issues: AnalysisIssue[]) {
  for (const id of change.relatedIssueIds) {
    const issue = issues.find((i) => i.id === id);
    const principle = issue && ISSUE_PRINCIPLES[issue.category];
    if (principle?.term) return principle;
  }
  return null;
}

export function ChangeCard({
  change,
  index,
  issues = [],
  className,
}: {
  change: AnalysisChange;
  index: number;
  issues?: AnalysisIssue[];
  className?: string;
}) {
  const Icon = CHANGE_ICONS[change.type] ?? Sparkle;
  const principle = principleFor(change, issues);
  return (
    <article className={cn("flex flex-col gap-3 rounded-2xl border border-border/80 bg-surface/70 p-6 backdrop-blur-sm", className)}>
      <div className="flex items-center justify-between">
        <span className="flex size-10 items-center justify-center rounded-full bg-sage-soft text-primary">
          <Icon className="size-[18px]" strokeWidth={1.6} aria-hidden />
        </span>
        <span className="font-mono text-[11px] text-subtle-foreground">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="font-display text-[1.6rem] leading-tight">{change.title}</h3>
      <p className="text-[15px] leading-relaxed text-foreground/85">
        <GlossaryText text={change.summary} />
      </p>
      {change.rationale && (
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/75">Why it helps: </span>
          <GlossaryText text={change.rationale} skip={principle?.term ? [principle.term] : undefined} />
        </p>
      )}
      {principle?.term && (
        <p className="mt-auto pt-2 text-xs text-subtle-foreground">
          Feng Shui idea: <Term id={principle.term}>{principle.label}</Term>
        </p>
      )}
    </article>
  );
}

export function ChangeCards({ changes, issues }: { changes: AnalysisChange[]; issues: AnalysisIssue[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {changes.map((change, i) => (
        <ChangeCard key={change.id} change={change} index={i} issues={issues} className="reveal" />
      ))}
    </div>
  );
}
