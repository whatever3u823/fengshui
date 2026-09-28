"use client";

import * as React from "react";
import * as Popover from "@radix-ui/react-popover";
import { GLOSSARY, GLOSSARY_ENTRIES, type GlossaryEntry, type GlossaryId } from "@/lib/domain/glossary";
import { cn } from "@/lib/utils";

/**
 * An inline Feng Shui term with its definition one tap (or hover) away.
 * Works with touch, mouse and keyboard; the definition gives the everyday
 * meaning first and the classical idea after, so nothing is dumbed down.
 */
export function Term({ id, children, className }: { id: GlossaryId; children?: React.ReactNode; className?: string }) {
  const entry = GLOSSARY[id];
  const [open, setOpen] = React.useState(false);
  const closeTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const hoverOpen = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  };
  const hoverClose = (e: React.PointerEvent) => {
    if (e.pointerType !== "mouse") return;
    closeTimer.current = setTimeout(() => setOpen(false), 180);
  };

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          onPointerEnter={hoverOpen}
          onPointerLeave={hoverClose}
          className={cn(
            "inline cursor-help rounded-[3px] text-left underline decoration-sage decoration-dotted decoration-[1.5px] underline-offset-[3px] transition-colors hover:bg-sage-soft hover:decoration-solid focus-visible:bg-sage-soft",
            className,
          )}
          aria-label={`${typeof children === "string" ? children : entry.term}: show definition`}
        >
          {children ?? entry.term}
        </button>
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content
          side="top"
          align="center"
          sideOffset={8}
          collisionPadding={16}
          onPointerEnter={hoverOpen}
          onPointerLeave={hoverClose}
          onOpenAutoFocus={(e) => e.preventDefault()}
          className="z-50 w-[min(22rem,calc(100vw-2rem))] rounded-xl border border-border bg-surface p-4 text-left shadow-[0_12px_40px_-12px_rgba(31,42,34,0.35)] data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        >
          <GlossaryCard entry={entry} compact />
          <Popover.Arrow className="fill-surface" width={14} height={7} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export function GlossaryCard({ entry, compact = false }: { entry: GlossaryEntry; compact?: boolean }) {
  return (
    <div className={cn("space-y-2.5", compact ? "text-[13px]" : "text-sm")}>
      <p className="flex flex-wrap items-baseline gap-x-2">
        <span className={cn("font-display text-foreground", compact ? "text-xl" : "text-2xl")}>{entry.term}</span>
        {entry.aside && <span className="text-xs text-subtle-foreground">{entry.aside}</span>}
      </p>
      <p className="leading-relaxed text-foreground/90">{entry.plain}</p>
      <p className="leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground/80">In a room: </span>
        {entry.inRoom}
      </p>
      <p className="border-t border-border pt-2.5 leading-relaxed text-muted-foreground">
        <span className="font-medium text-water">The tradition: </span>
        {entry.tradition}
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Auto-linking of terms inside free text (AI-generated or fixture copy).
// ---------------------------------------------------------------------------

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const ALIAS_TO_ID = new Map<string, GlossaryId>();
for (const entry of GLOSSARY_ENTRIES) {
  for (const alias of entry.aliases) ALIAS_TO_ID.set(alias.toLowerCase(), entry.id as GlossaryId);
}
// Longest aliases first so "mouth of chi" wins over "chi".
const MATCHER = new RegExp(
  `(?<![\\w'-])(${[...ALIAS_TO_ID.keys()].sort((a, b) => b.length - a.length).map(escape).join("|")})(?![\\w-])`,
  "gi",
);

/**
 * Renders text with the first mention of each glossary term turned into a
 * <Term>. Pure: each block links its own first mentions, so any card read on
 * its own still explains itself.
 */
export function GlossaryText({ text, skip }: { text: string; skip?: readonly GlossaryId[] }) {
  const used = new Set<GlossaryId>(skip);
  const parts: React.ReactNode[] = [];
  let last = 0;
  for (const match of text.matchAll(MATCHER)) {
    const id = ALIAS_TO_ID.get(match[1].toLowerCase());
    if (!id || used.has(id)) continue;
    used.add(id);
    const start = match.index ?? 0;
    if (start > last) parts.push(text.slice(last, start));
    parts.push(
      <Term key={`${id}-${start}`} id={id}>
        {match[1]}
      </Term>,
    );
    last = start + match[1].length;
  }
  if (parts.length === 0) return <>{text}</>;
  if (last < text.length) parts.push(text.slice(last));
  return <>{parts}</>;
}
