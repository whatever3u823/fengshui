import {
  BalanceDiagram,
  ClutterDiagram,
  CommandPositionDiagram,
  ElementsDiagram,
  FlowDiagram,
} from "@/components/learn/principle-diagrams";
import { Term } from "@/components/learn/term";
import { Ripples } from "@/components/site/ambient";
import type { GlossaryId } from "@/lib/domain/glossary";
import { cn } from "@/lib/utils";

/**
 * "Feng Shui in plain words": the five ideas behind every recommendation,
 * each with a diagram, a plain explanation, what it looks like in a room,
 * and the classical idea it comes from.
 */
export const PRINCIPLES: Array<{
  id: string;
  term: GlossaryId;
  title: string;
  name: string;
  plain: string;
  inRoom: string;
  tradition: string;
  Diagram: () => React.JSX.Element;
  tint: string;
}> = [
  {
    id: "flow",
    term: "chi",
    title: "Flow",
    name: "Chi",
    plain: "How easily you, light and air move through a room.",
    inRoom: "A clear first step from the door, walkways wide enough to pass, nothing to squeeze around.",
    tradition: "Chi should meander like a slow stream — never rushing in a straight line, never pooling.",
    Diagram: FlowDiagram,
    tint: "bg-mist/70",
  },
  {
    id: "command",
    term: "commandPosition",
    title: "Command position",
    name: "Seeing the door",
    plain: "Your bed, desk or main seat faces the door from a distance, not in line with it.",
    inRoom: "Usually diagonally across from the entry, with a solid wall — not a window — behind you.",
    tradition: "The classical “armchair”: solid support behind (the Black Tortoise), open space ahead (the Red Phoenix).",
    Diagram: CommandPositionDiagram,
    tint: "bg-sage-soft/80",
  },
  {
    id: "balance",
    term: "yinYang",
    title: "Balance",
    name: "Yin and yang",
    plain: "An even spread of visual weight, light and dark, soft and hard.",
    inRoom: "Pairs either side of the bed, heavy furniture offset by open space, warm light at night.",
    tradition: "Yin is quiet and soft, yang bright and active; each room needs its own mix of both.",
    Diagram: BalanceDiagram,
    tint: "bg-sand/70",
  },
  {
    id: "elements",
    term: "fiveElements",
    title: "Natural elements",
    name: "The five elements",
    plain: "A considered mix of materials, colors and shapes, including living things.",
    inRoom: "Timber and plants, warm light, ceramics, a touch of metal, glass or a mirror used sparingly.",
    tradition: "Wood, Fire, Earth, Metal and Water nourish and temper one another in a cycle.",
    Diagram: ElementsDiagram,
    tint: "bg-surface/80",
  },
  {
    id: "clutter",
    term: "stagnantChi",
    title: "Breathing room",
    name: "Clearing stagnant chi",
    plain: "Only what belongs in the room, with open floor and clear surfaces.",
    inRoom: "Nothing stored on the floor, a few intentional objects, corners that aren't forgotten.",
    tradition: "Clearing comes first in classical practice: energy can't move where things pile up.",
    Diagram: ClutterDiagram,
    tint: "bg-mist/60",
  },
];

export function PrincipleCard({ principle, className }: { principle: (typeof PRINCIPLES)[number]; className?: string }) {
  const { Diagram } = principle;
  return (
    <article className={cn("reveal flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface/70 backdrop-blur-sm", className)}>
      <div className={cn("px-6 pb-2 pt-6", principle.tint)}>
        <div className="mx-auto max-w-[220px]">
          <Diagram />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-3 p-6">
        <div>
          <h3 className="font-display text-[1.7rem] leading-tight">{principle.title}</h3>
          <p className="mt-0.5 text-xs text-subtle-foreground">
            In Feng Shui: <Term id={principle.term}>{principle.name}</Term>
          </p>
        </div>
        <p className="text-[15px] leading-relaxed text-foreground/90">{principle.plain}</p>
        <p className="text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground/80">Looks like: </span>
          {principle.inRoom}
        </p>
        <p className="mt-auto border-t border-border pt-3 text-sm leading-relaxed text-muted-foreground">
          <span className="font-medium text-water">The tradition: </span>
          {principle.tradition}
        </p>
      </div>
    </article>
  );
}

export function PrinciplesGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-5 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {PRINCIPLES.map((p) => (
        <PrincipleCard key={p.id} principle={p} />
      ))}
      <aside className="reveal relative flex flex-col gap-5 overflow-hidden rounded-2xl bg-primary p-6 text-primary-foreground sm:col-span-2 lg:col-span-1">
        <Ripples tone="light" className="-bottom-24 -right-24 size-72" />
        <p className="relative font-display text-[1.7rem] leading-tight">A tradition, read with care.</p>
        <div className="relative space-y-3 text-sm leading-relaxed text-primary-foreground/75">
          <p>
            Feng Shui is a centuries-old Chinese practice of arranging space. We work in its{" "}
            <Term id="formSchool" className="decoration-primary-foreground/50 hover:bg-primary-foreground/10 focus-visible:bg-primary-foreground/10">form-school</Term>{" "}
            tradition — reading what a photo actually shows.
          </p>
          <p>
            Traditional meanings are described as beliefs, never promises. Every suggestion also has a practical design
            reason you can judge for yourself.
          </p>
        </div>
      </aside>
    </div>
  );
}
