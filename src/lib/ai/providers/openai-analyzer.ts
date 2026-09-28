import "server-only";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { AppError } from "@/lib/errors";
import { ANALYSIS_SYSTEM_PROMPT, buildAnalysisUserPrompt } from "@/lib/ai/prompts";
import { RoomAnalysisModelSchema, type RoomAnalysis } from "@/lib/ai/schema";
import { finalizeAnalysis, type AnalyzeRoomInput, type RoomAnalyzer } from "@/lib/ai/room-analyzer";
import { mapOpenAIError } from "@/lib/ai/providers/openai-shared";

// Plain strict JSON-schema format (no SDK auto-parse); finalizeAnalysis validates the output.
const { json_schema: RESPONSE_SCHEMA } = zodResponseFormat(RoomAnalysisModelSchema, "room_analysis");

/** Alternative Stage 1 provider, useful when only an OpenAI key is available. */
export class OpenAIRoomAnalyzer implements RoomAnalyzer {
  readonly provider = "openai";
  readonly isSample = false;
  private readonly client: OpenAI;

  constructor(
    apiKey: string,
    readonly model: string,
    timeoutMs: number,
  ) {
    this.client = new OpenAI({ apiKey, timeout: timeoutMs, maxRetries: 1 });
  }

  async analyze({ image, preferences, signal, onPartialText }: AnalyzeRoomInput): Promise<RoomAnalysis> {
    try {
      const stream = this.client.chat.completions.stream(
        {
          model: this.model,
          response_format: { type: "json_schema", json_schema: RESPONSE_SCHEMA },
          messages: [
            { role: "system", content: ANALYSIS_SYSTEM_PROMPT },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: `data:image/jpeg;base64,${image.buffer.toString("base64")}`, detail: "high" },
                },
                { type: "text", text: buildAnalysisUserPrompt(preferences) },
              ],
            },
          ],
        },
        { signal },
      );
      stream.on("content.delta", ({ snapshot }) => onPartialText?.(snapshot));
      const completion = await stream.finalChatCompletion();
      const message = completion.choices[0]?.message;
      if (message?.refusal) throw new AppError("MODERATION_BLOCKED", { detail: "openai refusal" });
      return finalizeAnalysis(message?.content ?? "");
    } catch (err) {
      throw mapOpenAIError(err);
    }
  }
}
