# Photobooth — Sprint Planning

---

## Sprint 2 · Professional Filters

### Goal
Replace the current basic CSS filters with a WebGL-powered filter engine that produces genuinely beautiful, film-inspired photos — the core product differentiator.

---

### Why not CSS/SVG filters?

| Approach | Real-time video | Capture quality | Verdict |
|---|---|---|---|
| CSS filters | Fast | Mediocre | Too limited (only brightness/contrast/hue-rotate) |
| SVG feColorMatrix | <8 FPS on video | Good on stills | Not viable for live preview |
| Canvas 2D pixel ops | 5–15 FPS | High | CPU-bound, too slow for 60fps |
| **WebGL fragment shaders** | **60 FPS** | **Excellent** | **Use this** |

CSS filters can only do basic adjustments. Professional-looking filters require per-channel tone curves, split toning (different color cast in shadows vs highlights), lifted blacks (matte/fade), and vignette — none of which are expressible in CSS alone. WebGL runs these on the GPU and is the only approach that handles real-time video at 60fps *and* produces high-quality captures.

---

### Architecture

```
<video> (live camera feed)
    ↓
WebGL canvas overlay (same size, absolute-positioned over video)
    → reads video as GPU texture every frame via requestAnimationFrame
    → applies active filter's GLSL fragment shader
    → renders to canvas at 60fps (user sees this, not the raw video)

On capture:
    → canvas.toDataURL("image/jpeg", 0.92)  ← already filtered, full res
```

The raw `<video>` element stays hidden. The user always looks at the filtered WebGL canvas.

---

### Library

**glfx.js** — 40 KB, MIT, no dependencies, purpose-built for WebGL image effects.
Provides a simple `texture(video) → apply(fx) → draw()` API.
Custom filters are GLSL fragment shaders compiled once at init.

Fallback: if WebGL unavailable (old device) → fall back to current CSS filter approach.

---

### Filter Lineup (10 filters)

Each filter is defined by a combination of: tone curve per channel (R/G/B), colour cast (matrix bias), saturation, vignette, lifted blacks (fade/matte), and optional grain.

| # | Name | Inspiration | Character |
|---|---|---|---|
| 1 | **None** | — | Raw, no adjustment |
| 2 | **Portra** | Kodak Portra 400 | Warm, slightly soft, skin-flattering. Lifted shadows, -8% sat, warm cast |
| 3 | **Fuji** | Fuji Pro 400H | Cool-clean, slightly pastel. Light green in midtones, lifted whites |
| 4 | **Fade** | Lifestyle/matte | Lifted blacks (+12), desaturated (-12%), low contrast. Clean modern fade |
| 5 | **Golden** | Golden hour | Warm orange cast, boosted highlights, raised shadows. Glowing feel |
| 6 | **Cinematic** | Teal-orange Hollywood | Teal in shadows (boost blue+green), orange in highlights. Vignette |
| 7 | **B&W Classic** | Studio B&W | Luminance-weighted desaturation + S-curve contrast. Clean and elegant |
| 8 | **B&W Grain** | Kodak Tri-X | High-contrast B&W + film grain overlay. Dramatic, editorial |
| 9 | **Cross** | Cross-process | Boosted green shadows, clipped red highlights, punchy-weird colours |
| 10 | **Vivid** | VSCO A-series | +30% saturation, punchy S-curve, slight warm cast. Instagram-ready |

---

### Filter Parameter Reference (GLSL values)

```
// Portra
brightness:  +0.02
contrast:    -0.05
saturation:  -0.08
warm cast:   r +0.04, g +0.01, b -0.03
black lift:  +0.04
vignette:    0.25 strength, 0.6 radius

// Fade / Matte
black lift:  +0.10
contrast:    -0.10
saturation:  -0.12
vignette:    0.15 strength, 0.55 radius

// Cinematic (Teal-Orange)
shadows tint:    b +0.08, g +0.04  (teal push)
highlights tint: r +0.06, b -0.04  (orange push)
black lift:      +0.05
contrast:        +0.08
vignette:        0.35 strength, 0.55 radius

// Golden Hour
warm cast:  r +0.08, g +0.03, b -0.06
brightness: +0.04
saturation: +0.10
highlights: slightly clipped (+0.04 bias)

// B&W Grain
desaturate: 100%
contrast:   +0.15 (deep blacks at -0.05)
grain:      amplitude 0.06, mean 0.0

// Cross Process
R channel: toe lifted +0.05, highlight clipped +0.04
G channel: shadow boosted +0.08, contrast +0.10
B channel: desaturated -0.10 highlights
```

