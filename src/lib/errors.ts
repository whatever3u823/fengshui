/**
 * Application error model. Every error that reaches the client is one of these
 * codes with a human-readable message; raw provider errors never leave the server.
 */

export const ERROR_CODES = [
  "INVALID_REQUEST",
  "INVALID_FILE",
  "FILE_TOO_LARGE",
  "UNSUPPORTED_IMAGE",
  "NOT_A_ROOM",
  "MISSING_API_KEY",
  "PROVIDER_AUTH",
  "PROVIDER_UNAVAILABLE",
  "RATE_LIMITED",
  "TIMEOUT",
  "INVALID_AI_RESPONSE",
  "MODERATION_BLOCKED",
  "GENERATION_FAILED",
  "ANALYSIS_EXPIRED",
  "INTERNAL",
] as const;
export type ErrorCode = (typeof ERROR_CODES)[number];

const DEFAULTS: Record<ErrorCode, { status: number; message: string; retryable: boolean }> = {
  INVALID_REQUEST: {
    status: 400,
    message: "Something about that request wasn't right. Please start again.",
    retryable: false,
  },
  INVALID_FILE: {
    status: 400,
    message: "That file doesn't look like a valid image. Please upload a JPG, PNG, or WEBP photo.",
    retryable: false,
  },
  FILE_TOO_LARGE: {
    status: 413,
    message: "That photo is too large. Please upload an image under the size limit.",
    retryable: false,
  },
  UNSUPPORTED_IMAGE: {
    status: 415,
    message: "We couldn't read that image. Please try a standard JPG, PNG, or WEBP photo.",
    retryable: false,
  },
  NOT_A_ROOM: {
    status: 422,
    message:
      "We couldn't find an interior room in this photo. Try a wider shot taken from a corner or doorway.",
    retryable: false,
  },
  MISSING_API_KEY: {
    status: 503,
    message: "AI analysis isn't configured on this server yet. You can still explore the demo.",
    retryable: false,
  },
  PROVIDER_AUTH: {
    status: 503,
    message: "The AI service rejected our credentials. Please let the site owner know.",
    retryable: false,
  },
  PROVIDER_UNAVAILABLE: {
    status: 502,
    message: "The AI service is having trouble right now. Please try again in a minute.",
    retryable: true,
  },
  RATE_LIMITED: {
    status: 429,
    message: "We're receiving a lot of requests. Please wait a moment and try again.",
    retryable: true,
  },
  TIMEOUT: {
    status: 504,
    message: "This is taking longer than expected. Please try again.",
    retryable: true,
  },
  INVALID_AI_RESPONSE: {
    status: 502,
    message: "The analysis came back incomplete. Please try again.",
    retryable: true,
  },
  MODERATION_BLOCKED: {
    status: 422,
    message:
      "This image couldn't be processed under the AI provider's content policy. Please try a different photo of the room.",
    retryable: false,
  },
  GENERATION_FAILED: {
    status: 502,
    message: "We couldn't render the optimized image this time. Your analysis is still available.",
    retryable: true,
  },
  ANALYSIS_EXPIRED: {
    status: 409,
    message: "This analysis session has expired or doesn't match the photo. Please analyze the room again.",
    retryable: false,
  },
  INTERNAL: {
    status: 500,
    message: "Something went wrong on our side. Please try again.",
    retryable: true,
  },
};

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly status: number;
  readonly userMessage: string;
  readonly retryable: boolean;

  constructor(code: ErrorCode, options: { userMessage?: string; cause?: unknown; detail?: string } = {}) {
    const d = DEFAULTS[code];
    // `detail` is for server logs only and is never serialized to the client.
    super(options.detail ?? code, { cause: options.cause });
    this.name = "AppError";
    this.code = code;
    this.status = d.status;
    this.userMessage = options.userMessage ?? d.message;
    this.retryable = d.retryable;
  }

  toJSON(): PublicError {
    return { code: this.code, message: this.userMessage, retryable: this.retryable };
  }
}

/** Client-only codes for failures that never reach the server. */
export type PublicErrorCode = ErrorCode | "NETWORK" | "CANCELLED";

/** The only error shape ever sent to the browser. */
export interface PublicError {
  code: PublicErrorCode;
  message: string;
  retryable: boolean;
}

export function isAppError(err: unknown): err is AppError {
  return err instanceof AppError;
}

/** Last-resort conversion; providers should throw specific AppErrors themselves. */
export function toAppError(err: unknown): AppError {
  if (isAppError(err)) return err;
  if (err instanceof Error && (err.name === "TimeoutError" || err.name === "AbortError")) {
    return new AppError("TIMEOUT", { cause: err });
  }
  return new AppError("INTERNAL", { cause: err });
}
