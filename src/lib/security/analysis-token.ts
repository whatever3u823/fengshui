import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import type { RoomAnalysis } from "@/lib/ai/schema";
import { sha256 } from "@/lib/image/process";
import { AppError } from "@/lib/errors";

/**
 * The server stays stateless between /api/analyze-room and /api/optimize-room:
 * the client holds the photo and the analysis. To stop a client from editing
 * the analysis (and with it, the image prompt) or pairing it with a different
 * photo, the analyze step returns an HMAC over both, which optimize verifies.
 */

const TOKEN_VERSION = "v1";
const TOKEN_TTL_MS = 2 * 60 * 60 * 1000;

const globalForSecret = globalThis as unknown as { __fengShuiTokenSecret?: string };

function getSecret(configured: string | null): string {
  if (configured) return configured;
  if (process.env.NODE_ENV === "production") {
    console.warn(
      "[feng-shui-ai] ANALYSIS_TOKEN_SECRET is not set; using a per-process secret. " +
        "Set it when running more than one server instance.",
    );
  }
  globalForSecret.__fengShuiTokenSecret ??= randomBytes(32).toString("hex");
  return globalForSecret.__fengShuiTokenSecret;
}

/** Stable serialization: the bounded schema always emits keys in schema order. */
function analysisDigest(analysis: RoomAnalysis): string {
  return sha256(Buffer.from(JSON.stringify(analysis)));
}

function sign(secret: string, payload: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

export function createAnalysisToken(
  params: { imageSha256: string; analysis: RoomAnalysis; now?: number },
  configuredSecret: string | null,
): string {
  const issuedAt = params.now ?? Date.now();
  const payload = `${TOKEN_VERSION}.${issuedAt}.${params.imageSha256}.${analysisDigest(params.analysis)}`;
  return `${TOKEN_VERSION}.${issuedAt}.${sign(getSecret(configuredSecret), payload)}`;
}

export function verifyAnalysisToken(
  token: string,
  params: { imageSha256: string; analysis: RoomAnalysis; now?: number },
  configuredSecret: string | null,
): void {
  const [version, issuedAtRaw, signature] = token.split(".");
  const issuedAt = Number(issuedAtRaw);
  const now = params.now ?? Date.now();
  if (version !== TOKEN_VERSION || !signature || !Number.isFinite(issuedAt)) {
    throw new AppError("ANALYSIS_EXPIRED", { detail: "malformed token" });
  }
  if (now - issuedAt > TOKEN_TTL_MS || issuedAt - now > 60_000) {
    throw new AppError("ANALYSIS_EXPIRED", { detail: "token expired" });
  }
  const payload = `${TOKEN_VERSION}.${issuedAt}.${params.imageSha256}.${analysisDigest(params.analysis)}`;
  const expected = Buffer.from(sign(getSecret(configuredSecret), payload));
  const actual = Buffer.from(signature);
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) {
    throw new AppError("ANALYSIS_EXPIRED", { detail: "signature mismatch" });
  }
}
