import { FlaskConical, ImageOff } from "lucide-react";
import type { AppMode } from "@/lib/domain/types";

/** Persistent, explicit labeling whenever results are not a live AI generation. */
export function ModeNotice({ mode, uploadedOwnPhoto = false }: { mode: AppMode; uploadedOwnPhoto?: boolean }) {
  if (mode === "live") return null;
  if (mode === "analysis_only") {
    return (
      <div role="status" className="flex items-start gap-3 rounded-xl border border-moderate/30 bg-moderate-soft/70 px-4 py-3 text-sm">
        <ImageOff className="mt-0.5 size-4 shrink-0 text-moderate" aria-hidden />
        <p>
          <span className="font-medium">AI image generation is not configured.</span>{" "}
          <span className="text-foreground/75">Your room will be analyzed, but no optimized image will be rendered.</span>
        </p>
      </div>
    );
  }
  return (
    <div role="status" className="flex items-start gap-3 rounded-xl border border-moderate/30 bg-moderate-soft/70 px-4 py-3 text-sm">
      <FlaskConical className="mt-0.5 size-4 shrink-0 text-moderate" aria-hidden />
      <p>
        <span className="font-medium">Demo Mode — AI image generation is not configured.</span>{" "}
        <span className="text-foreground/75">
          Results show a sample room with a pre-written analysis.
          {uploadedOwnPhoto && " Your photo is checked and validated, but it is not analyzed."}
        </span>
      </p>
    </div>
  );
}
