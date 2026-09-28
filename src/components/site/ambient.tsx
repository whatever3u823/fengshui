/**
 * The page's atmosphere: two slow pools of light, like sun through leaves over
 * water, and a fine paper grain. It sits behind all content, so photographs
 * are never tinted. Radial gradients only (no blur filters) to stay light on phones.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="ambient-blob animate-drift-a left-[-20%] top-[-25%] h-[75vmax] w-[75vmax]"
        style={{ background: "radial-gradient(closest-side, rgba(143,166,139,0.22), rgba(143,166,139,0) 72%)" }}
      />
      <div
        className="ambient-blob animate-drift-b bottom-[-35%] right-[-25%] h-[70vmax] w-[70vmax]"
        style={{ background: "radial-gradient(closest-side, rgba(224,232,229,0.95), rgba(224,232,229,0) 72%)" }}
      />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}

/** Concentric rings that expand like a drop on still water. Used sparingly. */
export function Ripples({ className, tone = "sage" }: { className?: string; tone?: "sage" | "light" }) {
  const color = tone === "light" ? "border-primary-foreground/20" : "border-sage/45";
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className ?? ""}`}>
      {[0, 1, 2].map((i) => (
        <span key={i} className={`animate-ripple absolute inset-0 rounded-full border ${color}`} style={{ animationDelay: `${i * 2.6}s` }} />
      ))}
    </div>
  );
}
