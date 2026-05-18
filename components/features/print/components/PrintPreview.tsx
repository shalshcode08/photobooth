import { Download, Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { backgroundStyle } from "../lib/print-style";
import type { PhotoShape, PrintLayoutId } from "../types";

type PrintPreviewProps = {
  layout: PrintLayoutId;
  photos: Array<string | null>;
  shape: PhotoShape;
  stamp: string;
  stampColor: string;
  stripBackground: string;
  stripBackgroundSize?: string;
};

export function PrintPreview({
  layout,
  photos,
  shape,
  stamp,
  stampColor,
  stripBackground,
  stripBackgroundSize,
}: PrintPreviewProps) {
  // Each layout is scaled so its natural aspect ratio fills the canvas height
  // similarly to the vertical strip (which already looked correctly sized).
  // Wide layouts (strip-horizontal, grid-mixed) take the full canvas width and
  // are capped via height-based units so very tall canvases don't overflow.
  // Portrait layouts (polaroid, duo, vertical) are sized in viewport-height
  // units so they grow with the canvas.
  const previewWidth = cn(
    "relative max-w-full",
    layout === "strip-horizontal" && "w-full",
    layout === "grid-mixed" && "w-full max-w-[min(100%,82dvh)]",
    layout === "polaroid" && "w-[clamp(13rem,58dvh,28rem)]",
    layout === "duo" && "w-[clamp(11rem,46dvh,20rem)]",
    layout === "strip-vertical" && "w-[clamp(9rem,27dvh,15rem)]",
  );

  return (
    <Card className="print-canvas-grid relative min-h-0 gap-0 overflow-hidden bg-background/48 py-0 shadow-[0_22px_90px_rgba(15,23,42,0.09)] backdrop-blur-sm">
      <div className="absolute right-3 top-3 z-20 flex gap-2 sm:right-5 sm:top-5">
        <Button disabled size="sm" className="h-8 px-3 sm:h-9">
          <Download className="h-4 w-4" />
          Print
        </Button>
        <Button disabled size="sm" variant="outline" className="h-8 px-3 sm:h-9">
          <Film className="h-4 w-4" />
          Create GIF
        </Button>
      </div>

      <CardContent className="relative z-10 flex h-full min-h-0 flex-col items-center justify-center px-3 py-3 sm:px-5 sm:py-5">
        <div className="flex min-h-0 w-full flex-1 items-center justify-center">
          <div className={previewWidth}>
            <div
              className="relative w-full min-w-0 p-1.5 shadow-[0_26px_80px_rgba(15,23,42,0.16)] ring-1 ring-black/5 sm:p-3"
              style={backgroundStyle(stripBackground, stripBackgroundSize)}
            >
              <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(255,255,255,0.38),transparent_34%,rgba(0,0,0,0.08))] mix-blend-soft-light" />
              <div className="relative">
                <PreviewLayout layout={layout} photos={photos} shape={shape} />
              </div>

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
  );
}

function PreviewLayout({
  layout,
  photos,
  shape,
}: {
  layout: PrintLayoutId;
  photos: Array<string | null>;
  shape: PhotoShape;
}) {
  if (layout === "strip-horizontal") {
    return (
      <div className="grid w-full grid-cols-4 items-stretch gap-2">
        {photos.map((src, index) => renderPhoto(src, index, shape))}
      </div>
    );
  }

  if (layout === "grid-mixed") {
    return (
      <div className="grid aspect-[1.28/1] w-full grid-cols-3 grid-rows-2 items-stretch gap-2">
        {renderPhoto(photos[0] ?? null, 0, shape, "h-full")}
        {renderPhoto(photos[1] ?? null, 1, shape, "col-span-2 h-full")}
        {renderPhoto(photos[2] ?? null, 2, shape, "col-span-2 h-full")}
        {renderPhoto(photos[3] ?? null, 3, shape, "h-full")}
      </div>
    );
  }

  if (layout === "polaroid") {
    return (
      <div className="grid w-full grid-cols-1 pb-10">
        {renderPhoto(photos[0] ?? null, 0, shape)}
      </div>
    );
  }

  return (
    <div className="grid w-full grid-cols-1 items-stretch gap-2">
      {photos.map((src, index) => renderPhoto(src, index, shape))}
    </div>
  );
}

function renderPhoto(
  src: string | null,
  index: number,
  shape: PhotoShape,
  className?: string,
) {
  return (
    <div
      key={index}
      className={cn(
        "relative w-full overflow-hidden",
        className ?? "aspect-[4/3]",
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
}
