"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, Download, LoaderCircle, RefreshCw, Share2 } from "lucide-react";
import { toast } from "sonner";
import { BeforeAfterSlider } from "@/components/compare/before-after-slider";
import { ChangeCards } from "@/components/results/change-cards";
import { AlignmentPanel } from "@/components/results/alignment-panel";
import { IssuesList, ObservedDetails } from "@/components/results/observations";
import { FeelingContrast } from "@/components/results/feeling-contrast";
import { SectionHeader } from "@/components/site/section-header";
import { PrinciplesGrid } from "@/components/learn/principles";
import { GlossaryText } from "@/components/learn/term";
import { Button } from "@/components/ui/button";
import { Disclosure } from "@/components/ui/disclosure";
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

const VIEWS = [
  { id: "slider", label: "Slider" },
  { id: "split", label: "Side by side" },
] as const;

function Photo({ img, alt, label, dim }: { img: StoredImage; alt: string; label?: string; dim?: boolean }) {
  return (
    <figure className="relative overflow-hidden rounded-[1.5rem] bg-muted" style={{ aspectRatio: `${img.width} / ${img.height}` }}>
      {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
      <img src={img.src} alt={alt} className={cn("absolute inset-0 size-full object-cover transition-opacity duration-700", dim && "opacity-55")} />
      {label && (
        <figcaption className="absolute left-3 top-3 rounded-full bg-black/35 px-3 py-1 text-xs font-medium text-white backdrop-blur-md">
          {label}
        </figcaption>
      )}
    </figure>
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
    <Button variant="link" onClick={onStartOver} className="text-[15px]">
      Start Another Room
    </Button>
  ) : (
    <Button variant="link" asChild className="text-[15px]">
      <Link href="/optimize">
        Optimize My Room <ArrowRight />
      </Link>
    </Button>
  );

  const projected = optimized !== null;

  return (
    <div className="animate-fade-in">
      {/* The result */}
      <header className="mx-auto max-w-3xl text-center">
        <p className="kicker text-primary">
          {roomLabel} · {FENG_SHUI_MODE_LABELS[fengShuiMode].label}
        </p>
        <h1 className="mt-3 font-display-light text-[2.75rem] leading-[1.02] sm:text-[4rem] lg:text-[4.5rem]">
          {context === "example" ? "A Feng Shui Transformation" : "Your Feng Shui Transformation"}
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
          <GlossaryText text={analysis.overallAssessment} />
        </p>
      </header>

      {notice && <div className="mt-8 flex justify-center">{notice}</div>}

      <div className="mt-12 sm:mt-14">
        {optimized && (
          <div className="mb-5 flex justify-center">
            <div className="flex rounded-full bg-muted/80 p-1" role="group" aria-label="Comparison view">
              {VIEWS.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setView(v.id)}
                  aria-pressed={view === v.id}
                  className={cn(
                    "min-h-9 rounded-full px-4 text-sm transition-[background-color,color,box-shadow] duration-300 ease-calm",
                    view === v.id ? "bg-surface text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="rounded-[2rem] border border-white/70 bg-surface/50 p-2 shadow-[0_40px_100px_-50px_rgba(34,56,44,0.5)] backdrop-blur-sm sm:p-3">
          {optimized ? (
            view === "slider" ? (
              <BeforeAfterSlider
                beforeSrc={original.src}
                afterSrc={optimized.src}
                width={original.width}
                height={original.height}
                beforeAlt={`Original ${roomLabel.toLowerCase()} photo`}
                afterAlt={`${roomLabel} rearranged following Feng Shui recommendations`}
                className="rounded-[1.5rem]"
                priority
              />
            ) : (
              <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
                <Photo img={original} alt={`Original ${roomLabel.toLowerCase()} photo`} label="Before" />
                <Photo img={optimized} alt={`${roomLabel} rearranged following Feng Shui recommendations`} label="After" />
              </div>
            )
          ) : (
            <div className="relative">
              <Photo img={original} alt={`Original ${roomLabel.toLowerCase()} photo`} dim={renderState.status === "rendering"} />
              {renderState.status === "rendering" && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="flex items-center gap-2.5 rounded-full bg-surface/90 px-5 py-2.5 text-sm shadow-sm backdrop-blur">
                    <LoaderCircle className="size-4 animate-spin text-primary" /> Rendering your optimized room…
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {renderState.status === "failed" && (
          <div className="mx-auto mt-6 flex max-w-2xl flex-col items-center gap-4 text-center">
            <p className="text-[15px] leading-relaxed text-muted-foreground">{renderState.error.message}</p>
            {renderState.error.retryable && onRetryRender && (
              <Button variant="outline" onClick={onRetryRender}>
                <RefreshCw /> Try rendering again
              </Button>
            )}
          </div>
        )}
        {renderState.status === "unavailable" && (
          <p className="mx-auto mt-6 max-w-2xl text-center text-[15px] leading-relaxed text-muted-foreground">{renderState.message}</p>
        )}

        {/* Actions: centered beneath the image on larger screens, a quiet bar within thumb's reach on phones. */}
        <div data-action-bar="md" className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-border/70 bg-background/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl md:static md:z-auto md:mt-8 md:justify-center md:gap-3 md:border-0 md:bg-transparent md:p-0 md:backdrop-blur-none">
          <Button onClick={handleDownload} disabled={!optimized || busy !== null} className="flex-1 md:flex-none">
            {busy === "download" ? <LoaderCircle className="animate-spin" /> : <Download />} Download Image
          </Button>
          <Button variant="outline" onClick={handleShare} disabled={!optimized || busy !== null} className="flex-1 md:flex-none">
            {busy === "share" ? <LoaderCircle className="animate-spin" /> : <Share2 />} Share
          </Button>
          <div className="hidden md:ml-4 md:flex">{startOver}</div>
        </div>
      </div>

      {/* How it feels */}
      <section className="pt-24 sm:pt-32" aria-labelledby="feel-title">
        <SectionHeader id="feel-title" kicker="The difference" title="How the Room Feels">
          What weighed on the room, and what each change gives back.
        </SectionHeader>
        <FeelingContrast contrast={analysis.contrast} projected={projected} className="mt-12 sm:mt-16" />
      </section>

      {/* What changed */}
      <section className="pt-24 sm:pt-32" aria-labelledby="changes-title">
        <SectionHeader id="changes-title" kicker="The changes" title="What We Changed">
          Each change, what it does, and the Feng Shui idea behind it.
        </SectionHeader>
        <ChangeCards changes={analysis.changes} issues={analysis.issues} className="mt-12 sm:mt-16" />
      </section>

      {/* The reading */}
      <section className="pt-24 sm:pt-32" aria-labelledby="alignment-title">
        <SectionHeader id="alignment-title" kicker="The reading" title="Feng Shui Alignment">
          Six principles, each phrased as a question you can ask of your own room.
        </SectionHeader>
        <AlignmentPanel
          alignment={analysis.alignment}
          showProjected={projected || renderState.status !== "done"}
          className="mt-12 sm:mt-16"
        />
      </section>

      {/* Go deeper */}
      <section className="mx-auto max-w-4xl pt-24 sm:pt-32" aria-labelledby="deeper-title">
        <p id="deeper-title" className="kicker text-center text-primary">
          Go deeper
        </p>
        <div className="mt-6 border-t border-border">
          <Disclosure title="The full reading" description="Everything we observed, what we'd change, and the reasoning behind it.">
            <IssuesList issues={analysis.issues} />
            <div className="mt-10">
              <p className="mb-2 text-sm font-medium">What the photo shows</p>
              <ObservedDetails observed={analysis.observed} />
            </div>
          </Disclosure>
          <Disclosure title="Feng Shui, in plain words" description="The five ideas behind every suggestion. Tap any underlined word for a definition.">
            <PrinciplesGrid className="pt-2" />
          </Disclosure>
          {(analysisMeta || generationMeta) && (
            <Disclosure title="How this was made" description="The models used, and the exact instructions given to the image model.">
              <dl className="grid gap-x-8 gap-y-2 text-sm sm:grid-cols-[8rem_minmax(0,1fr)]">
                {analysisMeta && (
                  <>
                    <dt className="text-muted-foreground">Analysis</dt>
                    <dd>
                      {analysisMeta.isSample
                        ? "A pre-written sample analysis (Demo Mode)"
                        : `${analysisMeta.provider} · ${analysisMeta.model} · ${(analysisMeta.durationMs / 1000).toFixed(1)}s`}
                    </dd>
                  </>
                )}
                {generationMeta && (
                  <>
                    <dt className="text-muted-foreground">Image</dt>
                    <dd>
                      {generationMeta.isSample
                        ? "A pre-rendered sample image (Demo Mode)"
                        : `${generationMeta.provider} · ${generationMeta.model} · ${(generationMeta.durationMs / 1000).toFixed(1)}s`}
                    </dd>
                  </>
                )}
              </dl>
              {generationMeta && (
                <pre className="mt-6 max-h-80 overflow-auto whitespace-pre-wrap rounded-2xl bg-muted/70 p-5 font-sans text-[13px] leading-relaxed text-foreground/80">
                  {generationMeta.prompt}
                </pre>
              )}
            </Disclosure>
          )}
        </div>
      </section>

      <div className="mx-auto mt-16 flex max-w-xl flex-col items-center gap-6 text-center">
        <p className="text-xs leading-relaxed text-subtle-foreground">
          Before moving anything, make sure exits, radiators and outlets stay clear.
        </p>
        <div className="md:hidden">{startOver}</div>
      </div>
    </div>
  );
}
