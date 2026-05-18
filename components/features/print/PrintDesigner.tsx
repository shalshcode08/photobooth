"use client";

import { useState } from "react";
import { PHOTO_SHAPES, PRINT_LAYOUT_META, STRIP_COLORS } from "./constants";
import { PrintClipDefs } from "./components/PrintClipDefs";
import { PrintPreview } from "./components/PrintPreview";
import { PrintSidebar } from "./components/PrintSidebar";
import { useSelectedPhotos } from "./hooks/use-selected-photos";
import { formatStamp, isDarkBackground } from "./lib/print-style";
import type { DateTimeMode, PrintDesignerProps } from "./types";

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
  const [shape, setShape] = useState(PHOTO_SHAPES[0]);
  const [dateTimeMode, setDateTimeMode] = useState<DateTimeMode>("date");

  const stripBackground =
    selectedColor.id === "custom" ? customColor : selectedColor.value;
  const stripBackgroundSize =
    selectedColor.id === "custom" ? undefined : selectedColor.backgroundSize;
  const stamp = formatStamp(dateTimeMode, generatedAt);
  const stampColor = isDarkBackground(stripBackground)
    ? "rgba(255,255,255,0.78)"
    : "rgba(0,0,0,0.62)";

  return (
    <main className="print-page-surface h-dvh overflow-hidden">
      <PrintClipDefs />

      <div className="relative z-10 grid h-full w-full grid-cols-[minmax(10rem,0.95fr)_minmax(0,1.05fr)] gap-3 p-3 sm:grid-cols-[minmax(17rem,22rem)_minmax(0,1fr)] sm:gap-4 sm:p-4 lg:gap-6 lg:p-6">
        <PrintSidebar
          customColor={customColor}
          dateTimeMode={dateTimeMode}
          layoutMeta={layoutMeta}
          selectedColor={selectedColor}
          shape={shape}
          showAllColors={showAllColors}
          onColorChange={setSelectedColor}
          onCustomColorChange={(color) => {
            setCustomColor(color);
            setSelectedColor({
              id: "custom",
              label: "Custom",
              value: color,
            });
          }}
          onDateTimeModeChange={setDateTimeMode}
          onShapeChange={setShape}
          onShowAllColorsChange={setShowAllColors}
        />

        <PrintPreview
          layout={initialLayout}
          photos={stripPhotos}
          shape={shape}
          stamp={stamp}
          stampColor={stampColor}
          stripBackground={stripBackground}
          stripBackgroundSize={stripBackgroundSize}
        />
      </div>
    </main>
  );
}

export type { PrintDesignerProps, PrintLayoutId } from "./types";
