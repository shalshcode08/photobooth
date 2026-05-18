import Image from "next/image";
import { Check, Palette, Sparkles } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import {
  COLLAPSED_COLOR_COUNT,
  DATE_TIME_OPTIONS,
  PHOTO_SHAPES,
  STRIP_COLORS,
} from "../constants";
import { backgroundStyle } from "../lib/print-style";
import type {
  DateTimeMode,
  PhotoShape,
  PrintLayoutMeta,
  StripColor,
} from "../types";

type PrintSidebarProps = {
  layoutMeta: PrintLayoutMeta;
  selectedColor: StripColor;
  customColor: string;
  showAllColors: boolean;
  shape: PhotoShape;
  dateTimeMode: DateTimeMode;
  onColorChange: (color: StripColor) => void;
  onCustomColorChange: (color: string) => void;
  onShowAllColorsChange: (showAll: boolean) => void;
  onShapeChange: (shape: PhotoShape) => void;
  onDateTimeModeChange: (mode: DateTimeMode) => void;
};

export function PrintSidebar({
  layoutMeta,
  selectedColor,
  customColor,
  showAllColors,
  shape,
  dateTimeMode,
  onColorChange,
  onCustomColorChange,
  onShowAllColorsChange,
  onShapeChange,
  onDateTimeModeChange,
}: PrintSidebarProps) {
  const visibleStripColors = showAllColors
    ? STRIP_COLORS
    : STRIP_COLORS.slice(0, COLLAPSED_COLOR_COUNT);
  const hiddenColorCount = STRIP_COLORS.length - COLLAPSED_COLOR_COUNT;

  return (
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
            <StripColorControls
              customColor={customColor}
              hiddenColorCount={hiddenColorCount}
              selectedColor={selectedColor}
              showAllColors={showAllColors}
              visibleStripColors={visibleStripColors}
              onColorChange={onColorChange}
              onCustomColorChange={onCustomColorChange}
              onShowAllColorsChange={onShowAllColorsChange}
            />
            <ShapeControls selectedShape={shape} onShapeChange={onShapeChange} />
            <DateTimeControls
              selectedMode={dateTimeMode}
              onDateTimeModeChange={onDateTimeModeChange}
            />
            <StickerPlaceholder />
          </div>
        </CardContent>
      </Card>
    </aside>
  );
}

function StripColorControls({
  customColor,
  hiddenColorCount,
  selectedColor,
  showAllColors,
  visibleStripColors,
  onColorChange,
  onCustomColorChange,
  onShowAllColorsChange,
}: {
  customColor: string;
  hiddenColorCount: number;
  selectedColor: StripColor;
  showAllColors: boolean;
  visibleStripColors: StripColor[];
  onColorChange: (color: StripColor) => void;
  onCustomColorChange: (color: string) => void;
  onShowAllColorsChange: (showAll: boolean) => void;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground">Strip color</h2>
      <div className="mt-2 grid grid-cols-8 gap-2 sm:grid-cols-8 sm:gap-2.5">
        {visibleStripColors.map((color) => (
          <button
            key={color.id}
            type="button"
            onClick={() => onColorChange(color)}
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
            onChange={(event) => onCustomColorChange(event.target.value)}
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
          onClick={() => onShowAllColorsChange(!showAllColors)}
          className="mt-2 text-xs font-semibold text-primary transition-colors hover:text-primary/80"
        >
          {showAllColors ? "Show less" : "Show more"}
        </button>
      )}
    </section>
  );
}

function ShapeControls({
  selectedShape,
  onShapeChange,
}: {
  selectedShape: PhotoShape;
  onShapeChange: (shape: PhotoShape) => void;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground">Photo shape</h2>
      <div className="mt-2 grid grid-cols-5 gap-1.5">
        {PHOTO_SHAPES.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onShapeChange(option)}
              aria-pressed={selectedShape.id === option.id}
              className={cn(
                "flex h-11 flex-col items-center justify-center gap-1 border text-[10px] font-medium transition-all active:scale-[0.98] sm:h-14",
                selectedShape.id === option.id
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
  );
}

function DateTimeControls({
  selectedMode,
  onDateTimeModeChange,
}: {
  selectedMode: DateTimeMode;
  onDateTimeModeChange: (mode: DateTimeMode) => void;
}) {
  return (
    <section>
      <h2 className="text-sm font-semibold text-foreground">Date and time</h2>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {DATE_TIME_OPTIONS.map((option) => {
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => onDateTimeModeChange(option.id)}
              aria-pressed={selectedMode === option.id}
              className={cn(
                "flex h-9 items-center justify-center gap-1 border px-1 text-xs font-medium transition-all active:scale-[0.98] sm:h-10 sm:gap-2 sm:px-2",
                selectedMode === option.id
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
  );
}

function StickerPlaceholder() {
  return (
    <section className="border border-dashed border-border bg-muted/25 p-2.5">
      <div className="flex items-center gap-2.5 text-muted-foreground">
        <Sparkles className="h-4 w-4" />
        <p className="text-xs font-medium">Sticker tools coming next.</p>
      </div>
    </section>
  );
}
