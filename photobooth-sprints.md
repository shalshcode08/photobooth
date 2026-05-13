# Photobooth — Sprint Planning

---

## Project Status · 2026-05-13

### Built and working
- **Booth page** — live WebGL-filtered preview (60 fps), 10 authentic film filters with grain / halation / vignette / light leaks / date stamps
- **Capture flow** — manual shutter, auto-burst (4 × 5 s), spacebar key, screen flash, shutter sound, max 4 photos per session
- **Filter selector** — chip strip with prev/next chevrons, hidden-scrollbar swipe, live CSS-preview thumbnails
- **Photo gallery** — stacked card UI with delete + next/prev navigation, persistent active card via Zustand
- **Camera lifecycle** — hardened against StrictMode double-invoke and async stop races (no more orange "in use" dot)
- **Booth surface** — animated mesh-gradient background + faded dotted-grid overlay, four corner stickers with directional shadows

### Built but underused
- **PhotoGallery** — functional but is the *only* artifact; no way to take photos out of the app
- **Mobile gallery strip** — `compact` mode exists, but offers no actions
- **Clerk auth** — wired in the project scaffold, never gated to anything user-facing

### Not started
- **Photo strip output** — no shareable single image; this is the actual photobooth deliverable (→ Sprint 3)
- **Download / share** — `<a download>` and `navigator.share` not wired
- **Cloud persistence** — photos live in `localStorage` only; clearing storage loses them
- **Strip templates / customization** — single-photo, polaroid grid, filmstrip variants
- **Print / QR sharing**

---

## Sprint 3 · Photo Strip Output & Share

### Goal
Turn the booth from "takes four filtered photos" into "produces a photobooth strip you can take home." After capturing the 4-photo cap, the user can compose those photos into a single image using one of several template layouts, preview it large, then download or natively share it.

### Why now
The capture pipeline is solid — Sprint 2 shipped WebGL filters, the 4-shot cap, burst, and flash. What's missing is the *deliverable*. A real photobooth always produces a single tangible artifact. Without the strip, the four photos are stranded in a gallery, which defeats the entire metaphor of the product.

### Architecture

```
photos[] (4 dataURLs from BoothCamera)
       ↓
StripComposer.composeStrip(photos, template)
       → loads each dataURL into HTMLImageElement, awaits decode
       → creates an offscreen <canvas> sized per template
       → paints background, frame, photos at template-defined slots
       → paints header / footer text (logo, date, filter names)
       → returns HTMLCanvasElement
       ↓
StripPreview modal
       → renders the composed canvas at scaled-down size
       → template picker chips re-compose on selection
       → Download button: canvas.toBlob → <a download> trigger
       → Share button:    canvas.toBlob → navigator.share({files:[...]})
                          falls back to Download when share unavailable
```

Composition is a **pure function** (`composeStrip`) that takes inputs → returns a canvas. No React, no side effects. This makes it trivial to unit-test, swap templates, or call from any context (e.g., a future "regenerate" CTA).

### Strip templates (4 to start)

| # | Name | Layout | Output dim | Character |
|---|---|---|---|---|
| 1 | **Classic Strip** | 4 photos vertical, 1 col, photo aspect 4:3 | 600 × 1800 | White paper, photobooth logo + date footer |
| 2 | **Polaroid Grid** | 2 × 2, each tilted ±2°, white frame + drop shadow | 1200 × 1200 | Hand-arranged scrapbook feel |
| 3 | **Single Hero** | 1 large + 3 small thumbnails below | 1000 × 1400 | Magazine-style, hero is the user's pick |
| 4 | **Filmstrip** | 4 horizontal frames mimicking 35 mm with sprocket holes | 2400 × 600 | The most photo-booth-y option |

Template config is a typed object — no GLSL or canvas code in the template itself; the composer reads layout positions, padding, frame style, header config:

```ts
interface StripTemplate {
  id: string
  label: string
  dimensions: { w: number; h: number }
  background: string                    // hex or "transparent"
  slots: Array<{ x: number; y: number; w: number; h: number; rotate?: number; frame?: FrameSpec }>
  header?:  TextSlot
  footer?:  TextSlot
  decorations?: Array<DecorationSpec>   // sprocket holes for filmstrip etc.
}
```

### Implementation plan

#### Step 1 — `lib/strip-templates.ts`
Define `StripTemplate` interface and the 4 starter templates. Frame specs (border color, border width, shadow) per slot.

#### Step 2 — `lib/strip-composer.ts`
Pure async function:
```ts
async function composeStrip(photos: string[], template: StripTemplate): Promise<HTMLCanvasElement>
```
- Decode photos in parallel (`Promise.all` over `Image.decode()`)
- Paint slot rectangles with optional frame and rotation
- Use `ctx.save()` / `ctx.restore()` for each rotated slot so transforms don't leak
- Render header/footer text with a custom font (declared at app level)

#### Step 3 — `components/appComponents/StripPreview.tsx`
Client modal component:
- Reads `photos` from store
- Local state: `activeTemplateId`, `composing`, `composedDataUrl`
- Effect: when active template or photos change, re-run `composeStrip` and update preview
- Renders preview image, template chip picker, Download + Share buttons
- Uses `<Dialog>` from existing shadcn UI

#### Step 4 — `components/appComponents/StripTrigger.tsx`
Small inline button that lives in the controls row. Disabled until `photos.length === 4`. Opens `StripPreview`. Animated state change when it becomes available ("Strip ready").

#### Step 5 — `BoothCamera.tsx` integration
Insert `<StripTrigger />` next to the existing Flash button. Re-balance controls row spacing.

