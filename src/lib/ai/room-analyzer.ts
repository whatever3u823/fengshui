import "server-only";
import { getServerConfig, type ServerConfig } from "@/lib/config";
import { AppError } from "@/lib/errors";
import type { NormalizedImage } from "@/lib/image/process";
import { RoomAnalysisSchema, type AnalysisPreferences, type RoomAnalysis } from "@/lib/ai/schema";

/**
 * Stage 1 of the pipeline: photograph → structured spatial analysis.
 *
 * Route handlers depend only on this interface. Each provider lives in
 * ./providers and is selected by configuration, so adding or swapping a
 * vision model touches one file plus the factory below.
 */

export interface AnalyzeRoomInput {
  image: NormalizedImage;
  preferences: AnalysisPreferences;
  signal: AbortSignal;
  /** Called with the accumulated raw JSON text as the model streams it. */
  onPartialText?: (textSoFar: string) => void;
}

export interface RoomAnalyzer {
  readonly provider: string;
  readonly model: string;
  /** True when results describe the bundled sample room rather than the upload. */
  readonly isSample: boolean;
  analyze(input: AnalyzeRoomInput): Promise<RoomAnalysis>;
}

export async function getRoomAnalyzer(config: ServerConfig = getServerConfig()): Promise<RoomAnalyzer> {
  switch (config.analysis.provider) {
    case "anthropic": {
      const { AnthropicRoomAnalyzer } = await import("@/lib/ai/providers/anthropic-analyzer");
      return new AnthropicRoomAnalyzer(config.analysis.apiKey!, config.analysis.model, config.analysisTimeoutMs);
    }
    case "openai": {
      const { OpenAIRoomAnalyzer } = await import("@/lib/ai/providers/openai-analyzer");
      return new OpenAIRoomAnalyzer(config.analysis.apiKey!, config.analysis.model, config.analysisTimeoutMs);
    }
    case "demo": {
      const { DemoRoomAnalyzer } = await import("@/lib/ai/providers/demo");
      return new DemoRoomAnalyzer();
    }
  }
}

/**
 * Shared post-processing for every provider: parse, validate against the
 * bounded schema, and reject non-room photos. Providers must not return
 * unvalidated model output.
 */
export function finalizeAnalysis(rawText: string): RoomAnalysis {
  let json: unknown;
  try {
    json = JSON.parse(rawText);
  } catch (cause) {
    throw new AppError("INVALID_AI_RESPONSE", { cause, detail: "analysis was not valid JSON" });
  }
  const parsed = RoomAnalysisSchema.safeParse(json);
  if (!parsed.success) {
    throw new AppError("INVALID_AI_RESPONSE", {
      detail: `analysis failed schema validation: ${parsed.error.issues
        .slice(0, 5)
        .map((i) => `${i.path.join(".")}: ${i.message}`)
        .join("; ")}`,
    });
  }
  if (!parsed.data.isInteriorRoom) throw new AppError("NOT_A_ROOM");
  return parsed.data;
}
