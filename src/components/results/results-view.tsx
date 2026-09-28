"use client";

import * as React from "react";
import Link from "next/link";
import { Columns2, Download, LoaderCircle, RefreshCw, RotateCcw, Share2, SplitSquareHorizontal } from "lucide-react";
import { toast } from "sonner";
import { BeforeAfterSlider } from "@/components/compare/before-after-slider";
import { ChangeCards } from "@/components/results/change-cards";
import { AlignmentPanel } from "@/components/results/alignment-panel";
import { IssuesList, ObservedDetails } from "@/components/results/observations";
import { PrinciplesGrid } from "@/components/learn/principles";
import { GlossaryText } from "@/components/learn/term";
import { Ripples } from "@/components/site/ambient";
import { Button } from "@/components/ui/button";
import { FENG_SHUI_MODE_LABELS, ROOM_TYPE_LABELS, type FengShuiMode } from "@/lib/domain/options";
import type { RoomAnalysis } from "@/lib/ai/schema";
import type { AnalysisMeta, GenerationMeta, StoredImage } from "@/lib/domain/types";
import type { PublicError } from "@/lib/errors";
import { composeBeforeAfter, srcToBlob, triggerDownload } from "@/lib/client/image-actions";
import { cn } from "@/lib/utils";

export type RenderState =
  | { status: "done" }
  | { status: "rendering" }
  | { status: "unavailable"; message: string }
  | { status: "failed"; error: PublicError };

interface ResultsViewProps {
  original: StoredImage;
  optimized: StoredImage | null;
  analysis: RoomAnalysis;
  fengShuiMode: FengShuiMode;
  analysisMeta?: AnalysisMeta | null;
  generationMeta?: GenerationMeta | null;
  renderState: RenderState;
  notice?: React.ReactNode;
  context: "app" | "example";
  onRetryRender?: () => void;
  onStartOver?: () => void;
}

