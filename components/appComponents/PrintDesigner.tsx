"use client";

import Image from "next/image";
import { CalendarDays, Circle, Clock3, Download, Heart, Sparkles, Square, Star } from "lucide-react";
import { useMemo, useState, type ComponentType, type CSSProperties } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCameraStore } from "@/store/cameraStore";
import { cn } from "@/lib/utils";

type StripColor = {
  id: string;
  label: string;
  value: string;
};

type PhotoShape = {
  id: "none" | "star" | "heart" | "rounded" | "circle";
  label: string;
  icon: ComponentType<{ className?: string }>;
  style?: CSSProperties;
};

type DateTimeMode = "none" | "date" | "time" | "both";

export type PrintLayoutId =
  | "strip-vertical"
  | "strip-horizontal"
  | "grid-mixed"
  | "polaroid"
  | "duo";

type PrintDesignerProps = {
  initialLayout: PrintLayoutId;
  initialPhotoIndices: number[];
  generatedAt: string;
};

const PRINT_LAYOUT_META: Record<
  PrintLayoutId,
  { label: string; photosUsed: number }
> = {
  "strip-vertical": { label: "Classic Strip", photosUsed: 4 },
  "strip-horizontal": { label: "Wide Strip", photosUsed: 4 },
  "grid-mixed": { label: "Mixed Grid", photosUsed: 4 },
  polaroid: { label: "Single Polaroid", photosUsed: 1 },
  duo: { label: "Duo Stack", photosUsed: 2 },
};

const STRIP_COLORS: StripColor[] = [
  { id: "paper", label: "Paper", value: "#fffaf0" },
  { id: "ink", label: "Ink", value: "#12100d" },
  { id: "blue", label: "Booth Blue", value: "#2949e6" },
  { id: "tomato", label: "Tomato", value: "#c8390a" },
  { id: "rose", label: "Rose", value: "#f06292" },
  { id: "sage", label: "Sage", value: "#8fb996" },
  { id: "butter", label: "Butter", value: "#f5ce5f" },
  { id: "mint", label: "Mint", value: "#9ee6cf" },
  { id: "sky", label: "Sky", value: "#9ec5ff" },
  { id: "gold", label: "Gold Fade", value: "linear-gradient(135deg, #fff2b7, #f6a64d)" },
  { id: "sunset", label: "Sunset", value: "linear-gradient(135deg, #ff7a59, #ffd166)" },
  { id: "pool", label: "Pool", value: "linear-gradient(135deg, #6ee7f9, #5271ff)" },
  { id: "candy", label: "Candy", value: "linear-gradient(135deg, #f9a8d4, #a78bfa)" },
  { id: "film", label: "Film", value: "linear-gradient(135deg, #191714, #4d3a28)" },
];

const PHOTO_SHAPES: PhotoShape[] = [
  { id: "none", label: "None", icon: Square },
  {
    id: "star",
    label: "Star",
    icon: Star,
    style: {
      clipPath: "url(#print-star-clip)",
      WebkitClipPath: "url(#print-star-clip)",
    },
  },
  {
    id: "heart",
    label: "Heart",
    icon: Heart,
    style: {
      clipPath: "url(#print-heart-clip)",
      WebkitClipPath: "url(#print-heart-clip)",
    },
  },
  {
    id: "rounded",
    label: "Rounded",
    icon: Square,
    style: { borderRadius: "22%" },
  },
  {
    id: "circle",
    label: "Circle",
    icon: Circle,
    style: { borderRadius: "9999px", aspectRatio: "1 / 1" },
  },
];

const DATE_TIME_OPTIONS: Array<{ id: DateTimeMode; label: string; icon: ComponentType<{ className?: string }> }> = [
  { id: "none", label: "None", icon: CalendarDays },
  { id: "date", label: "Date", icon: CalendarDays },
  { id: "time", label: "Time", icon: Clock3 },
  { id: "both", label: "Both", icon: Clock3 },
];

function formatStamp(mode: DateTimeMode, generatedAt: string) {
  if (mode === "none") return "";

  const now = new Date(generatedAt);
  const date = now.toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (mode === "date") return date;
  if (mode === "time") return time;
  return `${date} · ${time}`;
}

