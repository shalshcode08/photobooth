import type { ComponentType, CSSProperties } from "react";

export type StripColor = {
  id: string;
  label: string;
  value: string;
  backgroundSize?: string;
};

export type PhotoShape = {
  id: "none" | "star" | "heart" | "rounded" | "circle";
  label: string;
  icon: ComponentType<{ className?: string }>;
  style?: CSSProperties;
  frameClassName?: string;
};

export type DateTimeMode = "none" | "date" | "time" | "both";

// How the date/time stamp is rendered on the print:
//   - "printed":      small machine-printed monospace caption below the photos
//   - "handwritten":  marker-style script. On polaroid layouts the stamp is
//                     embedded inside the bottom white border (iconic look);
//                     on other layouts it replaces the printed caption.
export type StampStyle = "printed" | "handwritten";

// Where a handwritten stamp sits on a polaroid. "border" is the classic
// bottom-white-space placement; the four "photo-*" corners drop the marker
// directly onto the photo, like notes scribbled on a real polaroid.
export type StampPosition =
  | "border"
  | "photo-top-left"
  | "photo-top-right"
  | "photo-bottom-left"
  | "photo-bottom-right";

export type PrintLayoutId =
  | "strip-vertical"
  | "strip-horizontal"
  | "grid-mixed"
  | "polaroid"
  | "duo";

export type PrintLayoutMeta = {
  label: string;
  photosUsed: number;
};

export type PrintDesignerProps = {
  initialLayout: PrintLayoutId;
  initialPhotoIndices: number[];
  generatedAt: string;
};
