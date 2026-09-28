import "server-only";
import { AppError, toAppError } from "@/lib/errors";

/** Logs the full error server-side and returns only the public shape. */
export function errorResponse(err: unknown, scope: string): Response {
  const appError = toAppError(err);
  logError(scope, appError);
  return Response.json({ error: appError.toJSON() }, { status: appError.status });
}

export function logError(scope: string, error: AppError): void {
  const cause = error.cause instanceof Error ? `${error.cause.name}: ${error.cause.message}` : undefined;
  // Provider SDK messages never include API keys; they may include request IDs, which are useful here.
  const line = `[${scope}] ${error.code} (${error.status}) ${error.message}${cause ? ` | cause: ${cause}` : ""}`;
  if (error.status >= 500) console.error(line);
  else console.warn(line);
}

/** Rejects obviously oversized bodies before buffering them. */
export function assertContentLength(request: Request, maxBytes: number): void {
  const length = Number(request.headers.get("content-length") ?? "0");
  // Allow headroom for multipart boundaries and the other form fields.
  if (Number.isFinite(length) && length > maxBytes + 512 * 1024) {
    throw new AppError("FILE_TOO_LARGE", {
      userMessage: `That photo is larger than ${Math.round(maxBytes / (1024 * 1024))} MB. Please upload a smaller image.`,
    });
  }
}

export async function readFormData(request: Request): Promise<FormData> {
  const type = request.headers.get("content-type") ?? "";
  if (!type.includes("multipart/form-data")) {
    throw new AppError("INVALID_REQUEST", { detail: `unexpected content-type ${type}` });
  }
  try {
    return await request.formData();
  } catch (cause) {
    throw new AppError("INVALID_REQUEST", { cause, detail: "could not parse multipart body" });
  }
}

/** Combines the client's disconnect signal with a hard timeout. */
export function requestSignal(request: Request, timeoutMs: number): AbortSignal {
  return AbortSignal.any([request.signal, AbortSignal.timeout(timeoutMs)]);
}