function luminanceFromHex(hex: string) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const channel = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function isDarkBackground(background: string) {
  const hexes = background.match(/#[0-9a-f]{6}/gi);
  if (!hexes?.length) return false;

  const average =
    hexes.reduce((sum, hex) => sum + luminanceFromHex(hex), 0) / hexes.length;
  return average < 0.42;
}

function useSelectedPhotos(photoIndices: number[], photoCount: number) {
  const photos = useCameraStore((state) => state.photos);

  return useMemo(() => {
    return Array.from({ length: photoCount }, (_, index) => {
      const photoIndex = photoIndices[index] ?? index;
      return photos[photoIndex] ?? null;
    });
  }, [photoCount, photoIndices, photos]);
}

export default function PrintDesigner({
  initialLayout,
  initialPhotoIndices,
  generatedAt,
}: PrintDesignerProps) {
  const layoutMeta = PRINT_LAYOUT_META[initialLayout];
  const stripPhotos = useSelectedPhotos(initialPhotoIndices, layoutMeta.photosUsed);
  const [selectedColor, setSelectedColor] = useState(STRIP_COLORS[0]);
  const [customColor, setCustomColor] = useState("#c8390a");
  const [shape, setShape] = useState<PhotoShape>(PHOTO_SHAPES[0]);
  const [dateTimeMode, setDateTimeMode] = useState<DateTimeMode>("date");
  const stamp = formatStamp(dateTimeMode, generatedAt);
  const stripBackground =
    selectedColor.id === "custom" ? customColor : selectedColor.value;
  const darkStrip = isDarkBackground(stripBackground);
  const stampColor = darkStrip
    ? "rgba(255,255,255,0.78)"
    : "rgba(0,0,0,0.62)";

  const renderPhoto = (src: string | null, index: number) => (
    <div
      key={index}
      className={cn(
        "grid aspect-[4/3] min-h-0 place-items-center overflow-hidden",
        shape.id === "none"
          ? "bg-white/85 shadow-inner ring-1 ring-black/10"
          : "bg-transparent",
      )}
    >
      {src && shape.id === "none" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={`Selected print photo ${index + 1}`}
          className="h-full w-full object-cover"
        />
      ) : src ? (
        <div
          className={cn(
            "relative aspect-square h-[84%] w-auto max-w-[92%] overflow-hidden",
            shape.id === "heart" && "h-[86%]",
            shape.id === "star" && "h-[88%]",
            shape.id === "rounded" && "h-[88%]",
            shape.id === "circle" && "h-[88%]",
          )}
          style={shape.style}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={src}
            alt={`Selected print photo ${index + 1}`}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-[radial-gradient(circle_at_30%_20%,rgba(41,73,230,0.08),transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.72),rgba(241,245,249,0.86))] text-xs font-medium text-muted-foreground">
          Empty
        </div>
      )}
    </div>
  );

  const previewContent = (() => {
    if (initialLayout === "strip-horizontal") {
      return (
        <div className="grid grid-cols-4 gap-2">
          {stripPhotos.map(renderPhoto)}
        </div>
      );
    }

    if (initialLayout === "grid-mixed") {
      return (
        <div className="grid grid-cols-2 gap-2">
          {stripPhotos.map(renderPhoto)}
        </div>
      );
    }

    if (initialLayout === "polaroid") {
      return (
        <div className="pb-10">
          {renderPhoto(stripPhotos[0] ?? null, 0)}
        </div>
      );
    }

    return <div className="grid gap-2">{stripPhotos.map(renderPhoto)}</div>;
  })();

  const previewWidth = cn(
    "relative w-full",
    initialLayout === "strip-horizontal" && "max-w-[36rem]",
    initialLayout === "grid-mixed" && "max-w-[26rem]",
    initialLayout === "polaroid" && "max-w-[clamp(10rem,27dvh,16rem)]",
    initialLayout === "duo" && "max-w-[clamp(8rem,24dvh,13rem)]",
    initialLayout === "strip-vertical" && "max-w-[clamp(8rem,21dvh,13rem)]",
  );

  return (
    <main className="print-page-surface h-dvh overflow-hidden">
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <clipPath id="print-star-clip" clipPathUnits="objectBoundingBox">
            <path d="M .5 .02 L .62 .35 L .98 .35 L .69 .56 L .80 .92 L .5 .70 L .20 .92 L .31 .56 L .02 .35 L .38 .35 Z" />
          </clipPath>
          <clipPath id="print-heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M .5 .92 C .43 .84 .14 .62 .09 .37 C .05 .17 .19 .05 .34 .05 C .42 .05 .48 .1 .5 .18 C .52 .1 .58 .05 .66 .05 C .81 .05 .95 .17 .91 .37 C .86 .62 .57 .84 .5 .92 Z" />
          </clipPath>
        </defs>
      </svg>

      <div className="relative z-10 grid h-full w-full grid-cols-[minmax(10rem,0.95fr)_minmax(0,1.05fr)] gap-3 p-3 sm:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] sm:gap-4 sm:p-4 lg:gap-6 lg:p-6">
        <aside className="min-h-0">
          <Card className="h-full gap-0 bg-background/76 py-0 shadow-[0_18px_70px_rgba(15,23,42,0.08)] backdrop-blur-md">
            <CardHeader className="shrink-0 px-3 py-3 sm:px-4 sm:py-4">
              <div className="flex items-center justify-center">
                <Image
                  src="/main-logo-light-theme.png"
                  alt="Photobooth"
                  width={150}
                  height={100}
                  className="h-auto w-24 dark:hidden sm:w-36"
                  priority
                />
                <Image
                  src="/main-logo-dark-theme.png"
                  alt="Photobooth"
                  width={150}
                  height={100}
                  className="hidden h-auto w-24 dark:block sm:w-32"
                  priority
                />
              </div>
            </CardHeader>
            <Separator />
            <CardContent className="min-h-0 flex-1 px-3 py-3 sm:px-4 sm:py-4">
              <div className="mb-3 sm:mb-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-primary sm:text-xs">
                  Print editor
                </p>
                <CardTitle className="mt-1 font-heading text-base font-semibold tracking-tight text-foreground sm:text-xl">
                  Make the strip yours.
                </CardTitle>
                <CardDescription className="mt-1 text-[11px] sm:text-xs">
                  Editing {layoutMeta.label.toLowerCase()} with {layoutMeta.photosUsed} selected{" "}
                  {layoutMeta.photosUsed === 1 ? "photo" : "photos"}.
                </CardDescription>
              </div>

              <div className="space-y-3 sm:space-y-4">
              <section>
                <h2 className="text-sm font-semibold text-foreground">
                  Strip color
                </h2>
                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {STRIP_COLORS.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Choose ${color.label}`}
                      aria-pressed={selectedColor.id === color.id}
                      className={cn(
                        "h-7 rounded-md border bg-background p-1 transition-all active:scale-95 sm:h-8",
                        selectedColor.id === color.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-muted-foreground/50",
                      )}
                    >
                      <span
                        className="block h-full w-full rounded-[3px]"
                        style={{ background: color.value }}
                      />
                    </button>
                  ))}
                  <label
                    className={cn(
                      "relative h-7 cursor-pointer rounded-md border bg-background p-1 transition-all sm:h-8",
                      selectedColor.id === "custom"
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-border hover:border-muted-foreground/50",
                    )}
                    aria-label="Choose custom strip color"
                  >
                    <input
                      type="color"
                      value={customColor}
                      onChange={(event) => {
                        setCustomColor(event.target.value);
                        setSelectedColor({
                          id: "custom",
                          label: "Custom",
                          value: event.target.value,
                        });
                      }}
                      className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                    />
                    <span
                      className="block h-full w-full rounded-[3px]"
                      style={{ background: customColor }}
                    />
                  </label>
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-foreground">
                  Photo shape
                </h2>
                <div className="mt-2 grid grid-cols-5 gap-1.5">
                  {PHOTO_SHAPES.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setShape(option)}
                        aria-pressed={shape.id === option.id}
                        className={cn(
                          "flex h-11 flex-col items-center justify-center gap-1 border text-[10px] font-medium transition-all active:scale-[0.98] sm:h-14",
                          shape.id === option.id
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border bg-background/60 text-muted-foreground hover:border-muted-foreground/50",
                        )}
                      >
                        <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
                        <span className="hidden sm:inline">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section>
                <h2 className="text-sm font-semibold text-foreground">
                  Date and time
                </h2>
                <div className="mt-2 grid grid-cols-4 gap-1.5">
                  {DATE_TIME_OPTIONS.map((option) => {
                    const Icon = option.icon;
                    return (
                      <button
                        key={option.id}
                        type="button"
                        onClick={() => setDateTimeMode(option.id)}
                        aria-pressed={dateTimeMode === option.id}
                        className={cn(
                          "flex h-9 items-center justify-center gap-1 border px-1 text-xs font-medium transition-all active:scale-[0.98] sm:h-10 sm:gap-2 sm:px-2",
                          dateTimeMode === option.id
                            ? "border-primary bg-primary/5 text-foreground"
                            : "border-border bg-background/60 text-muted-foreground hover:border-muted-foreground/50",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        <span className="hidden sm:inline">{option.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              <section className="border border-dashed border-border bg-muted/25 p-2.5">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <p className="text-xs font-medium">Sticker tools coming next.</p>
                </div>
              </section>
            </div>
            </CardContent>
          </Card>
        </aside>

        <Card className="min-h-0 gap-0 bg-background/48 py-0 shadow-[0_22px_90px_rgba(15,23,42,0.09)] backdrop-blur-sm">
          <CardContent className="flex h-full min-h-0 flex-col items-center justify-center px-3 py-3 sm:px-5 sm:py-5">
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className={previewWidth}>
                <div
                  className="relative p-2 shadow-[0_26px_80px_rgba(15,23,42,0.16)] ring-1 ring-black/5 sm:p-4"
                  style={{ background: stripBackground }}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.38),transparent_34%,rgba(0,0,0,0.08))] mix-blend-soft-light" />
                  <div className="relative">{previewContent}</div>

                  {stamp && (
                    <div
                      className="relative mt-2 text-center font-mono text-[10px] font-semibold uppercase tracking-[0.16em] sm:mt-3 sm:text-[11px]"
                      style={{ color: stampColor }}
                    >
                      {stamp}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator className="my-3 w-full max-w-sm sm:my-4" />

            <div className="grid w-full max-w-sm gap-2 sm:grid-cols-2">
              <Button disabled className="h-9 sm:h-10">
                <Download className="h-4 w-4" />
                Print
              </Button>
              <Button disabled variant="outline" className="h-9 sm:h-10">
                Create GIF
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
