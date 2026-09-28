import "server-only";
import { DEFAULT_MAX_UPLOAD_BYTES } from "@/lib/domain/options";
import type { AppMode, PublicConfig } from "@/lib/domain/types";

/**
 * Server configuration, resolved from environment variables.
 * This module is server-only: importing it from a client component fails the build,
 * which keeps API keys out of browser bundles.
 */

export type AnalysisProviderId = "anthropic" | "openai" | "demo";
export type ImageProviderId = "openai" | "demo" | "none";


export interface ServerConfig {
  mode: AppMode;
  analysis: { provider: AnalysisProviderId; model: string; apiKey: string | null };
  image: { provider: ImageProviderId; model: string; quality: "low" | "medium" | "high"; apiKey: string | null };
  maxUploadBytes: number;
  analysisTimeoutMs: number;
  imageTimeoutMs: number;
  rateLimit: { maxRequests: number; windowMs: number };
  /** Null means "generate a per-process secret" (fine for a single dev server). */
  analysisTokenSecret: string | null;
}


function env(name: string): string | null {
  const value = process.env[name]?.trim();
  return value ? value : null;
}

function intEnv(name: string, fallback: number): number {
  const raw = env(name);
  const parsed = raw ? Number.parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export function getServerConfig(): ServerConfig {
  const anthropicKey = env("ANTHROPIC_API_KEY");
  const openaiKey = env("OPENAI_API_KEY");
  const forceDemo = env("DEMO_MODE")?.toLowerCase() === "true";

  // Analysis provider: explicit choice wins, otherwise use whichever key exists.
  const requestedAnalysis = env("ANALYSIS_PROVIDER")?.toLowerCase();
  let analysisProvider: AnalysisProviderId = "demo";
  if (!forceDemo) {
    if (requestedAnalysis === "openai" && openaiKey) analysisProvider = "openai";
    else if (requestedAnalysis === "anthropic" && anthropicKey) analysisProvider = "anthropic";
    else if (!requestedAnalysis && anthropicKey) analysisProvider = "anthropic";
    else if (!requestedAnalysis && openaiKey) analysisProvider = "openai";
  }

  let imageProvider: ImageProviderId = "none";
  if (forceDemo || analysisProvider === "demo") imageProvider = "demo";
  else if (openaiKey) imageProvider = "openai";

  const mode: AppMode =
    analysisProvider === "demo" ? "demo" : imageProvider === "none" ? "analysis_only" : "live";

  const quality = env("OPENAI_IMAGE_QUALITY");

  return {
    mode,
    analysis: {
      provider: analysisProvider,
      model:
        analysisProvider === "openai"
          ? (env("OPENAI_ANALYSIS_MODEL") ?? "gpt-5.5")
          : analysisProvider === "anthropic"
            ? (env("ANTHROPIC_MODEL") ?? "claude-opus-5-5")
            : "demo",
      apiKey: analysisProvider === "openai" ? openaiKey : analysisProvider === "anthropic" ? anthropicKey : null,
    },
    image: {
      provider: imageProvider,
      model: imageProvider === "openai" ? (env("OPENAI_IMAGE_MODEL") ?? "gpt-image-2") : imageProvider,
      quality: quality === "low" || quality === "medium" || quality === "high" ? quality : "high",
      apiKey: imageProvider === "openai" ? openaiKey : null,
    },
    maxUploadBytes: intEnv("MAX_UPLOAD_MB", DEFAULT_MAX_UPLOAD_BYTES / (1024 * 1024)) * 1024 * 1024,
    analysisTimeoutMs: intEnv("ANALYSIS_TIMEOUT_SECONDS", 120) * 1000,
    imageTimeoutMs: intEnv("IMAGE_TIMEOUT_SECONDS", 240) * 1000,
    rateLimit: {
      maxRequests: intEnv("RATE_LIMIT_MAX_REQUESTS", 20),
      windowMs: intEnv("RATE_LIMIT_WINDOW_SECONDS", 600) * 1000,
    },
    analysisTokenSecret: env("ANALYSIS_TOKEN_SECRET"),
  };
}

/** Safe subset that may be rendered into client components. */
export function getPublicConfig(): PublicConfig {
  const config = getServerConfig();
  return {
    mode: config.mode,
    analysisProvider: config.analysis.provider,
    imageProvider: config.image.provider,
    maxUploadBytes: config.maxUploadBytes,
  };
}
