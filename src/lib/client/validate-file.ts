import { ACCEPTED_IMAGE_EXTENSIONS, ACCEPTED_IMAGE_TYPES } from "@/lib/domain/options";
import { formatBytes } from "@/lib/utils";

/**
 * Fast client-side checks for good UX. The server repeats all of them (and
 * more) without trusting anything the browser reports.
 */
export async function validateImageFile(
  file: File,
  maxBytes: number,
): Promise<{ ok: true; width: number; height: number } | { ok: false; message: string }> {
  const name = file.name.toLowerCase();
  const typeOk = (ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type);
  const extOk = ACCEPTED_IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext));
  if (!typeOk && !(file.type === "" && extOk)) {
    if (/hei[cf]$/.test(name) || /heic|heif/.test(file.type)) {
      return { ok: false, message: "HEIC photos aren't supported yet. Please export the photo as JPG or PNG." };
    }
    return { ok: false, message: "Please upload a JPG, PNG, or WEBP image." };
  }
  if (file.size === 0) return { ok: false, message: "That file is empty. Please choose another photo." };
  if (file.size > maxBytes) {
    return { ok: false, message: `That photo is ${formatBytes(file.size)}. The limit is ${formatBytes(maxBytes)}.` };
  }
  try {
    const bitmap = await createImageBitmap(file);
    const { width, height } = bitmap;
    bitmap.close();
    if (Math.min(width, height) < 256) {
      return { ok: false, message: `That photo is quite small (${width}×${height}). Please use one at least 256px on each side.` };
    }
    return { ok: true, width, height };
  } catch {
    return { ok: false, message: "We couldn't read that image. It may be damaged — please try another photo." };
  }
}
