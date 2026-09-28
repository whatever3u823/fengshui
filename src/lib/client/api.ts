import type { AnalysisPreferences, RoomAnalysis } from "@/lib/ai/schema";
import type { AnalysisStage, AnalyzeRoomResult, AnalyzeStreamEvent, OptimizeRoomResult, StoredImage } from "@/lib/domain/types";
import type { PublicError, PublicErrorCode } from "@/lib/errors";

/** Client wrapper for the two pipeline endpoints. No secrets live here. */

export class ApiError extends Error implements PublicError {
  constructor(
    readonly code: PublicErrorCode,
    message: string,
    readonly retryable: boolean,
  ) {
    super(message);
    this.name = "ApiError";
  }
  toPublic(): PublicError {
    return { code: this.code, message: this.message, retryable: this.retryable };
  }
}

const CLIENT_TIMEOUT_MS = 5 * 60 * 1000;

function networkError(err: unknown, signal: AbortSignal): ApiError {
  if (signal.aborted) {
    return signal.reason instanceof DOMException && signal.reason.name === "TimeoutError"
      ? new ApiError("TIMEOUT", "This is taking longer than expected. Please try again.", true)
      : new ApiError("CANCELLED", "Cancelled.", true);
  }
  if (err instanceof ApiError) return err;
  return new ApiError("NETWORK", "We couldn't reach the server. Check your connection and try again.", true);
}

async function readError(res: Response): Promise<ApiError> {
  try {
    const body = (await res.json()) as { error?: PublicError };
    if (body.error?.message) return new ApiError(body.error.code, body.error.message, body.error.retryable);
  } catch {}
  if (res.status === 413) return new ApiError("FILE_TOO_LARGE", "That photo is too large. Please upload a smaller image.", false);
  return new ApiError("INTERNAL", "Something went wrong on our side. Please try again.", true);
}

export async function analyzeRoom(params: {
  file: File;
  preferences: AnalysisPreferences;
  signal: AbortSignal;
  onStage?: (stage: AnalysisStage, status: "active" | "done") => void;
}): Promise<AnalyzeRoomResult> {
  const signal = AbortSignal.any([params.signal, AbortSignal.timeout(CLIENT_TIMEOUT_MS)]);
  const form = new FormData();
  form.append("image", params.file);
  form.append("roomType", params.preferences.roomType);
  form.append("fengShuiMode", params.preferences.fengShuiMode);
  for (const p of params.preferences.priorities) form.append("priorities", p);

  let res: Response;
  try {
    res = await fetch("/api/analyze-room", {
      method: "POST",
      body: form,
      headers: { accept: "application/x-ndjson" },
      signal,
    });
  } catch (err) {
    throw networkError(err, signal);
  }
  if (!res.ok || !res.body) throw await readError(res);

  if (!res.headers.get("content-type")?.includes("ndjson")) {
    return (await res.json()) as AnalyzeRoomResult;
  }

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = "";
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (value) buffer += value;
      let newline: number;
      while ((newline = buffer.indexOf("\n")) >= 0) {
        const line = buffer.slice(0, newline).trim();
        buffer = buffer.slice(newline + 1);
        if (!line) continue;
        const event = JSON.parse(line) as AnalyzeStreamEvent;
        if (event.type === "stage") params.onStage?.(event.stage, event.status);
        else if (event.type === "result") return event.result;
        else if (event.type === "error") throw new ApiError(event.error.code, event.error.message, event.error.retryable);
      }
      if (done) break;
    }
  } catch (err) {
    throw networkError(err, signal);
  }
  throw new ApiError("INVALID_AI_RESPONSE", "The analysis ended unexpectedly. Please try again.", true);
}

export async function optimizeRoom(params: {
  image: StoredImage;
  analysis: RoomAnalysis;
  analysisToken: string;
  fengShuiMode: AnalysisPreferences["fengShuiMode"];
  variant?: number;
  signal: AbortSignal;
}): Promise<OptimizeRoomResult> {
  const signal = AbortSignal.any([params.signal, AbortSignal.timeout(CLIENT_TIMEOUT_MS)]);
  try {
    const imageBlob = await (await fetch(params.image.src)).blob();
    const form = new FormData();
    form.append("image", imageBlob, "room.jpg");
    form.append("analysis", JSON.stringify(params.analysis));
    form.append("analysisToken", params.analysisToken);
    form.append("fengShuiMode", params.fengShuiMode);
    form.append("variant", String(params.variant ?? 1));
    const res = await fetch("/api/optimize-room", { method: "POST", body: form, signal });
    if (!res.ok) throw await readError(res);
    return (await res.json()) as OptimizeRoomResult;
  } catch (err) {
    throw networkError(err, signal);
  }
}
