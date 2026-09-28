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

function Question({ title, hint, children, first }: { title: string; hint?: string; children: React.ReactNode; first?: boolean }) {
  return (
    <fieldset className={first ? undefined : "border-t border-border pt-8"}>
      <legend className="sr-only">{title}</legend>
      <div className="mb-5">
        <h2 className="font-display text-[1.6rem] font-medium leading-tight">{title}</h2>
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
    <div>
      <header className="mx-auto max-w-2xl text-center">
        <h1 className="font-display-light text-[2.75rem] leading-[1.05] sm:text-[3.5rem]">Tell us about the room</h1>
        <p className="mx-auto mt-4 max-w-lg text-[17px] leading-relaxed text-muted-foreground">
          Three short questions. Only the first is required.
        </p>
      </header>

      {/* Photo and first question share a top edge. */}
      <div className="mt-12 grid gap-10 lg:grid-cols-12 lg:gap-16">
      <div className="lg:col-span-5">
        <div className="lg:sticky lg:top-24">
          <figure className="relative overflow-hidden rounded-[1.75rem] bg-muted shadow-[0_40px_100px_-50px_rgba(34,56,44,0.5)]" style={{ aspectRatio: `${photo.width} / ${photo.height}` }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local object URL preview */}
            <img src={photo.previewUrl} alt="Your uploaded room" className="absolute inset-0 size-full object-cover" />
            <button
              type="button"
              onClick={onRemovePhoto}
              className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/35 text-white backdrop-blur-md transition-colors duration-300 hover:bg-black/55"
              aria-label="Remove photo"
            >
              <X className="size-4" />
            </button>
          </figure>
          <div className="mt-4 flex items-center justify-between gap-3 px-1 text-sm text-muted-foreground">
            <span className="truncate">
              {photo.isSample ? "Sample bedroom" : photo.file.name} · {photo.width}×{photo.height} · {formatBytes(photo.file.size)}
            </span>
            <button type="button" onClick={() => replaceRef.current?.click()} className="-my-2 -mr-2 flex shrink-0 items-center gap-1.5 rounded-full px-2 py-2 font-medium text-foreground underline-offset-4 hover:underline">
              <RefreshCw className="size-3.5" strokeWidth={1.75} /> Replace
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
        className="space-y-8 lg:col-span-7"
        onSubmit={(e) => {
          e.preventDefault();
          if (ready) onSubmit();
        }}
      >
        <Question first title="What type of room is this?">
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
                  <Icon strokeWidth={1.5} /> {ROOM_TYPE_LABELS[type]}
                </ToggleGroupItem>
              );
            })}
            <ToggleGroupItem value="auto" className="col-span-2 justify-start sm:col-span-1">
              <WandSparkles strokeWidth={1.5} /> Auto-detect
            </ToggleGroupItem>
          </ToggleGroup>
        </Question>

        <Question title="What matters most to you?" hint="Optional. Choose as many as you like.">
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
          title="Feng Shui approach"
          hint="How closely to follow the classical rules."
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
                  "h-full flex-col items-start gap-1.5 whitespace-normal px-5 py-4 text-left",
                  "data-[state=on]:[&_.desc]:text-primary-foreground/70",
                )}
              >
                <span className="text-[15px] font-medium">{FENG_SHUI_MODE_LABELS[mode].label}</span>
                <span className="desc text-[13px] leading-relaxed text-muted-foreground">{FENG_SHUI_MODE_LABELS[mode].description}</span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </Question>

        <div data-action-bar="lg" className="fixed inset-x-0 bottom-0 z-30 border-t border-border/70 bg-background/92 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl lg:static lg:border-0 lg:bg-transparent lg:p-0 lg:pt-2 lg:backdrop-blur-none">
          <Button type="submit" size="lg" disabled={!ready} className="w-full lg:w-auto">
            {ready ? "Analyze My Room" : "Choose a room type to continue"} {ready && <ArrowRight />}
          </Button>
        </div>
      </form>
      </div>
    </div>
  );
}
