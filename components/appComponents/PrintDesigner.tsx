"use client";

import Image from "next/image";
import {
  CalendarDays,
  Check,
  Circle,
  Clock3,
  Download,
  Heart,
  Palette,
  Sparkles,
  Square,
  Star,
} from "lucide-react";
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
  backgroundSize?: string;
};

type PhotoShape = {
  id: "none" | "star" | "heart" | "rounded" | "circle";
  label: string;
  icon: ComponentType<{ className?: string }>;
  style?: CSSProperties;
  frameClassName?: string;
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
  {
    id: "retro-sunburst",
    label: "Retro Sunburst",
    value:
      "repeating-conic-gradient(from -18deg at 50% 50%, rgba(255,255,255,.34) 0 9deg, transparent 9deg 18deg), linear-gradient(135deg, #f97316, #facc15)",
  },
  {
    id: "diner-tile",
    label: "Diner Tile",
    value:
      "conic-gradient(from 90deg, #ef4444 25%, #fff7ed 0 50%, #ef4444 0 75%, #fff7ed 0)",
    backgroundSize: "10px 10px",
  },
  {
    id: "arcade-grid",
    label: "Arcade Grid",
    value:
      "linear-gradient(rgba(34,211,238,.32) 1px, transparent 1px), linear-gradient(90deg, rgba(236,72,153,.28) 1px, transparent 1px), linear-gradient(135deg, #111827, #312e81)",
    backgroundSize: "9px 9px, 9px 9px, auto",
  },
  {
    id: "cassette",
    label: "Cassette",
    value:
      "repeating-linear-gradient(90deg, #f8fafc 0 9px, #f59e0b 9px 12px, #0f766e 12px 15px, #be123c 15px 18px, #f8fafc 18px 27px)",
  },
  {
    id: "mod-dot",
    label: "Mod Dot",
    value:
      "radial-gradient(circle, rgba(255,255,255,.84) 0 3px, transparent 3.5px), linear-gradient(135deg, #2563eb, #f97316)",
    backgroundSize: "12px 12px, auto",
  },
  {
    id: "record-groove",
    label: "Record Groove",
    value:
      "repeating-radial-gradient(circle at 50% 50%, rgba(255,255,255,.28) 0 1px, transparent 1px 5px), radial-gradient(circle at 50% 50%, rgba(251,191,36,.34) 0 5px, transparent 6px), linear-gradient(135deg, #18181b, #7c2d12)",
  },
  {
    id: "groovy-wave",
    label: "Groovy Wave",
    value:
      "radial-gradient(ellipse at 20% 30%, rgba(250,204,21,.82) 0 18%, transparent 19%), radial-gradient(ellipse at 78% 70%, rgba(20,184,166,.76) 0 20%, transparent 21%), linear-gradient(135deg, #fb7185, #7c3aed)",
  },
  {
    id: "photo-booth",
    label: "Photo Booth",
    value:
      "repeating-linear-gradient(0deg, rgba(255,255,255,.3) 0 3px, transparent 3px 12px), linear-gradient(135deg, #991b1b, #111827)",
  },
  {
    id: "retro-plaid",
    label: "Retro Plaid",
    value:
      "repeating-linear-gradient(0deg, rgba(255,255,255,.28) 0 2px, transparent 2px 12px), repeating-linear-gradient(90deg, rgba(17,24,39,.18) 0 2px, transparent 2px 12px), linear-gradient(135deg, #f97316, #fde68a)",
    backgroundSize: "auto",
  },
  {
    id: "halftone-pop",
    label: "Halftone Pop",
    value:
      "radial-gradient(circle, rgba(255,255,255,.72) 0 2.5px, transparent 3px), linear-gradient(135deg, #db2777, #f97316)",
    backgroundSize: "9px 9px, auto",
  },
  {
    id: "tape-wave",
    label: "Tape Wave",
    value:
      "repeating-linear-gradient(135deg, transparent 0 7px, rgba(255,255,255,.24) 7px 9px, transparent 9px 16px), linear-gradient(135deg, #0f766e, #f59e0b 48%, #be123c)",
  },
  {
    id: "jukebox",
    label: "Jukebox",
    value:
      "radial-gradient(circle at 24% 28%, rgba(255,255,255,.7) 0 4px, transparent 4.5px), radial-gradient(circle at 76% 72%, rgba(250,204,21,.72) 0 5px, transparent 5.5px), linear-gradient(135deg, #1d4ed8, #ec4899)",
  },
  {
    id: "linen",
    label: "Linen",
    value:
      "linear-gradient(0deg, rgba(15,23,42,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(15,23,42,.08) 1px, transparent 1px), #f8f1df",
    backgroundSize: "8px 8px",
  },
  {
    id: "porcelain",
    label: "Porcelain",
    value:
      "linear-gradient(135deg, rgba(37,99,235,.28) 1px, transparent 1px), linear-gradient(45deg, rgba(20,184,166,.22) 1px, transparent 1px), #f8fbff",
    backgroundSize: "10px 10px",
  },
  {
    id: "pinstripe",
    label: "Pinstripe",
    value:
      "repeating-linear-gradient(135deg, #fff7f7 0 9px, rgba(244,63,94,.24) 9px 11px, #fff7f7 11px 20px)",
  },
  {
    id: "terrazzo",
    label: "Terrazzo",
    value:
      "radial-gradient(circle at 18% 22%, #f97316 0 2px, transparent 2.5px), radial-gradient(circle at 64% 28%, #2563eb 0 1.7px, transparent 2.2px), radial-gradient(circle at 80% 70%, #14b8a6 0 2px, transparent 2.5px), radial-gradient(circle at 32% 78%, #db2777 0 1.7px, transparent 2.2px), #fff7ed",
  },
  {
    id: "sage-dot",
    label: "Sage Dot",
    value:
      "radial-gradient(circle, rgba(22,101,52,.3) 0 1.7px, transparent 2.2px), linear-gradient(135deg, #dcfce7, #ccfbf1)",
    backgroundSize: "9px 9px, auto",
  },
  {
    id: "noir-dot",
    label: "Noir Dot",
    value:
      "radial-gradient(circle, rgba(255,255,255,.3) 0 1.4px, transparent 2px), linear-gradient(135deg, #18181b, #3f3f46)",
    backgroundSize: "9px 9px, auto",
  },
  {
    id: "bloom",
    label: "Bloom",
    value:
      "radial-gradient(circle at 25% 30%, #fbbf24 0 2px, transparent 2.5px), radial-gradient(circle at 25% 30%, rgba(255,255,255,.9) 0 7px, transparent 7.5px), radial-gradient(circle at 74% 66%, #fbbf24 0 2px, transparent 2.5px), radial-gradient(circle at 74% 66%, rgba(255,255,255,.9) 0 7px, transparent 7.5px), linear-gradient(135deg, #bbf7d0, #99f6e4)",
  },
  { id: "cotton", label: "Cotton Candy", value: "linear-gradient(135deg, #f0abfc, #93c5fd 48%, #a7f3d0)" },
  { id: "citrus", label: "Citrus", value: "linear-gradient(135deg, #fef08a, #fb923c 52%, #ef4444)" },
  { id: "aurora", label: "Aurora", value: "linear-gradient(135deg, #22c55e, #14b8a6 45%, #6366f1)" },
  { id: "berry", label: "Berry", value: "linear-gradient(135deg, #7f1d1d, #db2777 45%, #f9a8d4)" },
  { id: "chrome", label: "Chrome", value: "linear-gradient(135deg, #f8fafc, #94a3b8 48%, #1f2937)" },
  {
    id: "blueprint",
    label: "Blueprint",
    value:
      "linear-gradient(rgba(255,255,255,.16) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.16) 1px, transparent 1px), linear-gradient(135deg, #1d4ed8, #0f766e)",
    backgroundSize: "11px 11px, 11px 11px, auto",
  },
  {
    id: "sun-wash",
    label: "Sun Wash",
    value:
      "radial-gradient(circle at 22% 28%, rgba(255,255,255,.72) 0 8px, transparent 9px), radial-gradient(circle at 78% 72%, rgba(255,255,255,.42) 0 10px, transparent 11px), linear-gradient(135deg, #fde68a, #fb7185)",
  },
  {
    id: "graphite",
    label: "Graphite",
    value:
      "linear-gradient(135deg, rgba(255,255,255,.32) 1px, transparent 1px), linear-gradient(45deg, rgba(255,255,255,.13) 1px, transparent 1px), linear-gradient(135deg, #111827, #475569)",
    backgroundSize: "9px 9px, 9px 9px, auto",
  },
  {
    id: "rose-paper",
    label: "Rose Paper",
    value:
      "linear-gradient(0deg, rgba(190,18,60,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(190,18,60,.09) 1px, transparent 1px), #fff1f2",
    backgroundSize: "8px 8px",
  },
];

