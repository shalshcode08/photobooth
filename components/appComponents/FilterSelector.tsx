"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

const FILTERS = [
  { id: "none", label: "None", style: "" },
  { id: "bw", label: "B&W", style: "grayscale(100%)" },
  { id: "sepia", label: "Sepia", style: "sepia(80%)" },
  { id: "warm", label: "Warm", style: "sepia(30%) saturate(140%) brightness(105%)" },
  { id: "cool", label: "Cool", style: "hue-rotate(20deg) saturate(120%)" },
  { id: "fade", label: "Fade", style: "brightness(110%) contrast(85%) saturate(80%)" },
  { id: "vivid", label: "Vivid", style: "saturate(180%) contrast(110%)" },
];

export default function FilterSelector() {
  const [selected, setSelected] = useState("none");

  return (
    <div className="w-full max-w-lg">
      <p className="mb-2 text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground">
        Filter
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setSelected(filter.id)}
            className={cn(
              "flex shrink-0 flex-col items-center gap-1.5 rounded-md border p-1.5 transition-colors",
              selected === filter.id
                ? "border-primary bg-primary/5"
                : "border-border bg-muted hover:border-muted-foreground/40",
            )}
          >
            <div
              className="h-12 w-12 rounded bg-gradient-to-br from-rose-300 via-amber-200 to-sky-300"
              style={{ filter: filter.style }}
            />
            <span className="text-[10px] font-medium text-foreground">
              {filter.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
