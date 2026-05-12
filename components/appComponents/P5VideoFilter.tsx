"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type p5Type from "p5";
import type { FilterDef, StampVariant } from "@/lib/filters";

export interface P5FilterHandle {
  getCanvas: () => HTMLCanvasElement | null;
}

interface Props {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  filter: FilterDef;
  active: boolean;
}

// ── One-time grain texture ─────────────────────────────────────────────────────
// Generates a 512×512 grayscale noise canvas. A 0.6px blur is applied so the
// grain clusters slightly — matching silver-halide crystal clumping vs harsh
// per-pixel digital noise. Reused every frame via soft-light composite.
function makeGrainCanvas(size = 512): HTMLCanvasElement {
  const raw = document.createElement("canvas");
  raw.width = raw.height = size;
  const rCtx = raw.getContext("2d")!;
  const img  = rCtx.createImageData(size, size);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = (Math.random() * 255) | 0;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  rCtx.putImageData(img, 0, 0);

  const out  = document.createElement("canvas");
  out.width  = out.height = size;
  const oCtx = out.getContext("2d")!;
  oCtx.filter = "blur(0.6px)";   // organic clumping — bypassed by putImageData so we draw
  oCtx.drawImage(raw, 0, 0);
  return out;
}

// ── Pixel-level colour grade ───────────────────────────────────────────────────
// All arithmetic in float [0,1] — prevents overflow that causes glow artifacts.
// LUT lookup normalises to [0,1]; saturation and split-toning stay in that space.
function processPixels(pixels: Uint8ClampedArray, f: FilterDef): void {
  const { lutR, lutG, lutB, saturation, shadowTint, highlightTint } = f;
  const [stR, stG, stB] = shadowTint;
  const [htR, htG, htB] = highlightTint;
  const hasTone = stR !== 0 || stG !== 0 || stB !== 0 || htR !== 0 || htG !== 0 || htB !== 0;
  const hasSat  = saturation !== 1;

  for (let i = 0; i < pixels.length; i += 4) {
    let r = lutR[pixels[i]]     / 255;
    let g = lutG[pixels[i + 1]] / 255;
    let b = lutB[pixels[i + 2]] / 255;

    // Luminance-preserving saturation (Rec.709 weights)
    if (hasSat) {
      const lum = r * 0.2126 + g * 0.7152 + b * 0.0722;
      r = lum + (r - lum) * saturation;
      g = lum + (g - lum) * saturation;
      b = lum + (b - lum) * saturation;
    }

    // Split toning — operates on post-saturation luma so masks are accurate
    if (hasTone) {
      const lum = r * 0.2126 + g * 0.7152 + b * 0.0722;
      const sm = lum < 0.5 ? 1 - lum * 2 : 0;   // 1 at black → 0 at mid
      const hm = lum > 0.5 ? lum * 2 - 1 : 0;   // 0 at mid → 1 at white
      r += stR * sm + htR * hm;
      g += stG * sm + htG * hm;
      b += stB * sm + htB * hm;
    }

    pixels[i]     = r < 0 ? 0 : r > 1 ? 255 : (r * 255 + 0.5) | 0;
    pixels[i + 1] = g < 0 ? 0 : g > 1 ? 255 : (g * 255 + 0.5) | 0;
    pixels[i + 2] = b < 0 ? 0 : b > 1 ? 255 : (b * 255 + 0.5) | 0;
  }
}

