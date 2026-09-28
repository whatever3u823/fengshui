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
import type { AnalysisChange } from "@/lib/ai/schema";
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

export function ChangeCard({ change, index, className }: { change: AnalysisChange; index: number; className?: string }) {
  const Icon = CHANGE_ICONS[change.type] ?? Sparkle;
  return (
    <article className={cn("flex flex-col gap-3 border-t border-border-strong pt-5", className)}>
      <div className="flex items-center justify-between">
        <span className="flex size-9 items-center justify-center rounded-full bg-muted text-foreground">
          <Icon className="size-4" strokeWidth={1.6} aria-hidden />
        </span>
        <span className="font-mono text-[11px] text-subtle-foreground">{String(index + 1).padStart(2, "0")}</span>
      </div>
      <h3 className="text-[15px] font-semibold tracking-tight">{change.title}</h3>
      <p className="text-[15px] leading-relaxed text-foreground/85">{change.summary}</p>
      {change.rationale && <p className="text-sm leading-relaxed text-muted-foreground">{change.rationale}</p>}
    </article>
  );
}

export function ChangeCards({ changes }: { changes: AnalysisChange[] }) {
  return (
    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-3">
      {changes.map((change, i) => (
        <ChangeCard key={change.id} change={change} index={i} />
      ))}
    </div>
  );
}
