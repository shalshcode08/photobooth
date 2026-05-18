"use client";

import { MAX_ZOOM, MIN_ZOOM, useCameraStore } from "@/store/cameraStore";
import { cn } from "@/lib/utils";

// Vintage camcorder zoom rocker styled as a vertical slider. The chrome body
// hosts a native <input type="range"> for accessibility, keyboard, and touch
// support — the heavy lifting (track + thumb cosmetics) lives in globals.css
// under `.retro-zoom-slider`.
export default function ZoomSlider({ className }: { className?: string }) {
  const { zoom, setZoom, enabled } = useCameraStore();

  return (
    <div
      className={cn(
        "inline-flex flex-col items-center gap-2 rounded-md border border-black/30 bg-gradient-to-b from-[#3a3530] via-[#2a2622] to-[#1f1c19] px-2 py-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_2px_6px_rgba(0,0,0,0.35)]",
        className,
      )}
    >
      <span className="text-[10px] font-bold leading-none text-white/85 sm:text-[11px]">
        T
      </span>
      <input
        type="range"
        min={MIN_ZOOM}
        max={MAX_ZOOM}
        step={0.05}
        value={zoom}
        disabled={!enabled}
        onChange={(event) => setZoom(Number.parseFloat(event.target.value))}
        aria-label="Camera zoom"
        className="retro-zoom-slider"
      />
      <span className="text-[10px] font-bold leading-none text-white/85 sm:text-[11px]">
        W
      </span>
      <span className="font-mono text-[10px] leading-none text-amber-200/90 sm:text-[11px]">
        {zoom.toFixed(1)}x
      </span>
    </div>
  );
}