// ── Light leak shapes ─────────────────────────────────────────────────────────
// Each variant mimics a real physical failure mode of 35mm cameras.
function drawLightLeak(
  ctx:     CanvasRenderingContext2D,
  cw:      number,
  ch:      number,
  variant: 0|1|2|3|4,
  intens:  number,
): void {
  if (intens <= 0 || variant === 0) return;
  switch (variant) {
    case 1: {
      // Top-right corner bloom — light entering through film canister seam
      const g = ctx.createRadialGradient(cw, 0, 0, cw * 0.55, ch * 0.14, cw * 1.05);
      g.addColorStop(0,    `rgba(255,118,18,${(intens * 0.90).toFixed(2)})`);
      g.addColorStop(0.22, `rgba(255,82,8,${(intens  * 0.55).toFixed(2)})`);
      g.addColorStop(0.60, `rgba(200,48,0,${(intens  * 0.18).toFixed(2)})`);
      g.addColorStop(1,    "rgba(150,28,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
      break;
    }
    case 2: {
      // Left-edge vertical band — sprocket-hole bleed along film perforations
      const g = ctx.createLinearGradient(0, 0, cw * 0.44, 0);
      g.addColorStop(0,    `rgba(255,150,28,${(intens * 0.82).toFixed(2)})`);
      g.addColorStop(0.11, `rgba(255,105,12,${(intens * 0.52).toFixed(2)})`);
      g.addColorStop(0.44, "rgba(200,58,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
      break;
    }
    case 3: {
      // Bottom strip — camera back cracked while rewinding
      const g = ctx.createLinearGradient(0, ch, 0, ch * 0.58);
      g.addColorStop(0,    `rgba(255,162,38,${(intens * 0.74).toFixed(2)})`);
      g.addColorStop(0.18, `rgba(255,98,8,${(intens  * 0.40).toFixed(2)})`);
      g.addColorStop(0.50, "rgba(200,58,0,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, cw, ch);
      break;
    }
    case 4: {
      // Double leak — top-left AND bottom-right (Lomo spring-loaded back)
      const g1 = ctx.createRadialGradient(0, 0, 0, cw * 0.20, ch * 0.20, cw * 0.82);
      g1.addColorStop(0,   `rgba(255,112,18,${(intens * 0.72).toFixed(2)})`);
      g1.addColorStop(0.4, `rgba(200,62,0,${(intens  * 0.24).toFixed(2)})`);
      g1.addColorStop(1,   "rgba(150,28,0,0)");
      ctx.fillStyle = g1;
      ctx.fillRect(0, 0, cw, ch);

      const g2 = ctx.createRadialGradient(cw, ch, 0, cw * 0.80, ch * 0.80, cw * 0.82);
      g2.addColorStop(0,   `rgba(255,88,8,${(intens  * 0.58).toFixed(2)})`);
      g2.addColorStop(0.4, `rgba(200,48,0,${(intens  * 0.18).toFixed(2)})`);
      g2.addColorStop(1,   "rgba(150,18,0,0)");
      ctx.fillStyle = g2;
      ctx.fillRect(0, 0, cw, ch);
      break;
    }
  }
}

// ── Timestamp overlays — 9 distinct styles, one per film stock ───────────────
// Each variant matches the aesthetic of its filter:
//  1 amber LED    → disposable cam incandescent projector
//  2 red LED      → Kodak red LED module, bottom-left
//  3 white clean  → Fuji Superia minimal monospace, bottom-left
//  4 cyan neon    → cross-process acid glow, top-right
//  5 faded red    → expired dye, barely legible, bottom-right
//  6 year large   → Lomo 'YY only, top-left, bold white
//  7 soft script  → Polaroid handwritten feel, bottom-center
//  8 timecode     → Cinestill cinema edge code, bottom-center
//  9 frame info   → Tri-X photojournalism frame counter, top-left
// ── Physical Analog Borders ───────────────────────────────────────────────────
function drawFilmBorder(
  ctx:     CanvasRenderingContext2D,
  cw:      number,
  ch:      number,
  variant: 0|1|2|3 | undefined,
): void {
  if (!variant) return;
  ctx.save();
  switch (variant) {
    case 1: {
      // ── 1 Classic Analog Scan Border ──
      // Off-white outer frame with a rich black inner border
      const outerThick = Math.round(cw * 0.04);
      const innerThick = Math.round(cw * 0.006);

      ctx.fillStyle = "rgba(248, 246, 240, 0.98)";
      ctx.fillRect(0, 0, cw, outerThick);
      ctx.fillRect(0, ch - outerThick, cw, outerThick);
      ctx.fillRect(0, 0, outerThick, ch);
      ctx.fillRect(cw - outerThick, 0, outerThick, ch);

      ctx.strokeStyle = "rgba(18, 18, 18, 0.95)";
      ctx.lineWidth = innerThick;
      ctx.strokeRect(
        outerThick - innerThick / 2,
        outerThick - innerThick / 2,
        cw - outerThick * 2 + innerThick,
        ch - outerThick * 2 + innerThick,
      );
      break;
    }
    case 2: {
      // ── 2 Polaroid Instant Frame ──
      // Off-white classic frame: thin top/sides, thick bottom
      const sideThick = Math.round(cw * 0.05);
      const topThick  = Math.round(cw * 0.05);
      const botThick  = Math.round(ch * 0.22);

      ctx.fillStyle = "rgba(250, 249, 246, 0.99)";
      ctx.fillRect(0, 0, cw, topThick);
      ctx.fillRect(0, ch - botThick, cw, botThick);
      ctx.fillRect(0, 0, sideThick, ch);
      ctx.fillRect(cw - sideThick, 0, sideThick, ch);

      ctx.strokeStyle = "rgba(0,0,0,0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(
        sideThick,
        topThick,
        cw - sideThick * 2,
        ch - topThick - botThick,
      );
      break;
    }
    case 3: {
      // ── 3 90s Letterbox / Cinema Strip ──
      // Sleek black top/bottom bars with analog edge codes
      const barThick = Math.round(ch * 0.10);
      ctx.fillStyle = "rgba(10, 10, 10, 0.98)";
      ctx.fillRect(0, 0, cw, barThick);
      ctx.fillRect(0, ch - barThick, cw, barThick);

      ctx.fillStyle = "rgba(255, 170, 0, 0.7)";
      ctx.font = `bold ${Math.round(barThick * 0.3)}px monospace`;
      ctx.textAlign = "left";
      ctx.fillText("KODAK 5053 TMY", cw * 0.05, barThick * 0.65);
      ctx.textAlign = "right";
      ctx.fillText("▶ 24A", cw * 0.95, ch - barThick * 0.35);
      break;
    }
  }
  ctx.restore();
}

function drawStamp(
  ctx:     CanvasRenderingContext2D,
  cw:      number,
  ch:      number,
  variant: StampVariant,
  borderVariant?: 0|1|2|3,
): void {
  if (variant === 0) return;

  const now    = new Date();
  const yy     = String(now.getFullYear()).slice(-2);
  const mm     = String(now.getMonth() + 1).padStart(2, "0");
  const dd     = String(now.getDate()).padStart(2, "0");
  const hh     = String(now.getHours()).padStart(2, "0");
  const mi     = String(now.getMinutes()).padStart(2, "0");
  const ss     = String(now.getSeconds()).padStart(2, "0");
  const ff     = String(((now.getMilliseconds() / 33.33) | 0)).padStart(2, "0");
  const MONTHS = ["JAN","FEB","MAR","APR","MAY","JUN","JUL","AUG","SEP","OCT","NOV","DEC"];

  let m = Math.round(cw * 0.022);
  if (borderVariant === 1) m += Math.round(cw * 0.046);
  else if (borderVariant === 2) m += Math.round(cw * 0.055);
  else if (borderVariant === 3) m += Math.round(ch * 0.11);

  const sz  = Math.round(cw * 0.046);   // base font size ~29px at 640px wide
  const mono = `"Courier New","Lucida Console",monospace`;

  ctx.save();

  switch (variant) {
    // ── 1  Amber LED — Disposable (bottom-right, YY  MM  DD) ──────────────────
    case 1: {
      const text = `${yy}  ${mm}  ${dd}`;
      ctx.font         = `bold ${sz}px ${mono}`;
      ctx.textAlign    = "right";
      ctx.textBaseline = "bottom";
      ctx.shadowColor  = "rgba(255,90,0,0.88)";
      ctx.shadowBlur   = sz * 0.90;
      ctx.fillStyle    = "rgba(255,138,0,0.95)";
      ctx.fillText(text, cw - m, ch - m);
      ctx.shadowBlur   = sz * 0.28;
      ctx.fillStyle    = "rgba(255,218,72,0.90)";
      ctx.fillText(text, cw - m, ch - m);
      break;
    }
    // ── 2  Red LED — Kodak 400 (bottom-left, MM . DD . YY) ───────────────────
    case 2: {
      const text = `${mm} . ${dd} . ${yy}`;
      ctx.font         = `bold ${sz}px ${mono}`;
      ctx.textAlign    = "left";
      ctx.textBaseline = "bottom";
      ctx.shadowColor  = "rgba(255,18,0,0.85)";
      ctx.shadowBlur   = sz * 0.92;
      ctx.fillStyle    = "rgba(255,55,0,0.95)";
      ctx.fillText(text, m, ch - m);
      ctx.shadowBlur   = sz * 0.30;
      ctx.fillStyle    = "rgba(255,155,72,0.88)";
      ctx.fillText(text, m, ch - m);
      break;
    }
    // ── 3  White clean — Superia (bottom-left, YY/MM/DD) ─────────────────────
    case 3: {
      const text = `${yy}/${mm}/${dd}`;
      const s    = Math.round(sz * 0.76);
      ctx.font         = `${s}px ${mono}`;
      ctx.textAlign    = "left";
      ctx.textBaseline = "bottom";
      ctx.shadowColor  = "rgba(0,0,0,0.65)";
      ctx.shadowBlur   = 4;
      ctx.fillStyle    = "rgba(255,255,255,0.80)";
      ctx.fillText(text, m, ch - m);
      break;
    }
    // ── 4  Cyan neon — Cross Process (top-right, MM-DD-YY) ───────────────────
    case 4: {
      const text = `${mm}-${dd}-${yy}`;
      ctx.font         = `bold ${sz}px ${mono}`;
      ctx.textAlign    = "right";
      ctx.textBaseline = "top";
      ctx.shadowColor  = "rgba(0,255,220,0.92)";
      ctx.shadowBlur   = sz * 1.05;
      ctx.fillStyle    = "rgba(0,255,220,0.90)";
      ctx.fillText(text, cw - m, m);
      ctx.shadowBlur   = sz * 0.32;
      ctx.fillStyle    = "rgba(195,255,248,0.82)";
      ctx.fillText(text, cw - m, m);
      break;
    }
    // ── 5  Faded red — Expired (bottom-right, YY.MM.DD, barely visible) ──────
    case 5: {
      const text = `${yy}.${mm}.${dd}`;
      const s    = Math.round(sz * 0.86);
      ctx.font         = `bold ${s}px ${mono}`;
      ctx.textAlign    = "right";
      ctx.textBaseline = "bottom";
      ctx.fillStyle    = "rgba(175,38,28,0.36)";
      ctx.fillText(text, cw - m, ch - m);
      break;
    }
    // ── 6  Year only — Lomo (top-left, '26 large) ────────────────────────────
    case 6: {
      const text = `'${yy}`;
      const s    = Math.round(sz * 1.65);
      ctx.font         = `bold ${s}px ${mono}`;
      ctx.textAlign    = "left";
      ctx.textBaseline = "top";
      ctx.shadowColor  = "rgba(0,0,0,0.42)";
      ctx.shadowBlur   = 5;
      ctx.fillStyle    = "rgba(255,255,255,0.74)";
      ctx.fillText(text, m, m);
      break;
    }
    // ── 7  Soft script — Polaroid (bottom-center, MMM DD 'YY) ────────────────
    case 7: {
      const text = `${MONTHS[now.getMonth()]}  ${dd}  '${yy}`;
      const s    = Math.round(sz * 0.70);
      ctx.font         = `${s}px ${mono}`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor  = "rgba(0,0,0,0.30)";
      ctx.shadowBlur   = 3;
      ctx.fillStyle    = "rgba(255,255,255,0.68)";
      ctx.fillText(text, cw / 2, ch - m);
      break;
    }
    // ── 8  Timecode — Cinestill (bottom-center, HH:MM:SS:FF) ─────────────────
    case 8: {
      const text = `${hh}:${mi}:${ss}:${ff}`;
      const s    = Math.round(sz * 0.68);
      ctx.font         = `${s}px ${mono}`;
      ctx.textAlign    = "center";
      ctx.textBaseline = "bottom";
      ctx.shadowColor  = "rgba(0,0,0,0.72)";
      ctx.shadowBlur   = 4;
      ctx.fillStyle    = "rgba(255,255,255,0.82)";
      ctx.fillText(text, cw / 2, ch - m);
      break;
    }
    // ── 9  Frame info — Tri-X (top-left, [DD]  TRI-X) ────────────────────────
    case 9: {
      const text = `[${dd}]  TRI-X`;
      const s    = Math.round(sz * 0.65);
      ctx.font         = `${s}px ${mono}`;
      ctx.textAlign    = "left";
      ctx.textBaseline = "top";
      ctx.shadowColor  = "rgba(0,0,0,0.55)";
      ctx.shadowBlur   = 3;
      ctx.fillStyle    = "rgba(255,255,255,0.75)";
      ctx.fillText(text, m, m);
      break;
    }
  }

  ctx.restore();
}

// ── Component ─────────────────────────────────────────────────────────────────
const P5VideoFilter = forwardRef<P5FilterHandle, Props>(
  ({ videoRef, filter, active }, ref) => {
    const mountRef     = useRef<HTMLDivElement>(null);
    const canvasRef    = useRef<HTMLCanvasElement | null>(null);
    const grainRef     = useRef<HTMLCanvasElement | null>(null);
    const halCanvasRef = useRef<HTMLCanvasElement | null>(null);   // offscreen for halation blur
    const filterRef    = useRef(filter);
    const activeRef    = useRef(active);
    filterRef.current  = filter;
    activeRef.current  = active;

    useImperativeHandle(ref, () => ({
      getCanvas: () => canvasRef.current,
    }));

    // Initialise client-only resources (grain texture + halation canvas)
    useEffect(() => {
      grainRef.current     = makeGrainCanvas(512);
      halCanvasRef.current = document.createElement("canvas");
    }, []);

    // Clear the canvas the moment the camera turns off so the frozen last-frame
    // doesn't linger — the muted background + VideoOffIcon then show through.
    useEffect(() => {
      if (!active && canvasRef.current) {
        const ctx = canvasRef.current.getContext("2d");
        ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      }
    }, [active]);

    useEffect(() => {
      const mount = mountRef.current;
      if (!mount) return;

      let p5Instance: p5Type | null = null;
      let rafId = 0;

      import("p5").then(({ default: P5 }) => {
        const sketch = (p: p5Type) => {
          p.setup = () => {
            const cnv = p.createCanvas(640, 480);
            cnv.style("width",    "100%");
            cnv.style("height",   "100%");
            cnv.style("position", "absolute");
            cnv.style("inset",    "0");
            canvasRef.current = cnv.elt as HTMLCanvasElement;
            p.pixelDensity(1);
            p.noLoop();
          };

          p.draw = () => {
            const video = videoRef.current;
            if (!video || video.readyState < 2 || !activeRef.current) return;

            const vw = video.videoWidth  || 640;
            const vh = video.videoHeight || 480;

            // Object-cover crop to 4:3 — matches the CSS aspect-[4/3] container
            const TARGET = 4 / 3;
            const va = vw / vh;
            let sx = 0, sy = 0, sw = vw, sh = vh;
            if (va > TARGET) { sw = vh * TARGET; sx = (vw - sw) / 2; }
            else if (va < TARGET) { sh = vw / TARGET; sy = (vh - sh) / 2; }
            const cw = Math.round(sw);
            const ch = Math.round(sh);
            if (p.width !== cw || p.height !== ch) p.resizeCanvas(cw, ch, true);

            const ctx = p.drawingContext as CanvasRenderingContext2D;

            // ①  Draw mirrored + cropped frame
            ctx.save();
            ctx.translate(cw, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cw, ch);
            ctx.restore();

            const f = filterRef.current;

            // ②  Per-pixel colour grade (LUT + saturation + split toning)
            if (f.id !== "none") {
              p.loadPixels();
              processPixels(p.pixels as unknown as Uint8ClampedArray, f);
              p.updatePixels();
            }

            // ③  Halation — copies the processed frame to an offscreen canvas,
            //    blurs it, then screen-blends it back.  Bright highlights (warm on
            //    Cinestill, warm on Polaroid) naturally bloom their own colour.
            //    The blur radius grows with the halation value for a wider glow.
            if (f.halation > 0 && halCanvasRef.current) {
              const hc = halCanvasRef.current;
              if (hc.width !== cw || hc.height !== ch) {
                hc.width = cw;
                hc.height = ch;
              }
              const hCtx = hc.getContext("2d")!;
              hCtx.filter = `blur(${Math.round(10 + f.halation * 16)}px)`;
              hCtx.drawImage(ctx.canvas, 0, 0);   // read from p5 canvas into offscreen
              ctx.save();
              ctx.globalCompositeOperation = "screen";
              ctx.globalAlpha = f.halation * 0.52;
              ctx.drawImage(hc, 0, 0);
              ctx.restore();
            }

            // ④  Vignette — radial gradient; inner/outer radii tighten
            //    automatically as vignette intensity increases (matches lens physics:
            //    heavier vignette = stronger falloff from a smaller clear zone).
            if (f.vignette > 0) {
              const t     = Math.max(0.30, 1 - f.vignette * 0.85);  // tightness 0.3–1.0
              const inner = cw * 0.15 * t;
              const outer = cw * (0.44 + t * 0.32);
              const cx = cw / 2, cy = ch / 2;
              const grad = ctx.createRadialGradient(cx, cy, inner, cx, cy, outer);
              grad.addColorStop(0, "rgba(0,0,0,0)");
              grad.addColorStop(1, `rgba(0,0,0,${(f.vignette * 0.78).toFixed(2)})`);
              ctx.fillStyle = grad;
              ctx.fillRect(0, 0, cw, ch);
            }

            // ⑤  Haze — warm milky overexposure layer (Polaroid / expired film)
            if (f.haze > 0) {
              ctx.fillStyle = `rgba(255,236,208,${(f.haze * 0.46).toFixed(2)})`;
              ctx.fillRect(0, 0, cw, ch);
            }

            // ⑥  Film grain — pre-generated noise, tiled with random offset every
            //    frame so it reads as animated silver-halide grain.
            //    grainSize scales the tile: 1x = fine ISO 200, 3x = coarse ISO 800+.
            //    soft-light blend is luminance-dependent: grain is strongest in
            //    midtones and invisible on pure black/white — exactly like real film.
            if (f.grain > 0 && grainRef.current) {
              const grain = grainRef.current;
              const gs    = f.grainSize;
              const tileW = grain.width  * gs;
              const tileH = grain.height * gs;
              const ox    = ((Math.random() * tileW) | 0);
              const oy    = ((Math.random() * tileH) | 0);
              ctx.save();
              ctx.globalCompositeOperation = "soft-light";
              ctx.globalAlpha = f.grain;
              for (let x = -ox; x < cw; x += tileW) {
                for (let y = -oy; y < ch; y += tileH) {
                  ctx.drawImage(grain, x, y, tileW, tileH);
                }
              }
              ctx.restore();
            }

            // ⑦  Light leak — warm orange gradient from camera back / sprocket
            drawLightLeak(ctx, cw, ch, f.lightLeakVariant, f.lightLeak);

            // ⑧  Physical analog border overlay
            drawFilmBorder(ctx, cw, ch, f.borderVariant);

            // ⑨  Timestamp — style and position unique to each film stock
            drawStamp(ctx, cw, ch, f.stamp, f.borderVariant);
          };
        };

        p5Instance = new P5(sketch, mount);

        const tick = () => {
          if (activeRef.current) p5Instance?.redraw();
          rafId = requestAnimationFrame(tick);
        };
        rafId = requestAnimationFrame(tick);
      });

      return () => {
        cancelAnimationFrame(rafId);
        p5Instance?.remove();
        canvasRef.current = null;
      };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoRef]);

    return (
      <div
        ref={mountRef}
        className="absolute inset-0 overflow-hidden"
      />
    );
  },
);

P5VideoFilter.displayName = "P5VideoFilter";
export default P5VideoFilter;
