"use client";

import * as React from "react";
import {
  ArrowRight,
  Bath,
  Bed,
  Briefcase,
  CookingPot,
  DoorOpen,
  RefreshCw,
  Shapes,
  Sofa,
  Utensils,
  WandSparkles,
  X,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import {
  FENG_SHUI_MODES,
  FENG_SHUI_MODE_LABELS,
  PRIORITIES,
  PRIORITY_LABELS,
  ROOM_TYPES,
  ROOM_TYPE_LABELS,
  type FengShuiMode,
  type Priority,
  type RoomType,
  type RoomTypeSelection,
} from "@/lib/domain/options";
import type { SelectedPhoto } from "@/components/flow/upload-step";
import { cn, formatBytes } from "@/lib/utils";

const ROOM_ICONS: Record<RoomType, LucideIcon> = {
  bedroom: Bed,
  living_room: Sofa,
  office: Briefcase,
  dining_room: Utensils,
  kitchen: CookingPot,
  bathroom: Bath,
  entryway: DoorOpen,
  other: Shapes,
};

export interface DetailsValue {
  roomType: RoomTypeSelection | null;
  priorities: Priority[];
  fengShuiMode: FengShuiMode;
}

function Question({ n, title, hint, children }: { n: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-border pt-6">
      <legend className="sr-only">{title}</legend>
      <div className="mb-4">
        <h2 className="flex items-baseline gap-2.5 text-[17px] font-semibold tracking-tight">
          <span className="font-mono text-xs font-normal text-subtle-foreground">{n}</span>
          {title}
        </h2>
        {hint && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{hint}</p>}
      </div>
      {children}
    </fieldset>
  );
}

export function DetailsStep({
  photo,
  value,
  onChange,
  onRemovePhoto,
  onReplacePhoto,
  onSubmit,
}: {
  photo: SelectedPhoto;
  value: DetailsValue;
  onChange: (value: DetailsValue) => void;
  onRemovePhoto: () => void;
  onReplacePhoto: (file: File) => void;
  onSubmit: () => void;
}) {
  const replaceRef = React.useRef<HTMLInputElement>(null);
  const ready = value.roomType !== null;

  return (
    <div className="pb-24 lg:pb-0">
      <header className="max-w-2xl">
        <h1 className="font-display text-4xl leading-tight sm:text-5xl">Tell us about the room</h1>
        <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
          Only the room type is required. Your priorities shape which changes we suggest.
        </p>
      </header>

      {/* Photo and questions share a top edge: the first divider lines up with the photo. */}
      <div className="mt-8 grid gap-10 lg:grid-cols-12 lg:gap-14">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-24">
          <figure className="relative overflow-hidden rounded-[22px] bg-muted shadow-[0_30px_80px_-40px_rgba(31,58,45,0.45)]" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={photo.previewUrl} alt="Your uploaded room" className="absolute inset-0 size-full object-cover" />
            <button
              type="button"
              onClick={onRemovePhoto}
              className="absolute right-2.5 top-2.5 flex size-8 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-colors hover:bg-black/70"
              aria-label="Remove photo"
            >
              <X className="size-4" />
            </button>
          </figure>
          <div className="mt-3 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="truncate">
              {photo.isSample ? "Sample bedroom" : photo.file.name} · {photo.width}×{photo.height} · {formatBytes(photo.file.size)}
            </span>
            <button type="button" onClick={() => replaceRef.current?.click()} className="-my-2 -mr-2 flex shrink-0 items-center gap-1 rounded-full px-2 py-2 font-medium text-foreground hover:underline">
              <RefreshCw className="size-3" /> Replace
            </button>
            <input
              ref={replaceRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="sr-only"
              aria-label="Replace photo"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onReplacePhoto(file);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>

      <form
        className="space-y-10 lg:col-span-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onSubmit();
        }}
      >
        <Question n="01" title="What type of room is this?">
          <ToggleGroup
            type="single"
            value={value.roomType ?? ""}
            onValueChange={(v) => v && onChange({ ...value, roomType: v as RoomTypeSelection })}
            aria-label="Room type"
            className="grid grid-cols-2 sm:grid-cols-3"
          >
            {ROOM_TYPES.map((type) => {
              const Icon = ROOM_ICONS[type];
              return (
                <ToggleGroupItem key={type} value={type} className="justify-start">
                  <Icon strokeWidth={1.6} /> {ROOM_TYPE_LABELS[type]}
                </ToggleGroupItem>
              );
            })}
            <ToggleGroupItem value="auto" className="col-span-2 justify-start sm:col-span-1">
              <WandSparkles strokeWidth={1.6} /> Auto-detect
            </ToggleGroupItem>
          </ToggleGroup>
        </Question>

        <Question n="02" title="What matters most to you?" hint="Optional — choose any.">
          <ToggleGroup
            type="multiple"
            value={value.priorities}
            onValueChange={(v) => onChange({ ...value, priorities: v as Priority[] })}
            aria-label="Priorities"
          >
            {PRIORITIES.map((p) => (
              <ToggleGroupItem key={p} value={p} className="rounded-full px-4">
                {PRIORITY_LABELS[p]}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Question>

        <Question
          n="03"
          title="Feng Shui approach"
          hint="Feng Shui is a traditional spatial-design philosophy. Choose how literally to apply it — Traditional is the default."
        >
          <ToggleGroup
            type="single"
            value={value.fengShuiMode}
            onValueChange={(v) => v && onChange({ ...value, fengShuiMode: v as FengShuiMode })}
            aria-label="Feng Shui approach"
            className="grid gap-2 sm:grid-cols-3"
          >
            {FENG_SHUI_MODES.map((mode) => (
              <ToggleGroupItem
                key={mode}
                value={mode}
                className={cn(
                  "h-full flex-col items-start gap-1.5 whitespace-normal px-4 py-3.5 text-left",
                  "data-[state=on]:[&_.desc]:text-primary-foreground/70",
                )}
              >
                <span className="text-sm font-medium">{FENG_SHUI_MODE_LABELS[mode].label}</span>
                <span className="desc text-xs leading-relaxed text-muted-foreground">{FENG_SHUI_MODE_LABELS[mode].description}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Question>

        <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-background/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none">
          <Button type="submit" size="lg" disabled={!ready} className="w-full lg:w-auto">
            {ready ? "Analyze My Room" : "Choose a room type to continue"} {ready && <ArrowRight />}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}
