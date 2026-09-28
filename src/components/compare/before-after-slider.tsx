"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  width: number;
  height: number;
  beforeLabel?: string;
  afterLabel?: string;
  beforeAlt: string;
  afterAlt: string;
  initialPosition?: number;
  className?: string;
  priority?: boolean;
}

/**
 * Drag, tap, or use arrow keys to compare. Pointer events cover mouse, pen
 * and touch; `touch-action: pan-y` keeps vertical page scrolling working on
 * phones while horizontal drags move the divider.
 */
export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  width,
  height,
  beforeLabel = "Original",
  afterLabel = "Feng Shui Optimized",
  beforeAlt,
  afterAlt,
  initialPosition = 50,
  className,
  priority,
}: BeforeAfterSliderProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [position, setPosition] = React.useState(initialPosition);
  const [dragging, setDragging] = React.useState(false);

  const updateFromClientX = React.useCallback((clientX: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setPosition(Math.min(100, Math.max(0, next)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.button !== 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDragging(true);
    updateFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging) updateFromClientX(e.clientX);
  };
  const endDrag = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    setDragging(false);
  };
  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") setPosition((p) => Math.max(0, p - step));
    else if (e.key === "ArrowRight") setPosition((p) => Math.min(100, p + step));
    else if (e.key === "Home") setPosition(0);
    else if (e.key === "End") setPosition(100);
    else return;
    e.preventDefault();
  };

  return (
    <div
      ref={containerRef}
      className={cn(
        "group relative w-full select-none overflow-hidden rounded-md bg-muted",
        dragging ? "cursor-grabbing" : "cursor-ew-resize",
        className,
      )}
      style={{ aspectRatio: `${width} / ${height}`, touchAction: "pan-y" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- sources are data URLs or static samples */}
      <img
        src={afterSrc}
        alt={afterAlt}
        width={width}
        height={height}
        draggable={false}
        fetchPriority={priority ? "high" : undefined}
        className="absolute inset-0 size-full object-cover"
      />
      <div className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        {/* eslint-disable-next-line @next/next/no-img-element -- sources are data URLs or static samples */}
        <img
          src={beforeSrc}
          alt={beforeAlt}
          width={width}
          height={height}
          draggable={false}
          fetchPriority={priority ? "high" : undefined}
          className="absolute inset-0 size-full object-cover"
        />
      </div>

      <span
        className={cn(
          "pointer-events-none absolute left-3 top-3 rounded-sm bg-black/45 px-2 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm transition-opacity sm:left-4 sm:top-4",
          position < 12 && "opacity-0",
        )}
      >
        {beforeLabel}
      </span>
      <span
        className={cn(
          "pointer-events-none absolute right-3 top-3 rounded-sm bg-black/45 px-2 py-1 text-[11px] font-medium tracking-wide text-white backdrop-blur-sm transition-opacity sm:right-4 sm:top-4",
          position > 88 && "opacity-0",
        )}
      >
        {afterLabel}
      </span>

      <div
        className="pointer-events-none absolute inset-y-0 w-px bg-white/90 shadow-[0_0_0_0.5px_rgba(0,0,0,0.15)]"
        style={{ left: `${position}%` }}
      />
      <div
        role="slider"
        tabIndex={0}
        aria-label="Compare original and optimized room"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(position)}
        aria-valuetext={`${Math.round(position)}% original`}
        onKeyDown={onKeyDown}
        className={cn(
          "absolute top-1/2 flex size-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-white/85 text-foreground shadow-md backdrop-blur-md transition-transform duration-150",
          dragging ? "scale-95" : "group-hover:scale-105",
        )}
        style={{ left: `${position}%` }}
      >
        <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth={1.6} aria-hidden>
          <path d="M9 6l-5 6 5 6M15 6l5 6-5 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
}