const COLLAPSED_COLOR_COUNT = 23;

const PHOTO_SHAPES: PhotoShape[] = [
  { id: "none", label: "None", icon: Square },
  {
    id: "star",
    label: "Star",
    icon: Star,
    frameClassName: "absolute inset-0 overflow-hidden",
    style: {
      clipPath: "url(#print-star-clip)",
      WebkitClipPath: "url(#print-star-clip)",
    },
  },
  {
    id: "heart",
    label: "Heart",
    icon: Heart,
    frameClassName: "absolute inset-0 overflow-hidden",
    style: {
      clipPath: "url(#print-heart-clip)",
      WebkitClipPath: "url(#print-heart-clip)",
    },
  },
  {
    id: "rounded",
    label: "Rounded",
    icon: Square,
    frameClassName: "absolute inset-0 overflow-hidden",
    style: { borderRadius: "0.55rem" },
  },
  {
    id: "circle",
    label: "Circle",
    icon: Circle,
    frameClassName:
      "absolute left-1/2 top-1/2 aspect-square h-full -translate-x-1/2 -translate-y-1/2 overflow-hidden",
    style: {
      clipPath: "circle(50% at 50% 50%)",
      WebkitClipPath: "circle(50% at 50% 50%)",
    },
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

function splitBackgroundLayers(background: string) {
  if (background.startsWith("#")) {
    return { backgroundColor: background, backgroundImage: "none" };
  }

  const layers: string[] = [];
  let depth = 0;
  let start = 0;

  for (let index = 0; index < background.length; index += 1) {
    const char = background[index];

    if (char === "(") depth += 1;
    if (char === ")") depth -= 1;

    if (char === "," && depth === 0) {
      layers.push(background.slice(start, index).trim());
      start = index + 1;
    }
  }

  layers.push(background.slice(start).trim());

  const lastLayer = layers.at(-1) ?? "";
  const hasColorLayer = /^#[0-9a-f]{3,8}$/i.test(lastLayer);

  return {
    backgroundColor: hasColorLayer ? lastLayer : "transparent",
    backgroundImage: (hasColorLayer ? layers.slice(0, -1) : layers).join(", "),
  };
}

function backgroundStyle(
  background: string,
  backgroundSize?: string,
): CSSProperties {
  const { backgroundColor, backgroundImage } = splitBackgroundLayers(background);

  return {
    backgroundColor,
    backgroundImage: backgroundImage || "none",
    backgroundSize: backgroundSize ?? "auto",
  };
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
  const [showAllColors, setShowAllColors] = useState(false);
  const [shape, setShape] = useState<PhotoShape>(PHOTO_SHAPES[0]);
  const [dateTimeMode, setDateTimeMode] = useState<DateTimeMode>("date");
  const stamp = formatStamp(dateTimeMode, generatedAt);
  const stripBackground =
    selectedColor.id === "custom" ? customColor : selectedColor.value;
  const stripBackgroundSize =
    selectedColor.id === "custom" ? undefined : selectedColor.backgroundSize;
  const visibleStripColors = showAllColors
    ? STRIP_COLORS
    : STRIP_COLORS.slice(0, COLLAPSED_COLOR_COUNT);
  const hiddenColorCount = STRIP_COLORS.length - COLLAPSED_COLOR_COUNT;
  const darkStrip = isDarkBackground(stripBackground);
  const stampColor = darkStrip
    ? "rgba(255,255,255,0.78)"
    : "rgba(0,0,0,0.62)";

  const renderPhoto = (src: string | null, index: number) => (
    <div
      key={index}
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden",
        shape.id === "none"
          ? "bg-white/85 shadow-inner ring-1 ring-black/10"
          : "bg-transparent",
      )}
    >
      {src ? (
        <div
          className={shape.frameClassName ?? "absolute inset-0 overflow-hidden"}
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
        <div className="grid w-full grid-cols-4 items-stretch gap-2">
          {stripPhotos.map(renderPhoto)}
        </div>
      );
    }

    if (initialLayout === "grid-mixed") {
      return (
        <div className="grid w-full grid-cols-2 items-stretch gap-2">
          {stripPhotos.map(renderPhoto)}
        </div>
      );
    }

    if (initialLayout === "polaroid") {
      return (
        <div className="grid w-full grid-cols-1 pb-10">
          {renderPhoto(stripPhotos[0] ?? null, 0)}
        </div>
      );
    }

    return (
      <div className="grid w-full grid-cols-1 items-stretch gap-2">
        {stripPhotos.map(renderPhoto)}
      </div>
    );
  })();

  const previewWidth = cn(
    "relative max-w-full",
    initialLayout === "strip-horizontal" && "w-[min(100%,36rem)]",
    initialLayout === "grid-mixed" && "w-[min(100%,30rem)]",
    initialLayout === "polaroid" && "w-[clamp(11rem,31dvh,18rem)]",
    initialLayout === "duo" && "w-[clamp(9rem,29dvh,15rem)]",
    initialLayout === "strip-vertical" && "w-[clamp(9rem,27dvh,15rem)]",
  );

  return (
    <main className="print-page-surface h-dvh overflow-hidden">
      <svg className="absolute h-0 w-0" aria-hidden="true">
        <defs>
          <clipPath id="print-star-clip" clipPathUnits="objectBoundingBox">
            <path d="M .5 .02 L .62 .32 L .98 .32 L .69 .52 L .82 .90 L .5 .66 L .18 .90 L .31 .52 L .02 .32 L .38 .32 Z" />
          </clipPath>
          <clipPath id="print-heart-clip" clipPathUnits="objectBoundingBox">
            <path d="M .5 .96 C .36 .82 .06 .58 .04 .30 C .02 .10 .17 .01 .34 .01 C .43 .01 .49 .07 .5 .16 C .51 .07 .57 .01 .66 .01 C .83 .01 .98 .10 .96 .30 C .94 .58 .64 .82 .5 .96 Z" />
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
                <div className="mt-2 grid grid-cols-8 gap-2 sm:grid-cols-8 sm:gap-2.5">
                  {visibleStripColors.map((color) => (
                    <button
                      key={color.id}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      aria-label={`Choose ${color.label}`}
                      aria-pressed={selectedColor.id === color.id}
                      className={cn(
                        "group grid h-7 w-7 place-items-center rounded-full p-0 transition-all active:scale-95 sm:h-8 sm:w-8",
                        selectedColor.id === color.id
                          ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                          : "hover:scale-105",
                      )}
                    >
                      <span
                        className="relative block h-full w-full overflow-hidden rounded-full shadow-[inset_0_0_0_1px_rgba(0,0,0,0.05),0_2px_7px_rgba(15,23,42,0.12)]"
                        style={backgroundStyle(color.value, color.backgroundSize)}
                      >
                        {selectedColor.id === color.id && (
                          <span className="absolute inset-0 grid place-items-center bg-black/18 text-white drop-shadow">
                            <Check className="h-3.5 w-3.5" />
                          </span>
                        )}
                      </span>
                    </button>
                  ))}
                  <label
                    className={cn(
                      "group relative grid h-7 w-7 cursor-pointer place-items-center rounded-full bg-[conic-gradient(from_90deg,#ef4444,#f59e0b,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ef4444)] p-[2px] transition-all active:scale-95 sm:h-8 sm:w-8",
                      selectedColor.id === "custom"
                        ? "ring-2 ring-primary ring-offset-2 ring-offset-background"
                        : "hover:scale-105",
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
                      className="grid h-full w-full place-items-center rounded-full shadow-[inset_0_0_0_1px_rgba(255,255,255,0.68),0_2px_7px_rgba(15,23,42,0.12)]"
                      style={backgroundStyle(customColor)}
                    >
                      {selectedColor.id === "custom" ? (
                        <Check className="h-3.5 w-3.5 text-white drop-shadow" />
                      ) : (
                        <Palette className="h-3.5 w-3.5 text-white drop-shadow" />
                      )}
                    </span>
                  </label>
                </div>
                {hiddenColorCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowAllColors((current) => !current)}
                    className="mt-2 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
                  >
                    {showAllColors ? "Show less" : "Show more"}
                  </button>
                )}
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

        <Card className="relative min-h-0 gap-0 bg-background/48 py-0 shadow-[0_22px_90px_rgba(15,23,42,0.09)] backdrop-blur-sm">
          <div className="absolute right-3 top-3 z-20 flex gap-2 sm:right-5 sm:top-5">
            <Button disabled size="sm" className="h-8 px-3 sm:h-9">
              <Download className="h-4 w-4" />
              Print
            </Button>
            <Button disabled size="sm" variant="outline" className="h-8 px-3 sm:h-9">
              Create GIF
            </Button>
          </div>
          <CardContent className="flex h-full min-h-0 flex-col items-center justify-center px-3 py-3 sm:px-5 sm:py-5">
            <div className="flex min-h-0 flex-1 items-center justify-center">
              <div className={previewWidth}>
                <div
                  className="relative w-full min-w-0 p-1.5 shadow-[0_26px_80px_rgba(15,23,42,0.16)] ring-1 ring-black/5 sm:p-3"
                  style={backgroundStyle(stripBackground, stripBackgroundSize)}
                >
                  <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.38),transparent_34%,rgba(0,0,0,0.08))] mix-blend-soft-light" />
                  <div className="relative">{previewContent}</div>

                  {stamp && (
                    <div className="relative mt-2 h-4 overflow-hidden sm:mt-3 sm:h-5">
                      <div
                        className="absolute inset-0 flex min-w-0 items-center justify-center overflow-hidden whitespace-nowrap text-center font-mono text-[9px] font-semibold uppercase leading-none tracking-[0.08em] sm:text-[10px]"
                        style={{ color: stampColor }}
                      >
                        {stamp}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
