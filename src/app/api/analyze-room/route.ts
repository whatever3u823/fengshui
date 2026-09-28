import { getServerConfig } from "@/lib/config";
import { AppError, toAppError } from "@/lib/errors";
import { assertContentLength, errorResponse, logError, readFormData, requestSignal } from "@/lib/api/http";
import { clientKey, enforceRateLimit } from "@/lib/security/rate-limit";
import { normalizeRoomPhoto, readImageField, toDataUrl } from "@/lib/image/process";
import { AnalysisPreferencesSchema, type AnalysisPreferences } from "@/lib/ai/schema";
import { getRoomAnalyzer } from "@/lib/ai/room-analyzer";
import { createStageTracker } from "@/lib/ai/progress";
import { createAnalysisToken } from "@/lib/security/analysis-token";
import type { AnalysisStage, AnalyzeRoomResult, AnalyzeStreamEvent } from "@/lib/domain/types";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * POST /api/analyze-room — Stage 1.
 *
 * multipart/form-data: image (file), roomType, priorities (repeated), fengShuiMode
 *
 * Responds with JSON `AnalyzeRoomResult`, or — when the client sends
 * `Accept: application/x-ndjson` — a stream of `AnalyzeStreamEvent` lines whose
 * stage events reflect the model's actual progress through the analysis.
 */
export async function POST(request: Request) {
  const config = getServerConfig();

  let prepared: Awaited<ReturnType<typeof prepare>>;
  try {
    enforceRateLimit("analyze", clientKey(request), config.rateLimit);
    prepared = await prepare(request, config.maxUploadBytes);
  } catch (err) {
    return errorResponse(err, "analyze-room");
  }

  const run = async (emit: (stage: AnalysisStage, status: "active" | "done") => void): Promise<AnalyzeRoomResult> => {
    const started = Date.now();
    const analyzer = await getRoomAnalyzer(config);
    const image = analyzer.isSample
      ? await (await import("@/lib/ai/providers/demo")).loadSampleBeforeImage()
      : prepared.image;

    emit("upload", "done");
    emit("layout", "active");
    const analysis = await analyzer.analyze({
      image,
      preferences: prepared.preferences,
      signal: requestSignal(request, config.analysisTimeoutMs),
      onPartialText: createStageTracker(emit),
    });
    emit("design", "done");

    return {
      analysis,
      analysisToken: createAnalysisToken({ imageSha256: image.sha256, analysis }, config.analysisTokenSecret),
      meta: {
        provider: analyzer.provider,
        model: analyzer.model,
        mode: config.mode,
        durationMs: Date.now() - started,
        analyzedAt: new Date().toISOString(),
        isSample: analyzer.isSample,
      },
      image: { src: toDataUrl(image.buffer, image.mimeType), width: image.width, height: image.height, mimeType: image.mimeType },
    };
  };

  const wantsStream = request.headers.get("accept")?.includes("application/x-ndjson");
  if (!wantsStream) {
    try {
      return Response.json(await run(() => {}));
    } catch (err) {
      return errorResponse(err, "analyze-room");
    }
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: AnalyzeStreamEvent) => {
        try {
          controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
        } catch {
          // Client disconnected; the request signal aborts the provider call.
        }
      };
      try {
        const result = await run((stage, status) => send({ type: "stage", stage, status }));
        send({ type: "result", result });
      } catch (err) {
        const appError = toAppError(err);
        logError("analyze-room", appError);
        send({ type: "error", error: appError.toJSON() });
      } finally {
        try {
          controller.close();
        } catch {}
      }
    },
  });
  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}

async function prepare(request: Request, maxUploadBytes: number) {
  assertContentLength(request, maxUploadBytes);
  const form = await readFormData(request);
  const preferences = parsePreferences(form);
  const { bytes } = await readImageField(form.get("image"), maxUploadBytes);
  const image = await normalizeRoomPhoto(bytes);
  return { preferences, image };
}

function parsePreferences(form: FormData): AnalysisPreferences {
  const priorities = [...new Set(form.getAll("priorities").filter((v): v is string => typeof v === "string"))];
  const parsed = AnalysisPreferencesSchema.safeParse({
    roomType: form.get("roomType") ?? "auto",
    priorities,
    fengShuiMode: form.get("fengShuiMode") ?? "traditional",
  });
  if (!parsed.success) throw new AppError("INVALID_REQUEST", { detail: parsed.error.message });
  return parsed.data;
}
