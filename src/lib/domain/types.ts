/**
 * Shared data shapes for the client, the API routes, and (later) persistence.
 *
 * `RoomProject` is the record the app works with today in client memory. Its
 * fields are the ones a database table would hold, so adding accounts, saved
 * rooms, history, variations or share pages means persisting this shape rather
 * than reworking the flow. Images are data URLs for now; swap to storage URLs
 * when a blob store is added.
 */

import type { RoomAnalysis } from "@/lib/ai/schema";
import type { AnalysisPreferences } from "@/lib/ai/schema";
import type { PublicError } from "@/lib/errors";

/**
 * live           — real analysis + real image edit
 * analysis_only  — real analysis, image generation not configured
 * demo           — nothing configured (or DEMO_MODE=true): sample room + mocked analysis
 */
export type AppMode = "live" | "analysis_only" | "demo";

export interface PublicConfig {
  mode: AppMode;
  analysisProvider: "anthropic" | "openai" | "demo";
  imageProvider: "openai" | "demo" | "none";
  maxUploadBytes: number;
}

export interface StoredImage {
  /** data: URL today; https URL once a blob store exists. */
  src: string;
  width: number;
  height: number;
  mimeType: string;
}

export interface AnalysisMeta {
  provider: string;
  model: string;
  mode: AppMode;
  durationMs: number;
  analyzedAt: string;
  /** Present in demo mode: the analysis describes the bundled sample room, not the upload. */
  isSample: boolean;
}

export interface GenerationMeta {
  provider: string;
  model: string;
  mode: AppMode;
  durationMs: number;
  generatedAt: string;
  /** The exact edit prompt sent to the image model, for transparency. */
  prompt: string;
  variant: number;
  isSample: boolean;
}

export interface AnalyzeRoomResult {
  analysis: RoomAnalysis;
  /** Signed binding between this analysis and the uploaded photo. */
  analysisToken: string;
  meta: AnalysisMeta;
  /** The server-normalized photo actually analyzed (EXIF-stripped, resized). */
  image: StoredImage;
}

export interface OptimizeRoomResult {
  optimizedImage: StoredImage;
  meta: GenerationMeta;
}

export type AnalysisStage = "upload" | "layout" | "furniture" | "pathways" | "balance" | "opportunities" | "design";

/** NDJSON events streamed by POST /api/analyze-room when the client asks for a stream. */
export type AnalyzeStreamEvent =
  | { type: "stage"; stage: AnalysisStage; status: "active" | "done" }
  | { type: "result"; result: AnalyzeRoomResult }
  | { type: "error"; error: PublicError };

export interface RoomProject {
  roomId: string;
  /** Null until accounts exist. */
  userId: string | null;
  createdAt: string;
  preferences: AnalysisPreferences;
  originalImage: StoredImage;
  optimizedImage: StoredImage | null;
  roomType: RoomAnalysis["roomType"] | null;
  analysis: RoomAnalysis | null;
  analysisMeta: AnalysisMeta | null;
  generationMeta: GenerationMeta | null;
}
