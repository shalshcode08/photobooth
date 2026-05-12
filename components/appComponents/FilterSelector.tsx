"use client";

import { useCameraStore } from "@/store/cameraStore";
import { FILTERS } from "@/lib/filters";
import { cn } from "@/lib/utils";

export default function FilterSelector() {
  const { activeFilterId, setActiveFilterId } = useCameraStore();

  return (
    <div className="w-full max-w-lg">
      <p className="mb-2 text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground">
        Filter
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((filter) => (
          <button
            key={filter.id}
            onClick={() => setActiveFilterId(filter.id)}
            className={cn(
              "flex shrink-0 flex-col items-center gap-1.5 rounded-md border p-1.5 transition-colors",
              activeFilterId === filter.id
                ? "border-primary bg-primary/5"
                : "border-border bg-muted hover:border-muted-foreground/40",
            )}
          >
            <div className="h-12 w-12 overflow-hidden rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/cats-showcase/cat-5.jpg"
                alt={filter.label}
                className="h-full w-full object-cover"
                style={{ filter: filter.cssPreview || undefined }}
              />
            </div>
            <span className="text-[10px] font-medium text-foreground">
              {filter.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
