/**
 * Slow-drifting pools of light behind the page, like sun through leaves over
 * water. Radial gradients only (no blur filters) so it stays cheap on phones.
 */
export function AmbientBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div
        className="ambient-blob animate-drift-a left-[-18%] top-[-22%] h-[70vmax] w-[70vmax]"
        style={{ background: "radial-gradient(closest-side, rgba(142,165,138,0.30), rgba(142,165,138,0) 70%)" }}
      />
      <div
        className="ambient-blob animate-drift-b right-[-22%] top-[18%] h-[62vmax] w-[62vmax]"
        style={{ background: "radial-gradient(closest-side, rgba(221,231,228,0.9), rgba(221,231,228,0) 70%)" }}
      />
      <div
        className="ambient-blob animate-drift-c bottom-[-30%] left-[20%] h-[60vmax] w-[60vmax]"
        style={{ background: "radial-gradient(closest-side, rgba(235,224,203,0.85), rgba(235,224,203,0) 70%)" }}
      />
    </div>
  );
}

/** Concentric rings that expand like a drop on still water. */
export function Ripples({ className, tone = "sage" }: { className?: string; tone?: "sage" | "light" }) {
  const color = tone === "light" ? "border-primary-foreground/25" : "border-sage/50";
  return (
    <div aria-hidden className={`pointer-events-none absolute ${className ?? ""}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`animate-ripple absolute inset-0 rounded-full border ${color}`}
          style={{ animationDelay: `${i * 2.3}s` }}
        />
      ))}
    </div>
  );
}
