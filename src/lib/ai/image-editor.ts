import "server-only";
import sharp from "sharp";
import { getServerConfig, type ServerConfig } from "@/lib/config";
import { AppError } from "@/lib/errors";
import type { NormalizedImage } from "@/lib/image/process";

/**
 * Stage 2 of the pipeline: original photo + analysis-derived prompt → edited photo.
 *
 * Route handlers depend only on this interface; provider SDKs stay in
 * ./providers. To add a provider (e.g. Gemini, Flux Kontext, a self-hosted
 * model), implement ImageEditor and add a case to getImageEditor.
 */

export interface EditRoomImageInput {
  image: NormalizedImage;
  prompt: string;
  signal: AbortSignal;
  /** 1-based variation index; lets "try another arrangement" request alternatives later. */
  variant: number;
}

export interface EditedImage {
  buffer: Buffer;
  mimeType: "image/jpeg";
  width: number;
  height: number;
}

export interface ImageEditor {
  readonly provider: string;
  readonly model: string;
  readonly isSample: boolean;
  edit(input: EditRoomImageInput): Promise<EditedImage>;
}

export async function getImageEditor(config: ServerConfig = getServerConfig()): Promise<ImageEditor> {
  switch (config.image.provider) {
    case "openai": {
      const { OpenAIImageEditor } = await import("@/lib/ai/providers/openai-image-editor");
      return new OpenAIImageEditor(config.image.apiKey!, config.image.model, config.image.quality, config.imageTimeoutMs);
    }
    case "demo": {
      const { DemoImageEditor } = await import("@/lib/ai/providers/demo");
      return new DemoImageEditor();
    }
    case "none":
      throw new AppError("MISSING_API_KEY", {
        userMessage: "AI image generation is not configured on this server, so only the analysis is available.",
      });
  }
}

/**
 * Places the photo on a canvas of the size the provider requires, returning the
 * rectangle it occupies. Unused area is filled with a blurred, stretched copy of
 * the photo so the model sees continuous content rather than hard bars.
 */
export async function fitIntoCanvas(
  image: NormalizedImage,
  canvas: { width: number; height: number },
): Promise<{ buffer: Buffer; rect: { left: number; top: number; width: number; height: number } }> {
  const scale = Math.min(canvas.width / image.width, canvas.height / image.height);
  const width = Math.round(image.width * scale);
  const height = Math.round(image.height * scale);
  const rect = {
    left: Math.floor((canvas.width - width) / 2),
    top: Math.floor((canvas.height - height) / 2),
    width,
    height,
  };
  const foreground = await sharp(image.buffer).resize(width, height, { fit: "fill" }).toBuffer();
  if (width === canvas.width && height === canvas.height) {
    return { buffer: await sharp(foreground).jpeg({ quality: 92 }).toBuffer(), rect };
  }
  const background = await sharp(image.buffer)
    .resize(canvas.width, canvas.height, { fit: "cover" })
    .blur(40)
    .modulate({ brightness: 0.95 })
    .toBuffer();
  const buffer = await sharp(background)
    .composite([{ input: foreground, left: rect.left, top: rect.top }])
    .jpeg({ quality: 92 })
    .toBuffer();
  return { buffer, rect };
}

/**
 * Crops a provider result back to the photo's rectangle and resizes it to the
 * original dimensions, so before/after overlay pixel-for-pixel in the slider.
 */
export async function conformToOriginal(
  output: Buffer,
  canvas: { width: number; height: number },
  rect: { left: number; top: number; width: number; height: number },
  original: { width: number; height: number },
): Promise<EditedImage> {
  const meta = await sharp(output).metadata();
  if (!meta.width || !meta.height) throw new AppError("GENERATION_FAILED", { detail: "unreadable output" });
  const sx = meta.width / canvas.width;
  const sy = meta.height / canvas.height;
  const extract = {
    left: Math.max(0, Math.round(rect.left * sx)),
    top: Math.max(0, Math.round(rect.top * sy)),
    width: Math.min(meta.width, Math.round(rect.width * sx)),
    height: Math.min(meta.height, Math.round(rect.height * sy)),
  };
  const buffer = await sharp(output)
    .extract(extract)
    .resize(original.width, original.height, { fit: "fill" })
    .jpeg({ quality: 90, mozjpeg: true })
    .toBuffer();
  return { buffer, mimeType: "image/jpeg", width: original.width, height: original.height };
}
