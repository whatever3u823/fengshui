import "server-only";
import { createHash } from "node:crypto";
import sharp, { type Metadata } from "sharp";
import { AppError } from "@/lib/errors";

/**
 * Server-side upload validation and normalization.
 *
 * Nothing the browser says about the file (name, extension, MIME type) is
 * trusted: the format is sniffed from magic bytes and then decoded with sharp.
 */

export type SniffedFormat = "jpeg" | "png" | "webp";

export interface NormalizedImage {
  buffer: Buffer;
  mimeType: "image/jpeg";
  width: number;
  height: number;
  sha256: string;
}

const MAX_EDGE = 1536;
const MIN_EDGE = 256;
const MAX_INPUT_PIXELS = 50_000_000;

export function sniffImageFormat(bytes: Uint8Array): SniffedFormat | null {
  if (bytes.length < 12) return null;
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpeg";
  if (
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }
  const ascii = (start: number, end: number) => String.fromCharCode(...bytes.subarray(start, end));
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "webp";
  return null;
}

export function sha256(buffer: Uint8Array): string {
  return createHash("sha256").update(buffer).digest("hex");
}

/** Reads a multipart field as an image, enforcing presence, size and format. */
export async function readImageField(
  value: FormDataEntryValue | null,
  maxBytes: number,
): Promise<{ bytes: Buffer; format: SniffedFormat }> {
  if (!value || typeof value === "string") {
    throw new AppError("INVALID_FILE", { userMessage: "Please choose a photo of your room to upload." });
  }
  if (value.size === 0) throw new AppError("INVALID_FILE", { detail: "empty upload" });
  if (value.size > maxBytes) {
    throw new AppError("FILE_TOO_LARGE", {
      userMessage: `That photo is larger than ${Math.round(maxBytes / (1024 * 1024))} MB. Please upload a smaller image.`,
    });
  }
  const bytes = Buffer.from(await value.arrayBuffer());
  const format = sniffImageFormat(bytes);
  if (!format) {
    throw new AppError("INVALID_FILE", { detail: `unrecognized magic bytes (claimed ${value.type})` });
  }
  return { bytes, format };
}

/**
 * Decodes, auto-orients, downsizes and re-encodes the photo as JPEG.
 * Re-encoding strips EXIF (including GPS location) before anything is sent to a provider.
 */
export async function normalizeRoomPhoto(bytes: Buffer): Promise<NormalizedImage> {
  let metadata: Metadata;
  try {
    metadata = await sharp(bytes, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
  } catch (cause) {
    throw new AppError("UNSUPPORTED_IMAGE", { cause, detail: "sharp could not read metadata" });
  }
  if (!metadata.format || !["jpeg", "png", "webp"].includes(metadata.format)) {
    throw new AppError("UNSUPPORTED_IMAGE", { detail: `decoded format ${metadata.format}` });
  }
  if (metadata.pages && metadata.pages > 1) {
    throw new AppError("UNSUPPORTED_IMAGE", {
      userMessage: "Animated images aren't supported. Please upload a still photo.",
    });
  }
  const width = metadata.autoOrient?.width ?? metadata.width ?? 0;
  const height = metadata.autoOrient?.height ?? metadata.height ?? 0;
  if (Math.min(width, height) < MIN_EDGE) {
    throw new AppError("UNSUPPORTED_IMAGE", {
      userMessage: `That photo is too small (${width}×${height}). Please upload an image at least ${MIN_EDGE}px on each side.`,
    });
  }
  const ratio = width / height;
  if (ratio > 3 || ratio < 1 / 3) {
    throw new AppError("UNSUPPORTED_IMAGE", {
      userMessage: "Panoramas and very narrow crops aren't supported. Please upload a standard photo of the room.",
    });
  }

  try {
    const { data, info } = await sharp(bytes, { limitInputPixels: MAX_INPUT_PIXELS })
      .rotate()
      .resize({ width: MAX_EDGE, height: MAX_EDGE, fit: "inside", withoutEnlargement: true })
      .flatten({ background: "#ffffff" })
      .toColorspace("srgb")
      .jpeg({ quality: 90, mozjpeg: true })
      .toBuffer({ resolveWithObject: true });
    return { buffer: data, mimeType: "image/jpeg", width: info.width, height: info.height, sha256: sha256(data) };
  } catch (cause) {
    throw new AppError("UNSUPPORTED_IMAGE", { cause, detail: "sharp failed to normalize" });
  }
}

/** Inspects an already-normalized image (e.g. one the client sends back for optimization). */
export async function readNormalizedImage(bytes: Buffer): Promise<NormalizedImage> {
  if (sniffImageFormat(bytes) !== "jpeg") throw new AppError("INVALID_FILE", { detail: "expected jpeg" });
  try {
    const meta = await sharp(bytes, { limitInputPixels: MAX_INPUT_PIXELS }).metadata();
    if (!meta.width || !meta.height || Math.max(meta.width, meta.height) > MAX_EDGE) {
      throw new Error("unexpected dimensions");
    }
    return { buffer: bytes, mimeType: "image/jpeg", width: meta.width, height: meta.height, sha256: sha256(bytes) };
  } catch (cause) {
    throw new AppError("UNSUPPORTED_IMAGE", { cause });
  }
}

export function toDataUrl(buffer: Buffer, mimeType: string): string {
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
