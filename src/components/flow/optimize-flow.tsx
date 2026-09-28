"use client";

import * as React from "react";
import { toast } from "sonner";
import { Stepper } from "@/components/flow/stepper";
import { ModeNotice } from "@/components/flow/mode-notice";
import { UploadStep, type SelectedPhoto } from "@/components/flow/upload-step";
import { DetailsStep, type DetailsValue } from "@/components/flow/details-step";
import {
  PIPELINE_STAGES,
  ProcessingStep,
  type PipelineStageId,
  type StageStatus,
} from "@/components/flow/processing-step";
import { ResultsView, type RenderState } from "@/components/results/results-view";
import { analyzeRoom, ApiError, optimizeRoom } from "@/lib/client/api";
import { validateImageFile } from "@/lib/client/validate-file";
import type { AnalyzeRoomResult, OptimizeRoomResult, PublicConfig, RoomProject } from "@/lib/domain/types";
import type { PublicError } from "@/lib/errors";

type Phase = "upload" | "details" | "processing" | "results";

const initialStages = (): Record<PipelineStageId, StageStatus> =>
  Object.fromEntries(PIPELINE_STAGES.map((s) => [s.id, "pending"])) as Record<PipelineStageId, StageStatus>;

function toPublicError(err: unknown): PublicError {
  if (err instanceof ApiError) return err.toPublic();
  return { code: "INTERNAL", message: "Something went wrong. Please try again.", retryable: true };
}

/**
 * Client state machine for upload → details → processing → results.
 * The finished session is kept as a `RoomProject`, the same shape a future
 * "saved rooms" feature would persist.
 */
