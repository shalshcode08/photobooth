"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { ArrowRightIcon } from "lucide-react";
import {
  ModalBody,
  ModalContent,
  ModalFooter,
  useModal,
} from "@/components/ui/animated-modal";
import { useCameraStore } from "@/store/cameraStore";
import Folder from "@/components/Folder";
import { cn } from "@/lib/utils";

export type LayoutId =
  | "strip-vertical"
  | "strip-horizontal"
  | "grid-mixed"
  | "polaroid"
  | "duo";

interface LayoutOption {
  id: LayoutId;
  label: string;
  description: string;
  photosUsed: number;
  preview: ReactNode;
}

// ── Film-strip preview primitives ─────────────────────────────────────────
// Monochrome aesthetic: pure-black strip body, off-white sprockets, and a
// grayscale gradient inside each frame so the preview reads as a B&W contact
// sheet rather than a sepia film negative.

function Sprockets({
  count,
  vertical = false,
}: {
  count: number;
  vertical?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center justify-around",
        vertical ? "flex-col px-[2px] py-1" : "px-1 py-[2px]",
      )}
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-[1px] bg-neutral-100"
          style={{ width: 3, height: 3 }}
        />
      ))}
    </div>
  );
}

function Frame({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-[1px] bg-gradient-to-br from-neutral-200 via-neutral-400 to-neutral-700",
        className,
      )}
    />
  );
}

const STRIP_BODY = "bg-neutral-950 shadow-[1px_2px_4px_rgba(0,0,0,0.25)]";

const VerticalStripPreview = () => (
  <div className={cn("flex h-[4.5rem] w-11 rounded-[3px]", STRIP_BODY)}>
    <Sprockets vertical count={5} />
    <div className="flex flex-1 flex-col gap-[2px] py-1">
      <Frame className="flex-1" />
      <Frame className="flex-1" />
      <Frame className="flex-1" />
      <Frame className="flex-1" />
    </div>
    <Sprockets vertical count={5} />
  </div>
);

const HorizontalStripPreview = () => (
  <div className={cn("flex h-11 w-[4.5rem] flex-col rounded-[3px]", STRIP_BODY)}>
    <Sprockets count={7} />
    <div className="flex flex-1 gap-[2px] px-1">
      <Frame className="flex-1" />
      <Frame className="flex-1" />
      <Frame className="flex-1" />
      <Frame className="flex-1" />
    </div>
    <Sprockets count={7} />
  </div>
);

const MixedGridPreview = () => (
  <div className={cn("flex h-14 w-[4.5rem] flex-col gap-1 rounded-[3px] p-1", STRIP_BODY)}>
    <div className="flex flex-1 gap-1">
      <Frame className="w-1/3" />
      <Frame className="flex-1" />
    </div>
    <div className="flex flex-1 gap-1">
      <Frame className="flex-1" />
      <Frame className="w-1/3" />
    </div>
  </div>
);

const PolaroidPreview = () => (
  <div
    className="flex h-[4.5rem] w-12 flex-col rounded-[2px] bg-white p-1 pb-2.5 ring-1 ring-black/10"
    style={{ boxShadow: "2px 3px 6px rgba(0,0,0,0.22)" }}
  >
    <Frame className="flex-1" />
  </div>
);

const DuoPreview = () => (
  <div className={cn("flex h-[4.5rem] w-11 rounded-[3px]", STRIP_BODY)}>
    <Sprockets vertical count={5} />
    <div className="flex flex-1 flex-col gap-[3px] py-1">
      <Frame className="flex-1" />
      <Frame className="flex-1" />
    </div>
    <Sprockets vertical count={5} />
  </div>
);

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "strip-vertical",
    label: "Classic Strip",
    description: "4 photos · column",
    photosUsed: 4,
    preview: <VerticalStripPreview />,
  },
  {
    id: "strip-horizontal",
    label: "Wide Strip",
    description: "4 photos · row",
    photosUsed: 4,
    preview: <HorizontalStripPreview />,
  },
  {
    id: "grid-mixed",
    label: "Mixed Grid",
    description: "4 photos · grid",
    photosUsed: 4,
    preview: <MixedGridPreview />,
  },
  {
    id: "polaroid",
    label: "Single Polaroid",
    description: "1 photo",
    photosUsed: 1,
    preview: <PolaroidPreview />,
  },
  {
    id: "duo",
    label: "Duo Stack",
    description: "2 photos",
    photosUsed: 2,
    preview: <DuoPreview />,
  },
];

