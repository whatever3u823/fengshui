import type { RoomAnalysis } from "@/lib/ai/schema";
import { ISSUE_PRINCIPLES } from "@/lib/domain/glossary";
import { Badge } from "@/components/ui/badge";
import { GlossaryText, Term } from "@/components/learn/term";

const SEVERITY_VARIANT = { high: "opportunity", medium: "moderate", low: "default" } as const;
const SEVERITY_LABEL = { high: "Biggest impact", medium: "Worth addressing", low: "Small touch" } as const;

/**
 * Issues, with what was observed kept visibly separate from what is
 * recommended, and the traditional idea explained rather than assumed.
 */
export function IssuesList({ issues }: { issues: RoomAnalysis["issues"] }) {
  if (issues.length === 0) return null;
  return (
    <ul className="space-y-4">
      {issues.map((issue) => {
        const principle = ISSUE_PRINCIPLES[issue.category];
        return (
          <li
            key={issue.id}
            className="reveal grid gap-5 rounded-2xl border border-border/80 bg-surface/70 p-5 backdrop-blur-sm sm:p-6 md:grid-cols-[minmax(0,13rem)_minmax(0,1fr)] md:gap-10"
          >
            <div className="flex flex-row flex-wrap items-center gap-x-3 gap-y-2 md:flex-col md:items-start">
              <h3 className="font-display text-[1.45rem] leading-tight">{issue.title}</h3>
              <Badge variant={SEVERITY_VARIANT[issue.severity]}>{SEVERITY_LABEL[issue.severity]}</Badge>
              {principle?.term && (
                <p className="w-full text-xs text-subtle-foreground">
                  Feng Shui idea: <Term id={principle.term}>{principle.label}</Term>
                </p>
              )}
            </div>
            <div className="grid gap-5 sm:grid-cols-2 sm:gap-8">
              <div>
                <p className="eyebrow mb-1.5">What we see</p>
                <p className="text-sm leading-relaxed text-foreground/85">{issue.observation}</p>
              </div>
              <div>
                <p className="eyebrow mb-1.5 text-primary">What we&apos;d change</p>
                <p className="text-sm leading-relaxed text-foreground/85">
                  <GlossaryText text={issue.recommendation} />
                </p>
              </div>
              {issue.traditionalContext && (
                <div className="rounded-xl bg-mist/60 px-4 py-3 sm:col-span-2">
                  <p className="mb-1 text-[11px] font-medium uppercase tracking-[0.16em] text-water">The Feng Shui idea</p>
                  <p className="text-[15px] leading-relaxed text-foreground/80">
                    <GlossaryText text={issue.traditionalContext} skip={principle?.term ? [principle.term] : undefined} />
                  </p>
                </div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 py-3.5 sm:grid-cols-[10rem_minmax(0,1fr)] sm:gap-6">
      <dt className="text-sm text-muted-foreground">{label}</dt>
      <dd className="text-sm leading-relaxed">{children}</dd>
    </div>
  );
}

export function ObservedDetails({ observed }: { observed: RoomAnalysis["observed"] }) {
  return (
    <dl className="divide-y divide-border">
      <Row label="Viewpoint">{observed.cameraViewpoint}</Row>
      {observed.openings.length > 0 && (
        <Row label="Doors & windows">
          <ul className="space-y-1">
            {observed.openings.map((o, i) => (
              <li key={i}>
                <span className="capitalize">{o.kind}</span> <span className="text-muted-foreground">— {o.location}</span>
              </li>
            ))}
          </ul>
        </Row>
      )}
      {observed.furniture.length > 0 && (
        <Row label="Furniture">
          <ul className="space-y-1">
            {observed.furniture.map((f, i) => (
              <li key={i}>
                {f.item} <span className="text-muted-foreground">— {f.location}</span>
                {!f.movable && <span className="ml-1.5 text-xs text-subtle-foreground">(fixed)</span>}
              </li>
            ))}
          </ul>
        </Row>
      )}
      {observed.architecture.length > 0 && <Row label="Architecture">{observed.architecture.join(" · ")}</Row>}
      <Row label="Pathways">{observed.pathways}</Row>
      <Row label="Light">{observed.lighting}</Row>
      <Row label="Materials">{observed.materialsAndPalette}</Row>
      <Row label="Visual balance">{observed.visualBalance}</Row>
      {observed.limitations.length > 0 && (
        <Row label="Not visible">
          <ul className="space-y-1 text-muted-foreground">
            {observed.limitations.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </Row>
      )}
    </dl>
  );
}
