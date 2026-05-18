import type { CSSProperties } from "react";
import type { DateTimeMode } from "../types";

export function formatStamp(mode: DateTimeMode, generatedAt: string) {
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

export function isDarkBackground(background: string) {
  const hexes = background.match(/#[0-9a-f]{6}/gi);
  if (!hexes?.length) return false;

  const average =
    hexes.reduce((sum, hex) => sum + luminanceFromHex(hex), 0) / hexes.length;
  return average < 0.42;
}

// Saturated "ink" tone for handwritten stamps. Slightly more opaque and more
// pigmented than the printed-text color so the marker reads clearly on top of
// patterned strip backgrounds.
export function handwrittenInkColor(background: string) {
  return isDarkBackground(background)
    ? "rgba(250, 245, 230, 0.92)" // warm cream marker on dark strips
    : "rgba(20, 28, 50, 0.88)";   // dark navy marker on light strips
}

export function backgroundStyle(
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

function luminanceFromHex(hex: string) {
  const value = Number.parseInt(hex.replace("#", ""), 16);
  const r = ((value >> 16) & 255) / 255;
  const g = ((value >> 8) & 255) / 255;
  const b = (value & 255) / 255;
  const channel = (c: number) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);

  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
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