export function OptimizeFlow({ config }: { config: PublicConfig }) {
  const [phase, setPhase] = React.useState<Phase>("upload");
  const [photo, setPhoto] = React.useState<SelectedPhoto | null>(null);
  const [details, setDetails] = React.useState<DetailsValue>({ roomType: null, priorities: [], fengShuiMode: "traditional" });
  const [stages, setStages] = React.useState(initialStages);
  const [summary, setSummary] = React.useState<string | null>(null);
  const [error, setError] = React.useState<PublicError | null>(null);
  const [analysisResult, setAnalysisResult] = React.useState<AnalyzeRoomResult | null>(null);
  const [generation, setGeneration] = React.useState<OptimizeRoomResult | null>(null);
  const [renderState, setRenderState] = React.useState<RenderState>({ status: "rendering" });
  const [project, setProject] = React.useState<RoomProject | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => () => abortRef.current?.abort(), []);
  React.useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [phase]);
  React.useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.previewUrl);
  }, [photo]);

  const setStage = (id: PipelineStageId, status: StageStatus) => setStages((prev) => ({ ...prev, [id]: status }));

  const render = React.useCallback(
    async (result: AnalyzeRoomResult, signal: AbortSignal): Promise<void> => {
      setStage("render", "active");
      setRenderState({ status: "rendering" });
      try {
        const generated = await optimizeRoom({
          image: result.image,
          analysis: result.analysis,
          analysisToken: result.analysisToken,
          fengShuiMode: details.fengShuiMode,
          signal,
        });
        setGeneration(generated);
        setRenderState({ status: "done" });
        setStage("render", "done");
        setProject((p) => (p ? { ...p, optimizedImage: generated.optimizedImage, generationMeta: generated.meta } : p));
      } catch (err) {
        if (err instanceof ApiError && err.code === "CANCELLED") throw err;
        setRenderState({ status: "failed", error: toPublicError(err) });
      }
    },
    [details.fengShuiMode],
  );

  const run = React.useCallback(async () => {
    if (!photo || !details.roomType) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setPhase("processing");
    setError(null);
    setSummary(null);
    setGeneration(null);
    setAnalysisResult(null);
    setStages(initialStages());
    setStage("layout", "active");

    try {
      const preferences = { roomType: details.roomType, priorities: details.priorities, fengShuiMode: details.fengShuiMode };
      const result = await analyzeRoom({
        file: photo.file,
        preferences,
        signal: controller.signal,
        onStage: (stage, status) => {
          if (stage !== "upload") setStage(stage, status);
        },
      });
      // Close out any stage the stream didn't explicitly finish.
      setStages((prev) => {
        const next = { ...prev };
        for (const s of PIPELINE_STAGES) if (s.id !== "render") next[s.id] = "done";
        return next;
      });
      setAnalysisResult(result);
      const { observed, issues } = result.analysis;
      setSummary(
        `Found ${observed.furniture.length} furniture pieces, ${observed.openings.length} ${observed.openings.length === 1 ? "opening" : "openings"} and ${issues.length} Feng Shui ${issues.length === 1 ? "opportunity" : "opportunities"}.`,
      );
      setProject({
        roomId: crypto.randomUUID(),
        userId: null,
        createdAt: new Date().toISOString(),
        preferences,
        originalImage: result.image,
        optimizedImage: null,
        roomType: result.analysis.roomType,
        analysis: result.analysis,
        analysisMeta: result.meta,
        generationMeta: null,
      });

      if (config.mode === "analysis_only") {
        setStage("render", "skipped");
        setRenderState({
          status: "unavailable",
          message: "AI image generation is not configured on this server, so we're showing the analysis only.",
        });
      } else {
        await render(result, controller.signal);
      }
      setPhase("results");
    } catch (err) {
      if (err instanceof ApiError && err.code === "CANCELLED") return;
      setError(toPublicError(err));
    }
  }, [photo, details, config.mode, render]);

  const cancel = () => {
    abortRef.current?.abort();
    setPhase("details");
  };

  const startOver = () => {
    abortRef.current?.abort();
    setPhoto(null);
    setAnalysisResult(null);
    setGeneration(null);
    setProject(null);
    setError(null);
    setDetails((d) => ({ ...d, roomType: null }));
    setPhase("upload");
  };

  const retryRender = async () => {
    if (!analysisResult) return;
    const controller = new AbortController();
    abortRef.current = controller;
    await render(analysisResult, controller.signal).catch(() => {});
  };

  const replacePhoto = async (file: File) => {
    const result = await validateImageFile(file, config.maxUploadBytes);
    if (!result.ok) {
      toast.error(result.message);
      return;
    }
    setPhoto({ file, previewUrl: URL.createObjectURL(file), width: result.width, height: result.height, isSample: false });
  };

  const stepIndex = phase === "upload" ? 0 : phase === "details" ? 1 : phase === "processing" ? 2 : 3;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 sm:pt-10">
      <div className="mb-8 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-center sm:justify-between">
        <Stepper current={stepIndex} />
        {config.mode !== "live" && phase !== "results" && (
          <span className="hidden text-xs text-subtle-foreground sm:inline">{config.mode === "demo" ? "Demo Mode" : "Analysis-only mode"}</span>
        )}
      </div>

      {config.mode !== "live" && phase !== "results" && (
        <div className="mb-10">
          <ModeNotice mode={config.mode} uploadedOwnPhoto={photo !== null && !photo.isSample} />
        </div>
      )}

      {phase === "upload" && (
        <UploadStep
          maxBytes={config.maxUploadBytes}
          onSelected={(selected) => {
            setPhoto(selected);
            if (selected.isSample) setDetails((d) => ({ ...d, roomType: d.roomType ?? "bedroom" }));
            setPhase("details");
          }}
        />
      )}

      {phase === "details" && photo && (
        <DetailsStep
          photo={photo}
          value={details}
          onChange={setDetails}
          onRemovePhoto={startOver}
          onReplacePhoto={replacePhoto}
          onSubmit={run}
        />
      )}

      {phase === "processing" && photo && (
        <ProcessingStep
          previewUrl={photo.previewUrl}
          aspect={photo.width / photo.height}
          stages={stages}
          summary={summary}
          error={error}
          onCancel={cancel}
          onRetry={run}
          onStartOver={startOver}
        />
      )}

      {phase === "results" && analysisResult && project && (
        <ResultsView
          context="app"
          original={analysisResult.image}
          optimized={generation?.optimizedImage ?? null}
          analysis={analysisResult.analysis}
          fengShuiMode={details.fengShuiMode}
          analysisMeta={analysisResult.meta}
          generationMeta={generation?.meta ?? null}
          renderState={renderState}
          onRetryRender={retryRender}
          onStartOver={startOver}
          notice={
            analysisResult.meta.isSample || config.mode !== "live" ? (
              <ModeNotice mode={config.mode} uploadedOwnPhoto={photo !== null && !photo.isSample} />
            ) : null
          }
        />
      )}
    </div>
  );
}
