"use client";

import * as React from "react";
import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Ripples } from "@/components/site/ambient";
import type { PublicError } from "@/lib/errors";
import { cn } from "@/lib/utils";

export const PIPELINE_STAGES = [
  { id: "layout", label: "Identifying room layout" },
  { id: "furniture", label: "Mapping furniture" },
  { id: "pathways", label: "Evaluating pathways" },
  { id: "balance", label: "Analyzing spatial balance" },
  { id: "opportunities", label: "Identifying Feng Shui opportunities" },
  { id: "design", label: "Designing improvements" },
  { id: "render", label: "Rendering your optimized room" },
] as const;
export type PipelineStageId = (typeof PIPELINE_STAGES)[number]["id"];
export type StageStatus = "pending" | "active" | "done" | "skipped";

const WAIT_NOTES = [
  "In Feng Shui the entry door is called the “mouth of chi” — where energy, like people, comes in. We look closely at your first step inside.",
  "The “command position” means seeing the door from your bed or desk without being in line with it — usually diagonally across the room.",
  "Chi (pronounced “chee”) is pictured as a slow stream: it should meander through a room, not rush straight through or get stuck.",
  "Yin is soft, quiet and dim; yang is bright and lively. Bedrooms lean yin, while living spaces can hold more yang.",
  "The five elements — Wood, Fire, Earth, Metal and Water — show up as materials, colors and shapes: timber, warm light, ceramics, metal, glass.",
  "Clearing clutter is traditionally the first step, before anything new is added to a room.",
];

function useRotating(count: number, ms: number, running: boolean) {
  const [index, setIndex] = React.useState(0);
  React.useEffect(() => {
    if (!running) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), ms);
    return () => clearInterval(id);
  }, [count, ms, running]);
  return index;
}

function useElapsed(running: boolean) {
  const [seconds, setSeconds] = React.useState(0);
  React.useEffect(() => {
    if (!running) return;
    const started = Date.now();
    const id = setInterval(() => setSeconds(Math.floor((Date.now() - started) / 1000)), 1000);
    return () => clearInterval(id);
  }, [running]);
  return seconds;
}

export function ProcessingStep({
  previewUrl,
  aspect,
  stages,
  summary,
  error,
  onCancel,
  onRetry,
  onStartOver,
}: {
  previewUrl: string;
  aspect: number;
  stages: Record<PipelineStageId, StageStatus>;
  summary: string | null;
  error: PublicError | null;
  onCancel: () => void;
  onRetry: () => void;
  onStartOver: () => void;
}) {
  const rendering = stages.render === "active";
  const running = !error;
  const elapsed = useElapsed(running);
  const note = useRotating(WAIT_NOTES.length, 8000, running);
  const heading = error ? "We couldn't finish this one" : rendering ? "Rendering your optimized room…" : "Analyzing your room…";

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-7">
        <figure className="relative overflow-hidden rounded-[1.75rem] bg-muted shadow-[0_40px_100px_-50px_rgba(34,56,44,0.5)]" style={{ aspectRatio: aspect }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
          <img
            src={previewUrl}
            alt="Your room being analyzed"
            className={cn("absolute inset-0 size-full object-cover transition-[filter,opacity] duration-700", running && "opacity-90 saturate-[0.85]")}
          />
          {running && (
            <>
              <div className="absolute inset-0 bg-gradient-to-br from-pine/25 via-transparent to-water/20" />
              <Ripples tone="light" className="left-1/2 top-1/2 aspect-square w-[58%] -translate-x-1/2 -translate-y-1/2" />
            </>
          )}
        </figure>
      </div>

      <div className="lg:col-span-5" aria-live="polite">
        <h1 className="font-display-light text-[2.5rem] leading-[1.05] sm:text-[3rem]">{heading}</h1>
        {!error && (
          <p className="mt-3 text-sm tabular-nums text-subtle-foreground">
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
            {rendering && " · this last step usually takes under two minutes"}
          </p>
        )}

        {error ? (
          <div className="mt-6 space-y-8">
            <p className="flex items-start gap-2.5 text-[17px] leading-relaxed text-muted-foreground">
              <CircleAlert className="mt-1.5 size-4 shrink-0 text-destructive" aria-hidden />
              {error.message}
            </p>
            <div className="flex flex-wrap gap-3">
              {error.retryable && <Button onClick={onRetry}>Try again</Button>}
              <Button variant="outline" onClick={onStartOver}>
                Choose another photo
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ol className="mt-10 space-y-4">
              {PIPELINE_STAGES.map((stage) => {
                const status = stages[stage.id];
                if (status === "skipped") return null;
                return (
                  <li
                    key={stage.id}
                    className={cn(
                      "flex items-center gap-3 text-[15px] transition-colors duration-300",
                      status === "pending" && "text-subtle-foreground",
                      status === "active" && "text-foreground",
                      status === "done" && "text-foreground/70",
                    )}
                  >
                    <span className="flex size-5 items-center justify-center">
                      {status === "done" ? (
                        <Check className="size-4 text-strong" strokeWidth={2} aria-label="done" />
                      ) : status === "active" ? (
                        <LoaderCircle className="size-4 animate-spin text-primary" strokeWidth={1.75} aria-label="in progress" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-border-strong" aria-hidden />
                      )}
                    </span>
                    {stage.label}
                  </li>
                );
              })}
            </ol>
            {summary && <p className="animate-fade-up mt-8 border-t border-border pt-5 text-sm text-muted-foreground">{summary}</p>}
            <div className="mt-10 rounded-3xl bg-mist/60 p-6 sm:p-7">
              <p className="kicker text-water">A thought while you wait</p>
              <p key={note} className="animate-fade-in mt-2 font-display text-[1.4rem] leading-snug text-foreground/85">
                {WAIT_NOTES[note]}
              </p>
            </div>
            <Button variant="link" onClick={onCancel} className="mt-8 text-muted-foreground">
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
