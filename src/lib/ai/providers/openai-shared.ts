import "server-only";
import OpenAI from "openai";
import { ContentFilterFinishReasonError, LengthFinishReasonError } from "openai/error";
import { AppError, type ErrorCode } from "@/lib/errors";

/** Maps OpenAI SDK errors to user-safe AppErrors. Raw messages go to logs only. */
export function mapOpenAIError(err: unknown, fallback: ErrorCode = "PROVIDER_UNAVAILABLE"): AppError {
  if (err instanceof AppError) return err;
  const detail = err instanceof OpenAI.APIError ? `openai ${err.status ?? ""} ${err.code ?? ""} ${err.requestID ?? ""}` : undefined;

  if (err instanceof OpenAI.APIUserAbortError || err instanceof OpenAI.APIConnectionTimeoutError) {
    return new AppError("TIMEOUT", { cause: err, detail });
  }
  if (err instanceof OpenAI.AuthenticationError || err instanceof OpenAI.PermissionDeniedError) {
    return new AppError("PROVIDER_AUTH", { cause: err, detail });
  }
  if (err instanceof OpenAI.RateLimitError) return new AppError("RATE_LIMITED", { cause: err, detail });
  if (err instanceof ContentFilterFinishReasonError) {
    return new AppError("MODERATION_BLOCKED", { cause: err });
  }
  if (err instanceof LengthFinishReasonError) {
    return new AppError("INVALID_AI_RESPONSE", { cause: err, detail: "length finish reason" });
  }
  if (err instanceof OpenAI.BadRequestError) {
    const code = `${err.code ?? ""}`;
    if (/moderation|content_policy|safety/i.test(code)) return new AppError("MODERATION_BLOCKED", { cause: err, detail });
    if (/image/i.test(code)) return new AppError("UNSUPPORTED_IMAGE", { cause: err, detail });
    return new AppError(fallback, { cause: err, detail });
  }
  if (err instanceof OpenAI.APIError) return new AppError(fallback, { cause: err, detail });
  if (err instanceof Error && (err.name === "AbortError" || err.name === "TimeoutError")) {
    return new AppError("TIMEOUT", { cause: err });
  }
  return new AppError("INTERNAL", { cause: err });
}
