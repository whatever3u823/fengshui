import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { AppError } from "@/lib/errors";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPrompt } from "@/lib/ai/prompts";
import { RoomAnalysisModelSchema, type RoomAnalysis } from "@/lib/ai/schema";
import { finalizeAnalysis, type AnalyzeRoomInput, type RoomAnalyzer } from "@/lib/ai/room-analyzer";

/** Models that accept `output_config.effort` and server-side `fallbacks: "default"`. */
const SUPPORTS_EFFORT = /^claude-(opus-(4-[5-9]|5)|sonnet-(4-6|5)|fable)/;
const SUPPORTS_DEFAULT_FALLBACKS = /^claude-(opus-5|fable-5-1|sonnet-5-5)/;

// The SDK helper converts the Zod schema into the JSON Schema subset the API accepts.
// Its auto-parse hook is dropped so validation happens in finalizeAnalysis, which maps
// malformed output to INVALID_AI_RESPONSE rather than a generic SDK error.
const { type: formatType, schema: formatSchema } = betaZodOutputFormat(RoomAnalysisModelSchema);
const OUTPUT_FORMAT = { type: formatType, schema: formatSchema };

export class AnthropicRoomAnalyzer implements RoomAnalyzer {
  readonly provider = "anthropic";
  readonly isSample = false;
  private readonly client: Anthropic;

  constructor(
    apiKey: string,
    readonly model: string,
    timeoutMs: number,
  ) {
    this.client = new Anthropic({ apiKey, timeout: timeoutMs, maxRetries: 1 });
  }

  async analyze({ image, preferences, signal, onPartialText }: AnalyzeRoomInput): Promise<RoomAnalysis> {
    let streamed = "";
    try {
      const fallbackOptions = SUPPORTS_DEFAULT_FALLBACKS.test(this.model)
        ? // A refused request is retried server-side on Anthropic's recommended fallback model.
          { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const }
        : {};
      const stream = this.client.beta.messages.stream(
        {
          model: this.model,
          max_tokens: 16000,
          ...fallbackOptions,
          output_config: {
            ...(SUPPORTS_EFFORT.test(this.model) ? { effort: "medium" as const } : {}),
            format: OUTPUT_FORMAT,
          },
          system: ANALYSIS_SYSTEM_PROMPT,
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "image",
                  source: { type: "base64", media_type: "image/jpeg", data: image.buffer.toString("base64") },
                },
                { type: "text", text: buildAnalysisUserPrompt(preferences) },
              ],
            },
          ],
        },
        { signal },
      );
      stream.on("text", (delta) => {
        streamed += delta;
        onPartialText?.(streamed);
      });

      const message = await stream.finalMessage();
      if (message.stop_reason === "refusal") {
        throw new AppError("MODERATION_BLOCKED", { detail: `refusal: ${message.stop_details?.category ?? "unknown"}` });
      }
      if (message.stop_reason === "max_tokens") {
        throw new AppError("INVALID_AI_RESPONSE", { detail: "analysis hit max_tokens" });
      }
      // If a fallback model took over, its answer is the last text block.
      const textBlocks = message.content.filter((b) => b.type === "text");
      const finalText = textBlocks.at(-1)?.text ?? "";
      return finalizeAnalysis(finalText);
    } catch (err) {
      throw mapAnthropicError(err);
    }
  }
}

function mapAnthropicError(err: unknown): AppError {
  if (err instanceof AppError) return err;
  const detail = err instanceof Anthropic.APIError ? `anthropic ${err.status ?? ""} ${err.requestID ?? ""}` : undefined;
  if (err instanceof Anthropic.APIUserAbortError || err instanceof Anthropic.APIConnectionTimeoutError) {
    return new AppError("TIMEOUT", { cause: err, detail });
  }
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return new AppError("PROVIDER_AUTH", { cause: err, detail });
  }
  if (err instanceof Anthropic.RateLimitError) return new AppError("RATE_LIMITED", { cause: err, detail });
  if (err instanceof Anthropic.BadRequestError) {
    // Most 400s here are image problems the pre-validation could not catch.
    return new AppError("UNSUPPORTED_IMAGE", { cause: err, detail });
  }
  if (err instanceof Anthropic.InternalServerError || err instanceof Anthropic.APIConnectionError) {
    return new AppError("PROVIDER_UNAVAILABLE", { cause: err, detail });
  }
  if (err instanceof Anthropic.APIError) return new AppError("PROVIDER_UNAVAILABLE", { cause: err, detail });
  if (err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError")) {
    return new AppError("TIMEOUT", { cause: err });
  }
  return new AppError("INTERNAL", { cause: err });
}