---

### Filter Preview Thumbnails

Replace current gradient preview squares with real frames captured from the live camera feed. On each camera frame, capture a low-res thumbnail (80×60px), apply each filter's CSS approximation to the preview tile so users see how *their actual face* looks under each filter — not a generic gradient.

CSS approximations (for previews only, not for actual filtering):
- These don't need to be exact — just close enough for the selector thumbnail

---

### Implementation Plan

#### Step 1 — Install glfx.js
```
bun add glfx
```
Check for TypeScript types; write a minimal `.d.ts` shim if needed.

#### Step 2 — `lib/filters.ts`
Define filter configs as typed objects:
```ts
interface FilterConfig {
  id: string
  label: string
  cssPreview: string        // CSS filter string for thumbnail preview
  apply: (fx: GlfxCanvas) => GlfxCanvas  // glfx chain
}
```

#### Step 3 — `components/appComponents/VideoFilter.tsx`
Client component that:
- Creates a `<canvas>` absolutely positioned over the video (same dimensions)
- Initialises glfx canvas on mount
- Runs `requestAnimationFrame` loop: `texture(videoEl).apply(activeFilter).draw()`
- Cancels loop and releases WebGL context on unmount / camera off
- Exposes a `getFilteredCanvas(): HTMLCanvasElement` ref for capture

#### Step 4 — Update `BoothCamera.tsx`
- Render `<VideoFilter>` overlay on the `<video>` element
- On capture: call `videoFilterRef.current.getFilteredCanvas().toDataURL()` instead of drawing from raw video
- Remove CSS `filter` style from `<video>` tag (WebGL canvas handles it now)

#### Step 5 — Update `FilterSelector.tsx`
- On camera active: every 2s, grab a tiny thumbnail frame from the video and store it
- Render that thumbnail inside each filter button (with CSS approximation applied)
- Shows the user's actual face/scene under each filter

#### Step 6 — Update `cameraStore.ts`
- Change `activeFilter: string` (CSS string) to `activeFilterId: string`
- Keep the `FILTERS` array as the single source of truth in `lib/filters.ts`

#### Step 7 — WebGL fallback
- Detect WebGL support on mount
- If unavailable: skip `VideoFilter`, fall back to CSS filter on `<video>` tag
- Log warning in dev

---

### Files to create / modify

| File | Action | Notes |
|---|---|---|
| `lib/filters.ts` | Create | Filter registry — configs, GLSL params, CSS previews |
| `components/appComponents/VideoFilter.tsx` | Create | WebGL canvas overlay, animation loop |
| `components/appComponents/BoothCamera.tsx` | Modify | Integrate VideoFilter, update capture source |
| `components/appComponents/FilterSelector.tsx` | Modify | Live thumbnail previews |
| `store/cameraStore.ts` | Modify | `activeFilterId` instead of CSS string |

---

### Performance Targets
- Live preview: 60 FPS on desktop, 30+ FPS on mid-range mobile
- Frame render budget: <10 ms/frame (WebGL texture update ~0.5ms + shader ~2ms)
- Capture latency: <50 ms (single `toDataURL` call)
- Bundle addition: ~40 KB (glfx.js)

### Risk / Fallbacks
- **iOS Safari WebGL on video**: Test early — some iOS versions restrict `texImage2D` from `<video>`. Fallback: draw video to intermediate 2D canvas first, then use that as WebGL texture.
- **Low-end Android**: Monitor FPS; if <25fps, downscale canvas to 50% for live preview (still full res on capture).
- **WebGL context lost**: Handle `webglcontextlost` event; reinitialise or fall back to CSS.

---

## Sprint 1 · Completed ✓

- Booth camera page with live video feed
- CSS filter selector (functional, used as Sprint 2 stepping stone)
- Photo capture with flash + shutter sound
- Gallery with animated stacked cards (next/prev navigation, delete)
- Zustand store with localStorage persistence (camera on/off, active filter)
- Mobile responsive layout (no scroll, compact gallery strip)