#### Step 6 — `PhotoGallery.tsx` polish
- Empty state when `photos.length === 0` ("Take a few shots and your strip will appear here")
- "Clear all" affordance when at max (today the user must delete photos one-by-one to retake)

#### Step 7 — Download + Share
- Download: `canvas.toBlob(blob => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'photobooth-<timestamp>.png'; a.click(); URL.revokeObjectURL(a.href); })`
- Share (Web Share Level 2):
  ```ts
  const file = new File([blob], filename, { type: 'image/png' })
  if (navigator.canShare?.({ files: [file] })) {
    await navigator.share({ files: [file], title: 'My Photobooth Strip' })
  } else {
    // fall back to download
  }
  ```

### Files to create / modify

| File | Action | Notes |
|---|---|---|
| `lib/strip-templates.ts` | Create | Typed template registry (4 layouts) |
| `lib/strip-composer.ts` | Create | Pure `composeStrip(photos, template) → canvas` |
| `components/appComponents/StripPreview.tsx` | Create | Modal w/ template picker + download/share |
| `components/appComponents/StripTrigger.tsx` | Create | Inline "Make strip" CTA, disabled until 4 photos |
| `components/appComponents/BoothCamera.tsx` | Modify | Add trigger to controls row |
| `components/appComponents/PhotoGallery.tsx` | Modify | Empty state + clear-all action |

### Performance targets
- Strip compose for 4 photos at 600 × 1800 output: < 500 ms (decode + paint + encode)
- Preview re-render on template change: < 250 ms
- No main-thread jank during compose — measure with Performance API, move to OffscreenCanvas in a Worker only if budget exceeded

### Risk / fallbacks
- **iOS Safari Web Share files** — requires iOS 15+; check `navigator.canShare({ files: [...] })` before calling; fall back to download.
- **OffscreenCanvas in workers** — not available in older Safari; default path is main-thread canvas, worker is opt-in if perf regresses.
- **Photo aspect mismatch** — captured frames are 4:3 (cropped from video); template slots assume 4:3 — if a future template assumes 1:1, add object-cover-style crop math to the composer.
- **Custom fonts in canvas** — load via `document.fonts.ready` before composing; fall back to `system-ui` if not loaded in time.

### Stretch (next-sprint candidates, not in scope)
- QR code on the strip linking to a hosted gallery URL (needs backend)
- Print-friendly PDF export
- Direct-to-social intents (Instagram Stories, X, etc.)
- Strip "history" — save composed strips to the gallery as their own entry

---

## Sprint 2 · Completed ✓

Delivered the WebGL filter engine as specified, plus a sizeable interim polish pass on controls, decoration, and camera lifecycle.

### Beyond the original plan
- **Film lineup rescoped** to 10 authentic 90s stocks after color-science research (Kodak 400 / Fuji Superia / Disposable / Cross-process / Expired / Lomo / Polaroid / Cinestill / Tri-X) — replaced the originally-planned "Portra / Fade / Cinematic / Vivid" modern-lifestyle set.
- **Per-filter authentic effects** — light leaks (4 variants), film grain with ISO-scaled tile size, halation, vignette auto-tightening, unique date-stamp variants per filter.
- **Capture controls** — auto-burst (4 shots × 5 s), spacebar capture, screen-flash mode, max-4-photo cap with per-frame guards.
- **Filter selector** — scrollable chip strip with prev/next arrows; hidden scrollbar; bounds-aware disable.
- **Booth surface** — animated mesh-gradient background + dotted-grid overlay.
- **Decorative stickers** — four corner stickers with directional drop-shadow ("stuck on wall" feel).
- **Camera lifecycle hardening** — fixed StrictMode double-invoke double-stream, the orange "in-use" dot lingering after stop, and the spacebar double-capture (focused-button synthetic click).

### Original spec (preserved for reference)

Replace basic CSS filters with a WebGL-powered filter engine that produces beautiful, film-inspired photos.

**Why not CSS / SVG / Canvas 2D**

| Approach | Real-time video | Capture quality | Verdict |
|---|---|---|---|
| CSS filters | Fast | Mediocre | Too limited |
| SVG feColorMatrix | < 8 fps | Good on stills | Not viable live |
| Canvas 2D pixel ops | 5–15 fps | High | CPU-bound |
| **WebGL fragment shaders** | **60 fps** | **Excellent** | **Use this** |

**Architecture**
```
<video> (hidden live feed)
    ↓
WebGL canvas overlay (same size, absolute over video)
    → samples video as GPU texture every frame
    → applies active filter's fragment shader
    → renders at 60 fps
On capture:
    → canvas.toDataURL("image/jpeg", 0.92)
```

**Library** — Replaced glfx.js with a hand-rolled p5 + per-filter render pipeline in `P5VideoFilter.tsx` (8 passes: mirror+crop → LUT/sat/split-tone → halation → vignette → haze → grain → light leak → stamp).

**Pixel ops** — float [0,1] processing, Rec.709 luminance, split toning, LUT-based per-channel curves.

**Performance achieved**
- Live preview: 60 fps desktop, 30+ fps mid-range mobile
- Frame budget: ~6 ms/frame typical
- Capture: < 50 ms `toDataURL`

---

## Sprint 1 · Completed ✓

- Booth camera page with live video feed
- CSS filter selector (functional, used as Sprint 2 stepping stone)
- Photo capture with flash + shutter sound
- Gallery with animated stacked cards (next/prev navigation, delete)
- Zustand store with `localStorage` persistence (camera on/off, active filter)
- Mobile responsive layout (no scroll, compact gallery strip)
