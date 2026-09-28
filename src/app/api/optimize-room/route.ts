import { z } from "zod";
import { getServerConfig } from "@/lib/config";
import { AppError } from "@/lib/errors";
import { assertContentLength, errorResponse, readFormData, requestSignal } from "@/lib/api/http";
import { clientKey, enforceRateLimit } from "@/lib/security/rate-limit";
import { readImageField, readNormalizedImage, toDataUrl } from "@/lib/image/process";
import { RoomAnalysisSchema } from "@/lib/ai/schema";
import { buildImageEditPrompt } from "@/lib/ai/prompts";
import { getImageEditor } from "@/lib/ai/image-editor";
import { verifyAnalysisToken } from "@/lib/security/analysis-token";
import { FENG_SHUI_MODES } from "@/lib/domain/options";
import type { OptimizeRoomResult } from "@/lib/domain/types";

export const runtime = "nodejs";
export const maxDuration = 300;

const OptionsSchema = z.object({
  fengShuiMode: z.enum(FENG_SHUI_MODES).default("traditional"),
  variant: z.coerce.number().int().min(1).max(4).default(1),
});

/**
 * POST /api/optimize-room — Stage 2.
 *
 * multipart/form-data:
 *   image          the normalized photo returned by /api/analyze-room
 *   analysis       JSON RoomAnalysis returned by /api/analyze-room
 *   analysisToken  signature binding the two
 *   fengShuiMode, variant (optional)
 *
 * The analysis is re-validated and its signature verified, so the image
 * prompt can only ever be built from an analysis this server produced for
 * this exact photo.
 */
export async function POST(request: Request) {
  const config = getServerConfig();
  try {
    enforceRateLimit("optimize", clientKey(request), config.rateLimit);
    assertContentLength(request, config.maxUploadBytes);
    const form = await readFormData(request);

    const { bytes } = await readImageField(form.get("image"), config.maxUploadBytes);
    const image = await readNormalizedImage(bytes);

    const analysisRaw = form.get("analysis");
    const token = form.get("analysisToken");
    if (typeof analysisRaw !== "string" || typeof token !== "string") {
      throw new AppError("INVALID_REQUEST", { detail: "missing analysis or token" });
    }
    let analysisJson: unknown;
    try {
      analysisJson = JSON.parse(analysisRaw);
    } catch (cause) {
      throw new AppError("INVALID_REQUEST", { cause, detail: "analysis is not JSON" });
    }
    const parsed = RoomAnalysisSchema.safeParse(analysisJson);
    if (!parsed.success) throw new AppError("INVALID_REQUEST", { detail: "analysis failed validation" });
    const analysis = parsed.data;
    verifyAnalysisToken(token, { imageSha256: image.sha256, analysis }, config.analysisTokenSecret);

    const options = OptionsSchema.safeParse({
      fengShuiMode: form.get("fengShuiMode") ?? undefined,
      variant: form.get("variant") ?? undefined,
    });
    if (!options.success) throw new AppError("INVALID_REQUEST", { detail: options.error.message });

    const editor = await getImageEditor(config);
    const prompt = buildImageEditPrompt(analysis, options.data);
    const started = Date.now();
    const edited = await editor.edit({
      image,
      prompt,
      variant: options.data.variant,
      signal: requestSignal(request, config.imageTimeoutMs),
    });

    const result: OptimizeRoomResult = {
      optimizedImage: {
        src: toDataUrl(edited.buffer, edited.mimeType),
        width: edited.width,
        height: edited.height,
        mimeType: edited.mimeType,
      },
      meta: {
        provider: editor.provider,
        model: editor.model,
        mode: config.mode,
        durationMs: Date.now() - started,
        generatedAt: new Date().toISOString(),
        prompt,
        variant: options.data.variant,
        isSample: editor.isSample,
      },
    };
    return Response.json(result, { headers: { "cache-control": "no-store" } });
  } catch (err) {
    return errorResponse(err, "optimize-room");
  }
}
