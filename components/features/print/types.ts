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
