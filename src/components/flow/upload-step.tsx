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
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display-light text-[2.75rem] leading-[1.05] sm:text-[3.5rem]">Upload a photo of your room</h1>
        <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
          Your walls, windows and floor stay exactly as they are. Only what can move, moves.
        </p>
      </header>

      {/* Dropzone and tips share a top edge and stretch to the same height. */}
      <div className="mt-12 grid gap-4 lg:grid-cols-12 lg:gap-5">
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
              "relative flex min-h-[300px] flex-1 flex-col items-center justify-center gap-5 overflow-hidden rounded-[2rem] border-[1.5px] border-dashed border-sage/70 bg-surface/60 px-6 py-14 text-center transition-[background-color,border-color] duration-500 ease-calm sm:min-h-[360px]",
              dragActive && "border-primary bg-sage-soft/70",
            )}
          >
            <span
              className={cn(
                "flex size-16 items-center justify-center rounded-full bg-sage-soft text-primary transition-transform duration-500 ease-calm",
                dragActive && "scale-110",
              )}
            >
              {checking ? (
                <LoaderCircle className="size-6 animate-spin" aria-label="Checking photo" />
              ) : (
                <ImageUp className="size-6" strokeWidth={1.4} aria-hidden />
              )}
            </span>
            <div className="hidden sm:block">
              <p className="font-display text-[1.75rem] font-medium leading-tight">
                {dragActive ? "Release to upload" : "Drop your photo here"}
              </p>
              <p className="mt-2 text-[15px] text-muted-foreground">
                or{" "}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="font-medium text-foreground underline decoration-border-strong underline-offset-[6px] transition-colors hover:decoration-foreground"
                >
                  browse files
                </button>
              </p>
            </div>
            <Button type="button" size="lg" onClick={() => inputRef.current?.click()} className="sm:hidden">
              <Camera /> Take or choose a photo
            </Button>
            <p className="text-sm text-subtle-foreground">JPG, PNG or WEBP, up to {formatBytes(maxBytes)}</p>
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
            <p role="alert" className="mt-4 flex items-start justify-center gap-2 text-sm text-destructive">
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden /> {error}
            </p>
          )}
        </div>

        <aside className="flex flex-col rounded-[2rem] bg-sage-soft/55 p-7 sm:p-8 lg:col-span-4">
          <h2 className="font-display text-[1.6rem] font-medium leading-tight">For best results</h2>
          <ul className="mb-8 mt-5 space-y-4">
            {TIPS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-start gap-3 text-[15px] leading-relaxed">
                <Icon className="mt-[4px] size-4 shrink-0 text-primary/80" strokeWidth={1.5} aria-hidden />
                {text}
              </li>
            ))}
          </ul>
          <p className="mt-auto border-t border-primary/10 pt-5 text-xs leading-relaxed text-muted-foreground">
            Location data is removed before analysis. Photos are sent to our AI providers only to create your result, and
            aren&apos;t saved by this app.
          </p>
        </aside>
      </div>

      <p className="mt-10 text-center text-[15px] text-muted-foreground">
        No photo to hand?{" "}
        <button
          type="button"
          onClick={useSample}
          className="font-medium text-foreground underline decoration-border-strong underline-offset-[6px] transition-colors hover:decoration-foreground"
          disabled={checking}
        >
          Try our sample bedroom
        </button>
      </p>
    </div>
  );
}
