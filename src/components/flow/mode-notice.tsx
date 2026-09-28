import { FlaskConical, ImageOff } from "lucide-react";
import { Notice } from "@/components/ui/notice";
import type { AppMode } from "@/lib/domain/types";

/** Persistent, explicit labeling whenever results are not a live AI generation. */
export function ModeNotice({ mode, uploadedOwnPhoto = false }: { mode: AppMode; uploadedOwnPhoto?: boolean }) {
  if (mode === "live") return null;
  if (mode === "analysis_only") {
    return (
      <Notice icon={<ImageOff aria-hidden />}>
        <span className="font-medium">AI image generation is not configured.</span>{" "}
        <span className="text-foreground/70">Your room will be analyzed, but no new image will be rendered.</span>
      </Notice>
    );
  }
  return (
    <Notice icon={<FlaskConical aria-hidden />}>
      <span className="font-medium">Demo Mode — AI image generation is not configured.</span>{" "}
      <span className="text-foreground/70">
        {uploadedOwnPhoto ? "Your photo is checked, but results show a sample room." : "Results show a sample room."}
      </span>
    </Notice>
  );
}
