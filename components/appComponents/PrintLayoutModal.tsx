"use client";

import { useEffect, useState, type ReactNode } from "react";
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
          className="rounded-[1px] bg-[#fbf2df]"
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
        "rounded-[1px] bg-gradient-to-br from-[#b69a78] via-[#8a715a] to-[#5a4530]",
        className,
      )}
    />
  );
}

const VerticalStripPreview = () => (
  <div className="flex h-24 w-14 rounded-[3px] bg-[#1a120b] shadow-[1px_2px_4px_rgba(60,40,20,0.25)]">
    <Sprockets vertical count={6} />
    <div className="flex flex-1 flex-col gap-[2px] py-1">
      <Frame className="flex-1" />
      <Frame className="flex-1" />
      <Frame className="flex-1" />
      <Frame className="flex-1" />
    </div>
    <Sprockets vertical count={6} />
  </div>
);

const HorizontalStripPreview = () => (
  <div className="flex h-14 w-24 flex-col rounded-[3px] bg-[#1a120b] shadow-[1px_2px_4px_rgba(60,40,20,0.25)]">
    <Sprockets count={9} />
    <div className="flex flex-1 gap-[2px] px-1">
      <Frame className="flex-1" />
      <Frame className="flex-1" />
      <Frame className="flex-1" />
      <Frame className="flex-1" />
    </div>
    <Sprockets count={9} />
  </div>
);

const MixedGridPreview = () => (
  <div className="flex h-20 w-24 flex-col gap-1 rounded-[3px] bg-[#1a120b] p-1.5 shadow-[1px_2px_4px_rgba(60,40,20,0.25)]">
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
    className="flex h-24 w-16 flex-col rounded-[2px] bg-white p-1 pb-3 ring-1 ring-[#3a2418]/12"
    style={{ boxShadow: "2px 3px 6px rgba(60,40,20,0.22)" }}
  >
    <Frame className="flex-1" />
  </div>
);

const DuoPreview = () => (
  <div className="flex h-24 w-14 rounded-[3px] bg-[#1a120b] shadow-[1px_2px_4px_rgba(60,40,20,0.25)]">
    <Sprockets vertical count={6} />
    <div className="flex flex-1 flex-col gap-[3px] py-1">
      <Frame className="flex-1" />
      <Frame className="flex-1" />
    </div>
    <Sprockets vertical count={6} />
  </div>
);

const LAYOUT_OPTIONS: LayoutOption[] = [
  {
    id: "strip-vertical",
    label: "Classic Strip",
    description: "4 photos · 1 column",
    photosUsed: 4,
    preview: <VerticalStripPreview />,
  },
  {
    id: "strip-horizontal",
    label: "Wide Strip",
    description: "4 photos · 1 row",
    photosUsed: 4,
    preview: <HorizontalStripPreview />,
  },
  {
    id: "grid-mixed",
    label: "Mixed Grid",
    description: "4 photos · varied sizes",
    photosUsed: 4,
    preview: <MixedGridPreview />,
  },
  {
    id: "polaroid",
    label: "Single Polaroid",
    description: "Pick 1 photo",
    photosUsed: 1,
    preview: <PolaroidPreview />,
  },
  {
    id: "duo",
    label: "Duo Stack",
    description: "Pick 2 photos",
    photosUsed: 2,
    preview: <DuoPreview />,
  },
];

export default function PrintLayoutModal() {
  const photos = useCameraStore((s) => s.photos);
  const [selected, setSelected] = useState<LayoutId>("strip-vertical");
  const [selectedPhotos, setSelectedPhotos] = useState<number[]>([0, 1, 2, 3]);
  const { setOpen } = useModal();

  const layoutMeta = LAYOUT_OPTIONS.find((o) => o.id === selected)!;
  const needsPicker = selected === "polaroid" || selected === "duo";
  const maxPick = layoutMeta.photosUsed;

  // Reset photo selection whenever the layout changes — default to the first
  // N photos so the user has a sensible starting state.
  useEffect(() => {
    setSelectedPhotos(
      Array.from({ length: layoutMeta.photosUsed }, (_, i) => i),
    );
  }, [selected, layoutMeta.photosUsed]);

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

  const handleContinue = () => {
    // TODO (next sprint step): route to /booth/print with layout + photo indices.
    console.log("Continue:", { layout: selected, photos: selectedPhotos });
    setOpen(false);
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
    <ModalBody className="md:max-w-xl">
      {/* Subtle warm-gradient + dotted-grid background (light/dark) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 dark:hidden"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 55% at 10% -5%, rgba(255,215,180,0.42), transparent 65%),
            radial-gradient(ellipse 55% 50% at 100% 105%, rgba(225,205,175,0.45), transparent 65%),
            radial-gradient(rgba(60,40,20,0.30) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 20px 20px",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 60% 55% at 10% -5%, rgba(180,120,80,0.18), transparent 65%),
            radial-gradient(ellipse 55% 50% at 100% 105%, rgba(140,110,90,0.16), transparent 65%),
            radial-gradient(rgba(251,242,223,0.18) 1px, transparent 1px)
          `,
          backgroundSize: "100% 100%, 100% 100%, 20px 20px",
        }}
      />

      <ModalContent>
        <div className="mb-5">
          <h2 className="text-xl font-bold tracking-tight">
            Choose your layout
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            How would you like your photos arranged on the print?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3">
          {LAYOUT_OPTIONS.map((opt) => {
            const isSelected = selected === opt.id;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                aria-pressed={isSelected}
                className={cn(
                  "group flex flex-col items-center gap-2 rounded-xl border-2 p-2.5 text-left transition-all",
                  isSelected
                    ? "border-[#C8390A] bg-[#C8390A]/5 shadow-sm"
                    : "border-border bg-background hover:border-[#C8390A]/40 hover:bg-muted/30",
                )}
              >
                <div className="flex h-24 w-full items-center justify-center rounded-md bg-muted/40">
                  {opt.preview}
                </div>
                <div className="w-full text-center">
                  <p className="text-sm font-semibold">{opt.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {opt.description}
                  </p>
                </div>
              </button>
            );
          })}
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
            <div className="flex flex-wrap gap-2.5">
              {photos.map((src, i) => {
                const isSel = selectedPhotos.includes(i);
                const order = selectedPhotos.indexOf(i);
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => togglePhoto(i)}
                    className={cn(
                      "relative h-16 w-16 overflow-hidden rounded-md border-2 transition-all",
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

      <ModalFooter className="flex items-center justify-between border-t border-foreground/10 bg-transparent dark:bg-transparent">
        {/* Folder of captured shots — hover to spread the papers */}
        <div className="ml-2 flex items-end" aria-hidden>
          <Folder color="#C8390A" size={0.55} items={folderItems} />
        </div>

        <button
          type="button"
          onClick={handleContinue}
          className="inline-flex items-center gap-2 rounded-full bg-[#C8390A] px-6 py-2.5 text-sm font-semibold text-white shadow-[0_4px_14px_rgba(200,57,10,0.35)] transition-all hover:scale-[1.02] hover:shadow-[0_6px_18px_rgba(200,57,10,0.45)] active:scale-95"
        >
          Continue
          <ArrowRightIcon className="h-4 w-4" />
        </button>
      </ModalFooter>
    </ModalBody>
  );
}