export default function PrintLayoutModal() {
  const router = useRouter();
  const photos = useCameraStore((s) => s.photos);
  const [selected, setSelected] = useState<LayoutId>("strip-vertical");
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([0, 1, 2, 3]);
  const { setOpen } = useModal();

  const layoutMeta = LAYOUT_OPTIONS.find((o) => o.id === selected)!;
  const needsPicker = selected === "polaroid" || selected === "duo";
  const maxPick = layoutMeta.photosUsed;

  const selectLayout = (layout: LayoutOption) => {
    setSelected(layout.id);
    setSelectedPhotos(
      Array.from({ length: layout.photosUsed }, (_, i) => i),
    );
  };

  const togglePhoto = (i: number) => {
    setSelectedPhotos((prev) => {
      const already = prev.includes(i);
      if (already) {
        if (prev.length === 1) return prev; // keep at least one selected
        return prev.filter((x) => x !== i);
      }
      if (prev.length < maxPick) return [...prev, i];
      // at max — drop oldest, append new (preserves selection order)
      return [...prev.slice(1), i];
    });
  };

  const canContinue = selectedPhotos.length === maxPick;

  const handleContinue = () => {
    if (!canContinue) return;

    const params = new URLSearchParams({
      layout: selected,
      photos: selectedPhotos.slice(0, layoutMeta.photosUsed).join(","),
    });

    setOpen(false);
    router.push(`/booth/print?${params.toString()}`);
  };

  // Folder content — render each captured photo into a paper slot.
  const folderItems = photos.slice(0, 4).map((src, i) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      key={i}
      src={src}
      alt=""
      className="h-full w-full object-cover"
      style={{ display: "block" }}
    />
  ));

  return (
    <ModalBody className="md:max-w-2xl">
      {/* Subtle warm-gradient backdrop. The dotted grid is intentionally low
          contrast so it reads as texture rather than a pattern. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 dark:hidden"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 55% at 10% -5%, rgba(255,215,180,0.30), transparent 65%),
            radial-gradient(ellipse 55% 50% at 100% 105%, rgba(225,205,175,0.32), transparent 65%),
            radial-gradient(rgba(60,40,20,0.12) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 22px 22px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 55% at 10% -5%, rgba(180,120,80,0.14), transparent 65%),
            radial-gradient(ellipse 55% 50% at 100% 105%, rgba(140,110,90,0.12), transparent 65%),
            radial-gradient(rgba(251,242,223,0.10) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 22px 22px",
        }}
      />

      <ModalContent>
        <div className="mb-4 pr-10 sm:mb-5">
          <h2 className="font-heading text-xl font-bold tracking-tight sm:text-2xl">
            Choose your layout
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Pick how your photos sit on the printed strip.
          </p>
        </div>

        {/* Horizontal scroll row of layout options. Bleeds to the edges of the
            modal padding so cards can scroll cleanly without clipped shadows. */}
        <div className="-mx-4 sm:-mx-6 md:-mx-8">
          <div className="hide-scrollbar flex snap-x snap-mandatory gap-2 overflow-x-auto px-4 pb-2 sm:gap-2.5 sm:px-6 md:px-8">
            {LAYOUT_OPTIONS.map((opt) => {
              const isSelected = selected === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => selectLayout(opt)}
                  aria-pressed={isSelected}
                  className={cn(
                    "group flex w-[6.25rem] shrink-0 snap-start flex-col items-stretch gap-1.5 rounded-xl border p-1.5 text-left transition-all sm:w-[6.5rem]",
                    isSelected
                      ? "border-[#C8390A] bg-[#C8390A]/[0.04] shadow-[0_4px_14px_rgba(200,57,10,0.16)]"
                      : "border-border bg-background hover:border-[#C8390A]/40 hover:shadow-sm",
                  )}
                >
                  <div className="flex h-[5.5rem] w-full items-center justify-center rounded-md bg-neutral-100 dark:bg-neutral-900">
                    {opt.preview}
                  </div>
                  <div className="w-full px-0.5 text-center">
                    <p className="truncate text-[12px] font-semibold leading-tight">
                      {opt.label}
                    </p>
                    <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
                      {opt.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {needsPicker && (
          <div className="mt-5 border-t border-foreground/10 pt-4">
            <div className="mb-3 flex items-baseline gap-2">
              <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                {selected === "polaroid" ? "Pick 1 photo" : "Pick 2 photos"}
              </p>
              {selectedPhotos.length < maxPick && (
                <span className="text-[11px] font-medium text-[#C8390A]">
                  {maxPick - selectedPhotos.length} to go
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 sm:gap-2.5">
              {photos.map((src, i) => {
                const isSel = selectedPhotos.includes(i);
                const order = selectedPhotos.indexOf(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => togglePhoto(i)}
                    className={cn(
                      "relative h-14 w-14 overflow-hidden rounded-md border-2 transition-all sm:h-16 sm:w-16",
                      isSel
                        ? "scale-[1.04] border-[#C8390A] shadow-[0_2px_10px_rgba(200,57,10,0.25)]"
                        : "border-border opacity-70 hover:border-[#C8390A]/40 hover:opacity-100",
                    )}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                    {isSel && maxPick > 1 && (
                      <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-[#C8390A] text-[10px] font-bold text-white shadow-sm">
                        {order + 1}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </ModalContent>

      <ModalFooter className="flex-col-reverse items-stretch justify-between border-t border-foreground/10 bg-transparent dark:bg-transparent sm:flex-row sm:items-center">
        {/* Folder of captured shots — hover to spread the papers */}
        <div className="ml-2 flex items-end" aria-hidden>
          <Folder color="#C8390A" size={0.55} items={folderItems} />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          disabled={!canContinue}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[#C8390A] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(200,57,10,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_6px_18px_rgba(200,57,10,0.45)] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:scale-100 sm:h-auto"
        >
          Continue
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </ModalFooter>
    </ModalBody>
  );
}
