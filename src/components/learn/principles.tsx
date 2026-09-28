import {
  BalanceDiagram,
  ClutterDiagram,
  CommandPositionDiagram,
  ElementsDiagram,
  FlowDiagram,
} from "@/components/learn/principle-diagrams";
import { Term } from "@/components/learn/term";
import type { GlossaryId } from "@/lib/domain/glossary";
import { cn } from "@/lib/utils";

/**
 * The five ideas behind every recommendation: each with a small drawing, a
 * plain explanation, and the classical idea it comes from.
 */
export const PRINCIPLES: Array<{
  id: string;
  term: GlossaryId;
  title: string;
  name: string;
  plain: string;
  tradition: string;
  Diagram: () => React.JSX.Element;
  tint: string;
}> = [
  {
    id: "flow",
    term: "chi",
    title: "Flow",
    name: "chi",
    plain: "How easily you, the light and the air move through a room.",
    tradition: "Chi is pictured as a slow stream. It should meander, never rush straight through or pool.",
    Diagram: FlowDiagram,
    tint: "bg-mist/80",
  },
  {
    id: "command",
    term: "commandPosition",
    title: "Command position",
    name: "seeing the door",
    plain: "Your bed, desk or chair sees the door without sitting directly in line with it.",
    tradition: "The classical ‘armchair’: solid support behind you, open space ahead.",
    Diagram: CommandPositionDiagram,
    tint: "bg-sage-soft",
  },
  {
    id: "balance",
    term: "yinYang",
    title: "Balance",
    name: "yin and yang",
    plain: "Weight, light and texture spread evenly: soft beside firm, shade beside brightness.",
    tradition: "Yin rests and yang enlivens. Every room needs its own measure of both.",
    Diagram: BalanceDiagram,
    tint: "bg-sand/80",
  },
  {
    id: "elements",
    term: "fiveElements",
    title: "Natural elements",
    name: "the five elements",
    plain: "A considered mix of materials, colors and living things.",
    tradition: "Wood, Fire, Earth, Metal and Water nourish and temper one another in a cycle.",
    Diagram: ElementsDiagram,
    tint: "bg-opportunity-soft/55",
  },
  {
    id: "clutter",
    term: "stagnantChi",
    title: "Breathing room",
    name: "clearing stagnant chi",
    plain: "Only what belongs, with open floor and clear surfaces.",
    tradition: "Classical practice begins by clearing. Energy cannot move where things pile up.",
    Diagram: ClutterDiagram,
    tint: "bg-mist/70",
  },
];

export function PrincipleCard({ principle, className }: { principle: (typeof PRINCIPLES)[number]; className?: string }) {
  const { Diagram } = principle;
  return (
    <article className={cn("reveal flex flex-col", className)}>
      <div className={cn("flex aspect-[4/3] items-center justify-center rounded-3xl px-10", principle.tint)}>
        <div className="w-full max-w-[210px]">
          <Diagram />
        </div>
      </div>
      <h3 className="mt-6 font-display text-[1.85rem] font-medium leading-tight">{principle.title}</h3>
      <p className="mt-0.5 font-display text-lg italic text-primary">
        <Term id={principle.term}>{principle.name}</Term>
      </p>
      <p className="mt-3 text-[15px] leading-relaxed text-foreground/85">{principle.plain}</p>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{principle.tradition}</p>
    </article>
  );
}

/** Five items, centred three over two so the composition stays balanced. */
export function PrinciplesGrid({ className }: { className?: string }) {
  return (
    <div className={cn("flex flex-wrap justify-center gap-x-8 gap-y-14", className)}>
      {PRINCIPLES.map((p) => (
        <PrincipleCard key={p.id} principle={p} className="w-full sm:w-[calc(50%-1rem)] lg:w-[calc(33.333%-1.34rem)]" />
      ))}
    </div>
  );
}
