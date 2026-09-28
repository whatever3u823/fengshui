import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { SAMPLE_BEDROOM_ANALYSIS } from "@/lib/ai/demo-fixture";
import { finalizeAnalysis, type AnalyzeRoomInput, type RoomAnalyzer } from "@/lib/ai/room-analyzer";
import type { EditRoomImageInput, EditedImage, ImageEditor } from "@/lib/ai/image-editor";
import { readNormalizedImage, type NormalizedImage } from "@/lib/image/process";
import type { RoomAnalysis } from "@/lib/ai/schema";

/**
 * Demo Mode providers. They make no network calls and always describe the
 * bundled sample room. Every response is flagged `isSample` so the UI can say so.
 */

function sampleFile(name: "bedroom-before.jpg" | "bedroom-after.jpg"): string {
  return path.join(process.cwd(), "public", "samples", name);
}

export async function loadSampleBeforeImage(): Promise<NormalizedImage> {
  return readNormalizedImage(await readFile(sampleFile("bedroom-before.jpg")));
}

function wait(ms: number, signal: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal.aborted) return reject(signal.reason);
    const timer = setTimeout(resolve, ms);
    signal.addEventListener("abort", () => (clearTimeout(timer), reject(signal.reason)), { once: true });
  });
}

export class DemoRoomAnalyzer implements RoomAnalyzer {
  readonly provider = "demo";
  readonly model = "sample-analysis";
  readonly isSample = true;

  async analyze({ signal, onPartialText }: AnalyzeRoomInput): Promise<RoomAnalysis> {
    // Replays the fixture through the same streaming/progress path a real model uses.
    const text = JSON.stringify(SAMPLE_BEDROOM_ANALYSIS);
    const chunks = 24;
    for (let i = 1; i <= chunks; i++) {
      await wait(140, signal);
      onPartialText?.(text.slice(0, Math.round((text.length * i) / chunks)));
    }
    return finalizeAnalysis(text);
  }
}

export class DemoImageEditor implements ImageEditor {
  readonly provider = "demo";
  readonly model = "sample-render";
  readonly isSample = true;

  async edit({ signal }: EditRoomImageInput): Promise<EditedImage> {
    await wait(1800, signal);
    const image = await readNormalizedImage(await readFile(sampleFile("bedroom-after.jpg")));
    return { buffer: image.buffer, mimeType: "image/jpeg", width: image.width, height: image.height };
  }
}
