import "server-only";
import OpenAI, { toFile } from "openai";
import { AppError } from "@/lib/errors";
import {
  conformToOriginal,
  fitIntoCanvas,
  type EditRoomImageInput,
  type EditedImage,
  type ImageEditor,
} from "@/lib/ai/image-editor";
import { mapOpenAIError } from "@/lib/ai/providers/openai-shared";

/** gpt-image-2 and later accept arbitrary WIDTHxHEIGHT (multiples of 16); earlier models take fixed sizes. */
const FLEXIBLE_SIZE_MODELS = /^gpt-image-(2|[3-9])/;
/** Earlier GPT image models support `input_fidelity: "high"`, which helps preserve the original photo. */
const INPUT_FIDELITY_MODELS = /^gpt-image-1/;

export class OpenAIImageEditor implements ImageEditor {
  readonly provider = "openai";
  readonly isSample = false;
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    readonly model: string,
    private readonly quality: "low" | "medium" | "high",
    timeoutMs: number,
  ) {
    this.client = new OpenAI({ apiKey, timeout: timeoutMs, maxRetries: 1 });
  }

  private canvasFor(width: number, height: number): { width: number; height: number } {
    if (FLEXIBLE_SIZE_MODELS.test(this.model)) {
      // Match the photo's aspect ratio exactly, long edge 1536.
      const scale = 1536 / Math.max(width, height);
      const round16 = (n: number) => Math.max(256, Math.round((n * scale) / 16) * 16);
      return { width: round16(width), height: round16(height) };
    }
    const ratio = width / height;
    if (ratio > 1.2) return { width: 1536, height: 1024 };
    if (ratio < 1 / 1.2) return { width: 1024, height: 1536 };
    return { width: 1024, height: 1024 };
  }

  async edit({ image, prompt, signal }: EditRoomImageInput): Promise<EditedImage> {
    const canvas = this.canvasFor(image.width, image.height);
    const { buffer, rect } = await fitIntoCanvas(image, canvas);
    const padded = rect.width !== canvas.width || rect.height !== canvas.height;
    const fullPrompt = padded
      ? `${prompt}\n\nThe photo is centered on a blurred border that is not part of the room; keep that border blurred and unchanged.`
      : prompt;

    try {
      const response = await this.client.images.edit(
        {
          model: this.model,
          image: await toFile(buffer, "room.jpg", { type: "image/jpeg" }),
          prompt: fullPrompt,
          size: `${canvas.width}x${canvas.height}`,
          quality: this.quality,
          output_format: "jpeg",
          n: 1,
          ...(INPUT_FIDELITY_MODELS.test(this.model) ? { input_fidelity: "high" as const } : {}),
        },
        { signal },
      );
      const b64 = response.data?.[0]?.b64_json;
      if (!b64) throw new AppError("GENERATION_FAILED", { detail: "openai returned no image data" });
      return await conformToOriginal(Buffer.from(b64, "base64"), canvas, rect, image);
    } catch (err) {
      throw mapOpenAIError(err, "GENERATION_FAILED");
    }
  }
}
