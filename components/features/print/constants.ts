import {
  AlignHorizontalJustifyCenter,
  ArrowDownLeft,
  ArrowDownRight,
  ArrowUpLeft,
  ArrowUpRight,
  CalendarDays,
  Circle,
  Clock3,
  Heart,
  PenLine,
  Square,
  Star,
  Type,
} from "lucide-react";
import type {
  DateTimeMode,
  PhotoShape,
  PrintLayoutId,
  PrintLayoutMeta,
  StampPosition,
  StampStyle,
  StripColor,
} from "./types";

export const PRINT_LAYOUT_META: Record<PrintLayoutId, PrintLayoutMeta> = {
  "strip-vertical": { label: "Classic Strip", photosUsed: 4 },
  "strip-horizontal": { label: "Wide Strip", photosUsed: 4 },
  "grid-mixed": { label: "Mixed Grid", photosUsed: 4 },
  polaroid: { label: "Single Polaroid", photosUsed: 1 },
  duo: { label: "Duo Stack", photosUsed: 2 },
};

export const STRIP_COLORS: StripColor[] = [
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

export const COLLAPSED_COLOR_COUNT = 23;

export const PHOTO_SHAPES: PhotoShape[] = [
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

export const DATE_TIME_OPTIONS: Array<{
  id: DateTimeMode;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { id: "none", label: "None", icon: CalendarDays },
  { id: "date", label: "Date", icon: CalendarDays },
  { id: "time", label: "Time", icon: Clock3 },
  { id: "both", label: "Both", icon: Clock3 },
];

export const STAMP_STYLE_OPTIONS: Array<{
  id: StampStyle;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { id: "printed", label: "Printed", icon: Type },
  { id: "handwritten", label: "Marker", icon: PenLine },
];

// Default stamp style per layout. Polaroids look most natural with a
// handwritten marker date in the bottom border — everything else gets the
// small printed caption to match the existing aesthetic.
export const DEFAULT_STAMP_STYLE: Record<PrintLayoutId, StampStyle> = {
  "strip-vertical": "printed",
  "strip-horizontal": "printed",
  "grid-mixed": "printed",
  polaroid: "handwritten",
  duo: "printed",
};

// Placement options for a handwritten polaroid stamp. "border" is the iconic
// bottom-white-space write; the four corners drop ink directly on the photo.
export const STAMP_POSITION_OPTIONS: Array<{
  id: StampPosition;
  label: string;
  icon: typeof CalendarDays;
}> = [
  { id: "border", label: "Border", icon: AlignHorizontalJustifyCenter },
  { id: "photo-top-left", label: "Top left", icon: ArrowUpLeft },
  { id: "photo-top-right", label: "Top right", icon: ArrowUpRight },
  { id: "photo-bottom-left", label: "Bottom left", icon: ArrowDownLeft },
  { id: "photo-bottom-right", label: "Bottom right", icon: ArrowDownRight },
];

export const DEFAULT_STAMP_POSITION: StampPosition = "border";
