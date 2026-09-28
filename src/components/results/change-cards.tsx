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

export function ChangeCard({ change, issues = [], className }: { change: AnalysisChange; issues?: AnalysisIssue[]; className?: string }) {
  const Icon = CHANGE_ICONS[change.type] ?? Sparkle;
  const principle = principleFor(change, issues);
  return (
    <article className={cn("flex gap-5 border-t border-border py-8 sm:gap-6", className)}>
      <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-sage-soft text-primary">
        <Icon className="size-[18px]" strokeWidth={1.5} aria-hidden />
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-[1.7rem] font-medium leading-tight">{change.title}</h3>
        <p className="mt-2.5 text-[15px] leading-relaxed text-foreground/85">
          <GlossaryText text={change.summary} />
        </p>
        {change.rationale && (
          <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
            <GlossaryText text={change.rationale} skip={principle?.term ? [principle.term] : undefined} />
          </p>
        )}
        {principle?.term && (
          <p className="mt-4 text-sm text-subtle-foreground">
            Feng Shui idea: <Term id={principle.term}>{principle.label}</Term>
          </p>
        )}
      </div>
    </article>
  );
}

export function ChangeCards({ changes, issues, className }: { changes: AnalysisChange[]; issues: AnalysisIssue[]; className?: string }) {
  return (
    <div className={cn("grid gap-x-16 md:grid-cols-2", className)}>
      {changes.map((change) => (
        <ChangeCard key={change.id} change={change} issues={issues} className="reveal" />
      ))}
    </div>
  );
}
