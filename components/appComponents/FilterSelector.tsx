"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useCameraStore } from "@/store/cameraStore";
import { FILTERS } from "@/lib/filters";
import { cn } from "@/lib/utils";

const SCROLL_STEP = 200; // px per arrow press — roughly 3 chips

export default function FilterSelector() {
  const { activeFilterId, setActiveFilterId } = useCameraStore();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);

  const updateBounds = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 1);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    updateBounds();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateBounds, { passive: true });
    window.addEventListener("resize", updateBounds);
    return () => {
      el.removeEventListener("scroll", updateBounds);
      window.removeEventListener("resize", updateBounds);
    };
  }, [updateBounds]);

  const scrollStrip = (dir: -1 | 1) => {
    scrollRef.current?.scrollBy({ left: dir * SCROLL_STEP, behavior: "smooth" });
  };

  return (
    <div className="w-full max-w-lg">
      <p className="mb-2 text-xs font-semibold tracking-[0.1em] uppercase text-muted-foreground">
        Filter
      </p>

      <div className="relative">
        <button
          type="button"
          onClick={() => scrollStrip(-1)}
          disabled={!canPrev}
          aria-label="Scroll filters left"
          className="absolute right-full top-1/2 mr-2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#C8390A]/45 bg-background/85 text-[#C8390A] shadow-sm transition-all hover:border-[#C8390A]/75 hover:bg-[#C8390A]/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-background/85 lg:flex"
        >
          <ChevronLeftIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>

        <div
          ref={scrollRef}
          className="flex gap-2 overflow-x-auto scroll-smooth pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              data-filter-id={filter.id}
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

        <button
          type="button"
          onClick={() => scrollStrip(1)}
          disabled={!canNext}
          aria-label="Scroll filters right"
          className="absolute left-full top-1/2 ml-2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full border border-[#C8390A]/45 bg-background/85 text-[#C8390A] shadow-sm transition-all hover:border-[#C8390A]/75 hover:bg-[#C8390A]/10 active:scale-95 disabled:cursor-not-allowed disabled:opacity-25 disabled:hover:bg-background/85 lg:flex"
        >
          <ChevronRightIcon className="h-3.5 w-3.5" strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}
