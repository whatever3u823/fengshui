"use client";

import * as React from "react";
import { Check, CircleAlert, LoaderCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
  const heading = error ? "We hit a snag" : rendering ? "Rendering your optimized room…" : "Analyzing your room…";

  return (
    <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-7">
        <figure className="relative overflow-hidden rounded-md bg-muted" style={{ aspectRatio: aspect }}>
          {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
          <img
            src={previewUrl}
            alt="Your room being analyzed"
            className={cn("absolute inset-0 size-full object-cover transition-[filter,opacity] duration-700", running && "opacity-90 saturate-[0.85]")}
          />
          {running && (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.08)_1px,transparent_1px)] bg-[size:48px_48px]" />
              <div className="animate-scan absolute inset-x-0 top-0 h-[12%] bg-gradient-to-b from-transparent via-white/25 to-transparent" />
            </>
          )}
        </figure>
      </div>

      <div className="lg:col-span-5" aria-live="polite">
        <h1 className="font-display text-4xl leading-tight sm:text-[2.75rem]">{heading}</h1>
        {!error && (
          <p className="mt-2 font-mono text-xs text-subtle-foreground">
            {Math.floor(elapsed / 60)}:{String(elapsed % 60).padStart(2, "0")}
            {rendering && " · rendering usually takes under two minutes"}
          </p>
        )}

        {error ? (
          <div className="mt-6 space-y-5">
            <p className="flex items-start gap-2.5 text-[15px] leading-relaxed">
              <CircleAlert className="mt-1 size-4 shrink-0 text-destructive" aria-hidden />
              {error.message}
            </p>
            <div className="flex flex-wrap gap-2">
              {error.retryable && <Button onClick={onRetry}>Try again</Button>}
              <Button variant="outline" onClick={onStartOver}>
                Choose a different photo
              </Button>
            </div>
          </div>
        ) : (
          <>
            <ol className="mt-8 space-y-3.5">
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
                        <Check className="size-4 text-strong" strokeWidth={2.2} aria-label="done" />
                      ) : status === "active" ? (
                        <LoaderCircle className="size-4 animate-spin" aria-label="in progress" />
                      ) : (
                        <span className="size-1.5 rounded-full bg-border-strong" aria-hidden />
                      )}
                    </span>
                    {stage.label}
                  </li>
                );
              })}
            </ol>
            {summary && <p className="animate-fade-up mt-8 border-t border-border pt-4 text-sm text-muted-foreground">{summary}</p>}
            <Button variant="ghost" size="sm" onClick={onCancel} className="mt-8 -ml-3 text-muted-foreground">
              Cancel
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
