"use client";

import * as React from "react";
import { Camera, CircleAlert, ImageUp, LoaderCircle, ScanEye, Sun, Maximize } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ACCEPTED_IMAGE_TYPES } from "@/lib/domain/options";
import { validateImageFile } from "@/lib/client/validate-file";
import { formatBytes, cn } from "@/lib/utils";

export interface SelectedPhoto {
  file: File;
  previewUrl: string;
  width: number;
  height: number;
  isSample: boolean;
}

const TIPS = [
  { icon: Camera, text: "Take the photo from a corner or doorway." },
  { icon: Maximize, text: "Make sure most of the room is visible." },
  { icon: Sun, text: "Use a reasonably well-lit photo." },
  { icon: ScanEye, text: "Avoid heavily obstructed views." },
];

export function UploadStep({ maxBytes, onSelected }: { maxBytes: number; onSelected: (photo: SelectedPhoto) => void }) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [checking, setChecking] = React.useState(false);

  const accept = React.useCallback(
    async (file: File | undefined, isSample = false) => {
      if (!file) return;
      setError(null);
      setChecking(true);
      const result = await validateImageFile(file, maxBytes);
      setChecking(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onSelected({ file, previewUrl: URL.createObjectURL(file), width: result.width, height: result.height, isSample });
    },
    [maxBytes, onSelected],
  );

  // Paste a photo from the clipboard anywhere on this step.
  React.useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = Array.from(e.clipboardData?.files ?? []).find((f) => f.type.startsWith("image/"));
      if (file) void accept(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [accept]);

  const useSample = async () => {
    setChecking(true);
    try {
      const blob = await (await fetch("/samples/bedroom-before.jpg")).blob();
      await accept(new File([blob], "sample-bedroom.jpg", { type: "image/jpeg" }), true);
    } catch {
      setChecking(false);
      setError("We couldn't load the sample photo. Please try again.");
    }
  };

  return (
    <div>
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Upload a photo of your room</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          We&apos;ll keep your walls, windows, floor and camera angle exactly as they are, and rearrange only what can move.
        </p>
      </header>

      {/* Dropzone and tips share a top edge and stretch to the same height. */}
      <div className="mt-8 grid gap-6 lg:grid-cols-12 lg:gap-8">
        <div className="flex flex-col lg:col-span-8">
          <div
            onDragEnter={(e) => (e.preventDefault(), setDragActive(true))}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragActive(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setDragActive(false);
              void accept(e.dataTransfer.files?.[0]);
            }}
            className={cn(
              "relative flex min-h-[280px] flex-1 flex-col items-center justify-center gap-4 overflow-hidden rounded-3xl border border-dashed border-sage bg-gradient-to-br from-surface/90 via-surface/70 to-sage-soft/60 px-6 py-12 text-center backdrop-blur-sm transition-colors sm:min-h-[340px]",
              dragActive && "border-primary from-sage-soft to-mist",
            )}
          >
            <span className="flex size-16 items-center justify-center rounded-full bg-sage-soft text-primary">
              {checking ? (
                <LoaderCircle className="size-6 animate-spin" aria-label="Checking photo" />
              ) : (
                <ImageUp className="size-6" strokeWidth={1.5} aria-hidden />
              )}
            </span>
            <div className="hidden space-y-1 sm:block">
              <p className="text-[17px] font-medium">
                Drag and drop a photo, or{" "}
                <button type="button" onClick={() => inputRef.current?.click()} className="underline underline-offset-4 hover:text-foreground/80">
                  browse files
                </button>
              </p>
              <p className="text-sm text-muted-foreground">JPG, PNG or WEBP · up to {formatBytes(maxBytes)}</p>
            </div>
            <div className="flex flex-col items-center gap-3 sm:hidden">
              <Button type="button" size="lg" onClick={() => inputRef.current?.click()}>
                <Camera /> Take or choose photo
              </Button>
              <p className="text-sm text-muted-foreground">JPG, PNG or WEBP · up to {formatBytes(maxBytes)}</p>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              className="sr-only"
              aria-label="Upload a room photo"
              onChange={(e) => {
                void accept(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>

          {error && (
            <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-destructive">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
            </p>
          )}
        </div>

        <aside className="flex flex-col rounded-2xl border border-border/80 bg-surface/70 p-6 backdrop-blur-sm lg:col-span-4">
          <p className="eyebrow mb-4">For best results</p>
          <ul className="space-y-4">
            {TIPS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-sm leading-relaxed">
                <Icon className="mt-[3px] size-4 shrink-0 text-muted-foreground" strokeWidth={1.6} aria-hidden />
                {text}
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-border pt-4 text-xs leading-relaxed text-subtle-foreground lg:mt-auto">
            Location data is removed from your photo before analysis. Photos are sent to our AI providers to create your
            result and aren&apos;t saved by this app.
          </p>
        </aside>
      </div>

      <p className="mt-6 text-sm text-muted-foreground">
        No photo handy?{" "}
        <button type="button" onClick={useSample} className="font-medium text-foreground underline underline-offset-4" disabled={checking}>
          Try the sample bedroom
        </button>
      </p>
    </div>
  );
}