function Section({ id, eyebrow, title, intro, children, aside }: { id?: string; eyebrow?: string; title: string; intro?: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 pt-4 sm:pt-6">
      <div className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
          <h2 className="font-display text-4xl sm:text-5xl">{title}</h2>
          {intro && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-muted-foreground">{intro}</p>}
        </div>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function ResultsView({
  original,
  optimized,
  analysis,
  fengShuiMode,
  analysisMeta,
  generationMeta,
  renderState,
  notice,
  context,
  onRetryRender,
  onStartOver,
}: ResultsViewProps) {
  const [view, setView] = React.useState<"slider" | "split">("slider");
  const [busy, setBusy] = React.useState<"download" | "share" | null>(null);
  const roomLabel = ROOM_TYPE_LABELS[analysis.roomType];

  const handleDownload = async () => {
    if (!optimized) return;
    setBusy("download");
    try {
      triggerDownload(await srcToBlob(optimized.src), `feng-shui-${analysis.roomType.replace("_", "-")}-optimized.jpg`);
    } catch {
      toast.error("We couldn't prepare the download. Please try again.");
    } finally {
      setBusy(null);
    }
  };

  const handleShare = async () => {
    if (!optimized) return;
    setBusy("share");
    try {
      const blob = await composeBeforeAfter(original.src, optimized.src);
      const file = new File([blob], "feng-shui-before-after.jpg", { type: "image/jpeg" });
      const data: ShareData = {
        files: [file],
        title: "My Feng Shui transformation",
        text: `My ${roomLabel.toLowerCase()}, rearranged with Feng Shui AI.`,
      };
      if (typeof navigator.canShare === "function" && navigator.canShare(data)) {
        await navigator.share(data);
      } else {
        triggerDownload(blob, file.name);
        toast("Saved a before/after image you can share anywhere.");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return; // user closed the share sheet
      toast.error("Sharing isn't available right now. Try downloading instead.");
    } finally {
      setBusy(null);
    }
  };

  const startOver = onStartOver ? (
    <Button variant="ghost" onClick={onStartOver} className="flex-1 md:flex-none">
      <RotateCcw /> Start Another Room
    </Button>
  ) : (
    <Button variant="ghost" asChild className="flex-1 md:flex-none">
      <Link href="/optimize">
        <RotateCcw /> Optimize My Room
      </Link>
    </Button>
  );

  return (
    <div className="animate-fade-up space-y-12 pb-28 sm:space-y-20 md:pb-10">
      <header className="max-w-3xl">
        <p className="eyebrow mb-3">
          {roomLabel} · {FENG_SHUI_MODE_LABELS[fengShuiMode].label}
        </p>
        <h1 className="font-display text-[2.6rem] leading-[1.05] sm:text-6xl">
          {context === "example" ? "A Feng Shui Transformation" : "Your Feng Shui Transformation"}
        </h1>
      </header>

      {notice}

      <div className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {optimized ? (view === "slider" ? "Drag to compare" : "Original and optimized") : "Your photo"}
          </p>
          {optimized && (
            <div className="flex rounded-full border border-border bg-surface/70 p-0.5" role="group" aria-label="Comparison view">
              <button
                type="button"
                onClick={() => setView("slider")}
                aria-pressed={view === "slider"}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors", view === "slider" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                <SplitSquareHorizontal className="size-3.5" /> Slider
              </button>
              <button
                type="button"
                onClick={() => setView("split")}
                aria-pressed={view === "split"}
                className={cn("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors", view === "split" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground")}
              >
                <Columns2 className="size-3.5" /> Side by side
              </button>
            </div>
          )}
        </div>

        <div className="relative">
        <Ripples className="-right-16 -top-16 hidden size-72 lg:block" />
        <div className="relative rounded-[26px] border border-white/60 bg-gradient-to-br from-sage-soft/80 via-surface/50 to-mist/80 p-2 shadow-[0_30px_80px_-40px_rgba(31,58,45,0.45)] sm:p-3">
        {optimized ? (
          view === "slider" ? (
            <BeforeAfterSlider
              beforeSrc={original.src}
              afterSrc={optimized.src}
              width={original.width}
              height={original.height}
              beforeAlt={`Original ${roomLabel.toLowerCase()} photo`}
              afterAlt={`${roomLabel} rearranged following Feng Shui recommendations`}
              className="rounded-[18px]"
              priority
            />
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {[
                { img: original, label: "Original" },
                { img: optimized, label: "Feng Shui Optimized" },
              ].map(({ img, label }) => (
                <figure key={label} className="relative overflow-hidden rounded-[18px] bg-muted" style={{ aspectRatio: `${img.width} / ${img.height}` }}>
                  {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
                  <img src={img.src} alt={label} className="absolute inset-0 size-full object-cover" />
                  <figcaption className="absolute left-3 top-3 rounded-sm bg-black/45 px-2 py-1 text-[11px] font-medium text-white backdrop-blur-sm">
                    {label}
                  </figcaption>
                </figure>
              ))}
            </div>
          )
        ) : (
          <figure className="relative overflow-hidden rounded-[18px] bg-muted" style={{ aspectRatio: `${original.width} / ${original.height}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
            <img src={original.src} alt={`Original ${roomLabel.toLowerCase()} photo`} className={cn("absolute inset-0 size-full object-cover", renderState.status === "rendering" && "opacity-60")} />
            {renderState.status === "rendering" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="flex items-center gap-2 rounded-full bg-background/90 px-4 py-2.5 text-sm shadow-sm backdrop-blur">
                  <LoaderCircle className="size-4 animate-spin" /> Rendering your optimized room…
                </span>
              </div>
            )}
          </figure>
        )}

        </div>
        </div>

        {renderState.status === "failed" && (
          <div className="flex flex-col gap-3 rounded-xl border border-opportunity/30 bg-opportunity-soft/60 p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-foreground/85">{renderState.error.message}</p>
            {renderState.error.retryable && onRetryRender && (
              <Button variant="outline" size="sm" onClick={onRetryRender}>
                <RefreshCw /> Try rendering again
              </Button>
            )}
          </div>
        )}
        {renderState.status === "unavailable" && (
          <p className="rounded-xl border border-border bg-surface/70 p-4 text-sm text-muted-foreground">{renderState.message}</p>
        )}

        <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border bg-background/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md md:static md:z-auto md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <Button onClick={handleDownload} disabled={!optimized || busy !== null} className="flex-1 md:flex-none">
            {busy === "download" ? <LoaderCircle className="animate-spin" /> : <Download />} Download Image
          </Button>
          <Button variant="outline" onClick={handleShare} disabled={!optimized || busy !== null} className="flex-1 md:flex-none">
            {busy === "share" ? <LoaderCircle className="animate-spin" /> : <Share2 />} Share
          </Button>
          <div className="hidden md:ml-auto md:block">{startOver}</div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12">
        <div className="lg:col-span-8">
          <p className="eyebrow mb-3">In short</p>
          <p className="font-display text-[1.6rem] leading-snug text-foreground/90 sm:text-[2rem]">
            <GlossaryText text={analysis.overallAssessment} />
          </p>
        </div>
        <p className="self-end text-sm leading-relaxed text-muted-foreground lg:col-span-4">
          Throughout this page, <span className="underline decoration-sage decoration-dotted decoration-[1.5px] underline-offset-[3px]">underlined terms</span>{" "}
          can be tapped for their everyday meaning and the classical idea behind them.
        </p>
      </div>

      <details className="group rounded-2xl border border-border/80 bg-mist/50 backdrop-blur-sm">
        <summary className="flex cursor-pointer list-none flex-col gap-1 px-5 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <span>
            <span className="font-display text-2xl">New to Feng Shui?</span>
            <span className="mt-0.5 block text-sm text-muted-foreground">The five ideas behind these suggestions, in plain words — two minutes to read.</span>
          </span>
          <span className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-primary sm:mt-0">
            <span className="group-open:hidden">Show the basics</span>
            <span className="hidden group-open:inline">Hide</span>
            <span className="text-lg leading-none transition-transform group-open:rotate-45">+</span>
          </span>
        </summary>
        <div className="border-t border-border/80 p-4 sm:p-6">
          <PrinciplesGrid />
        </div>
      </details>

      <Section eyebrow="The edit" title="What We Changed" intro="Each change, what it does in practical terms, and the Feng Shui idea it comes from.">
        <ChangeCards changes={analysis.changes} issues={analysis.issues} />
      </Section>

      <Section eyebrow="Assessment" title="Feng Shui Alignment" intro="Six principles, each phrased as a question you can check in your own room.">
        <AlignmentPanel alignment={analysis.alignment} showProjected={optimized !== null || renderState.status !== "done"} />
      </Section>

      <Section eyebrow="Observed vs. recommended" title="What We Noticed" intro="What the photo shows, kept separate from what we suggest — and the traditional reasoning behind each point.">
        <IssuesList issues={analysis.issues} />
        <details className="group mt-8 rounded-2xl border border-border bg-surface/70">
          <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium">
            Detailed observations
            <span className="text-subtle-foreground transition-transform group-open:rotate-45">+</span>
          </summary>
          <div className="border-t border-border px-5 pb-2">
            <ObservedDetails observed={analysis.observed} />
          </div>
        </details>
        {(analysisMeta || generationMeta) && (
          <details className="group mt-3 rounded-2xl border border-border bg-surface/70">
            <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-medium">
              How this was generated
              <span className="text-subtle-foreground transition-transform group-open:rotate-45">+</span>
            </summary>
            <div className="space-y-3 border-t border-border px-5 py-4 text-sm text-muted-foreground">
              {analysisMeta && (
                <p>
                  Analysis: {analysisMeta.isSample ? "pre-written sample analysis (Demo Mode)" : `${analysisMeta.provider} · ${analysisMeta.model}`}
                  {!analysisMeta.isSample && ` · ${(analysisMeta.durationMs / 1000).toFixed(1)}s`}
                </p>
              )}
              {generationMeta && (
                <>
                  <p>
                    Image: {generationMeta.isSample ? "pre-rendered sample image (Demo Mode)" : `${generationMeta.provider} · ${generationMeta.model}`}
                    {!generationMeta.isSample && ` · ${(generationMeta.durationMs / 1000).toFixed(1)}s`}
                  </p>
                  <p className="text-foreground">Edit prompt built from the analysis:</p>
                  <pre className="max-h-72 overflow-auto whitespace-pre-wrap rounded-sm bg-muted p-3 font-mono text-xs leading-relaxed text-foreground/80">
                    {generationMeta.prompt}
                  </pre>
                </>
              )}
            </div>
          </details>
        )}
      </Section>

      <div className="flex flex-col items-start gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-xs leading-relaxed text-subtle-foreground">
          Feng Shui is a traditional philosophy of spatial arrangement. These suggestions are design ideas informed by
          it — not guarantees of any outcome. Check that any real-world move keeps exits, radiators and outlets clear.
        </p>
        <div className="md:hidden">{startOver}</div>
      </div>
    </div>
  );
}
