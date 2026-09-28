import type { RoomAnalysis } from "@/lib/ai/schema";
import { Badge } from "@/components/ui/badge";

const SEVERITY_VARIANT = { high: "opportunity", medium: "moderate", low: "default" } as const;
const SEVERITY_LABEL = { high: "Priority", medium: "Worth addressing", low: "Minor" } as const;

/** Issues, with what was observed kept visibly separate from what is recommended. */
export function IssuesList({ issues }: { issues: RoomAnalysis["issues"] }) {
  if (issues.length === 0) return null;
  return (
    <ul className="divide-y divide-border border-y border-border">
      {issues.map((issue) => (
        <li key={issue.id} className="grid gap-4 py-6 md:grid-cols-[minmax(0,14rem)_minmax(0,1fr)] md:gap-10">
          <div className="flex flex-row items-center gap-3 md:flex-col md:items-start md:gap-2">
            <h3 className="text-[15px] font-semibold tracking-tight">{issue.title}</h3>
            <Badge variant={SEVERITY_VARIANT[issue.severity]}>{SEVERITY_LABEL[issue.severity]}</Badge>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-8">
            <div>
              <p className="eyebrow mb-1.5">Observed</p>
              <p className="text-sm leading-relaxed text-foreground/85">{issue.observation}</p>
            </div>
            <div>
              <p className="eyebrow mb-1.5">Recommended</p>
              <p className="text-sm leading-relaxed text-foreground/85">{issue.recommendation}</p>
            </div>
            {issue.traditionalContext && (
              <p className="font-display text-lg italic leading-snug text-muted-foreground sm:col-span-2">
                {issue.traditionalContext}
              </p>
            )}
          </div>
        </li>
      ))}
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
