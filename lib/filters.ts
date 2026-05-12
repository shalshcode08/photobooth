// ── LUT builder ───────────────────────────────────────────────────────────────
// lift     : raises shadows  (0 = none, 0.12 = strong matte lift)
// gamma    : midtone power   (>1 brighter, <1 darker, 1 = neutral)
// gain     : scales output   (applied AFTER gamma, not inside it)
// contrast : S-curve around 0.5
function buildLUT(
  lift = 0,
  gamma = 1,
  gain = 1,
  contrast = 1,
): Uint8ClampedArray {
  const lut = new Uint8ClampedArray(256);
  for (let i = 0; i < 256; i++) {
    let v = i / 255;
    v = v + lift * (1 - v);
    v = Math.pow(Math.max(0, v), 1 / gamma);
    v = v * gain;
    v = 0.5 + (v - 0.5) * contrast;
    lut[i] = Math.min(255, Math.max(0, (v * 255 + 0.5))) | 0;
  }
  return lut;
}

const ID = buildLUT(); // identity / passthrough

// ── Stamp variant key ─────────────────────────────────────────────────────────
// Each number maps to a unique timestamp visual style rendered in P5VideoFilter.
// 0 = none
// 1 = amber LED    bottom-right  YY  MM  DD   (disposable cam)
// 2 = red LED      bottom-left   MM . DD . YY  (Kodak)
// 3 = white clean  bottom-left   YY/MM/DD      (Superia)
// 4 = cyan neon    top-right     MM-DD-YY      (cross-process)
// 5 = faded red    bottom-right  YY.MM.DD      (expired — barely visible)
// 6 = white year   top-left      'YY           (Lomo — large, just the year)
// 7 = soft white   bottom-center MMM DD 'YY    (Polaroid)
// 8 = timecode     bottom-center HH:MM:SS:FF   (Cinestill)
// 9 = frame info   top-left      [DD]  TRI-X   (Tri-X)
export type StampVariant = 0|1|2|3|4|5|6|7|8|9;

// ── Filter definition ─────────────────────────────────────────────────────────
export interface FilterDef {
  id: string;
  label: string;
  cssPreview: string;           // CSS filter for thumbnail preview
  lutR: Uint8ClampedArray;
  lutG: Uint8ClampedArray;
  lutB: Uint8ClampedArray;
  saturation: number;           // 0 = B&W · 1 = normal · >1 = vivid
  // float fractions applied in [0,1] space — never overflow
  shadowTint:    [number, number, number];
  highlightTint: [number, number, number];
  grain: number;                // 0–1 soft-light grain overlay opacity
  grainSize: number;            // 1.0 = fine (ISO 200) · 3.0 = coarse (ISO 800+)
  vignette: number;             // 0–1
  lightLeak: number;            // 0–1 intensity of warm edge bleed
  lightLeakVariant: 0|1|2|3|4; // 0=none  1=top-right  2=left-band  3=bottom  4=double
  haze: number;                 // 0–1 milky overexposure fog
  halation: number;             // 0–1 cinematic highlight bloom (screen-blend blur)
  stamp: StampVariant;          // timestamp overlay style (0 = none)
  borderVariant?: 0|1|2|3;      // 0=none  1=classic-scan  2=polaroid-frame  3=cinema-strip
}

// ── Filters ───────────────────────────────────────────────────────────────────
export const FILTERS: FilterDef[] = [
  // ── None ────────────────────────────────────────────────────────────────────
  {
    id: "none", label: "None", cssPreview: "",
    lutR: ID, lutG: ID, lutB: ID,
    saturation: 1,
    shadowTint: [0,0,0], highlightTint: [0,0,0],
    grain: 0, grainSize: 1, vignette: 0,
    lightLeak: 0, lightLeakVariant: 0, haze: 0, halation: 0, stamp: 0,
  },

  // ── Kodak Gold 400 ──────────────────────────────────────────────────────────
  // Warm amber colour science: R+15%, G+10%, B suppressed.
  // T-grain emulsion with excellent shadow latitude. Soft shoulder on highlights.
  // The definitive "summer holiday roll" — golden skin tones, lifted blacks.
  {
    id: "kodak400", label: "Kodak 400",
    cssPreview: "sepia(28%) saturate(85%) brightness(108%) contrast(91%)",
    lutR: buildLUT(0.04, 1.06, 1.03, 0.95),   // lifted warm reds, soft highlight shoulder
    lutG: buildLUT(0.03, 1.03, 1.00, 0.94),   // slight green warmth
    lutB: buildLUT(0.01, 0.92, 0.83, 0.94),   // strong blue cut → warmth
    saturation: 0.90,
    shadowTint:    [ 0.035,  0.012, -0.012],   // amber shadow fog
    highlightTint: [ 0.020,  0.008, -0.008],
    grain: 0.09, grainSize: 1.8,
    vignette: 0.22,
    lightLeak: 0, lightLeakVariant: 0, haze: 0.06, halation: 0, stamp: 2,
  },

  // ── Fuji Superia 400 ────────────────────────────────────────────────────────
  // The "Fuji look": punchy reds, vivid greens, cool-neutral shadows.
  // Greens are the star — landscapes and foliage pop without going neon.
  // Shadows can shift green-cyan when slightly underexposed (built in).
  {
    id: "superia", label: "Superia",
    cssPreview: "hue-rotate(8deg) saturate(96%) brightness(100%) contrast(106%)",
    lutR: buildLUT(0.01, 0.99, 0.97, 1.06),
    lutG: buildLUT(0.02, 1.03, 1.01, 1.05),   // the famous Fuji green push
    lutB: buildLUT(0.02, 1.04, 1.03, 1.04),   // blue stays clean
    saturation: 0.95,
    shadowTint:    [-0.008,  0.022,  0.026],   // cool green-cyan in shadows
    highlightTint: [ 0.004,  0.004,  0.000],
    grain: 0.10, grainSize: 2.0,
    vignette: 0.18,
    lightLeak: 0, lightLeakVariant: 0, haze: 0, halation: 0, stamp: 3,
  },

  // ── Disposable ──────────────────────────────────────────────────────────────
  // Fujifilm QuickSnap / Kodak FunSaver — the most iconic 90s look.
  // Fixed 1/140s shutter, f/11, internal flash → flat harsh light, cold fill.
  // Fuji Superia X-TRA 800 base → heavy grain, magenta skin cast, strong vignette.
  // THE date stamp: amber LCD in the lower-right corner.
  {
    id: "disposable", label: "Disposable",
    cssPreview: "contrast(112%) saturate(110%) brightness(105%)",
    lutR: buildLUT(0.04, 1.04, 1.02, 1.12),   // punchy warm flash fill, lifting midtones beautifully
    lutG: buildLUT(0.03, 1.01, 0.98, 1.10),
    lutB: buildLUT(0.03, 0.96, 0.92, 1.10),   // gentle blue reduction for golden skin tones
    saturation: 1.05,
    shadowTint:    [ 0.020,  0.005, -0.010],   // warm inviting shadow lift
    highlightTint: [ 0.025,  0.010, -0.015],   // golden highlights
    grain: 0.14, grainSize: 2.2,
    vignette: 0.45,
    lightLeak: 0.15, lightLeakVariant: 1, haze: 0.02, halation: 0.22, stamp: 1,
  },

  // ── Cross Process ───────────────────────────────────────────────────────────
  // E-6 slide film processed in C-41 negative chemistry.
  // CD-4 developer forms wrong dye couplings → extreme, unpredictable color.
  // Teal-cyan in shadows, yellow-orange in highlights, +35% saturation, crushed shadows.
  {
    id: "cross", label: "Cross",
    cssPreview: "saturate(180%) contrast(132%) hue-rotate(-20deg) brightness(103%)",
    lutR: buildLUT(0.00, 1.02, 1.05, 1.26),
    lutG: buildLUT(0.01, 0.97, 0.90, 1.24),   // greens cut (wrong dye coupling)
    lutB: buildLUT(0.07, 1.08, 1.08, 1.22),   // blues lifted + boosted
    saturation: 1.42,
    shadowTint:    [-0.051,  0.027,  0.067],   // strong teal push
    highlightTint: [ 0.067,  0.027, -0.051],   // strong yellow-orange push
    grain: 0, grainSize: 1.0,
    vignette: 0.20,
    lightLeak: 0, lightLeakVariant: 0, haze: 0, halation: 0, stamp: 4,
  },

  // ── Expired ─────────────────────────────────────────────────────────────────
  // 10-20 year old film. Magenta/yellow dye layers fade faster than cyan layer.
  // Net result: red-magenta colour fog, low contrast, heavy base fog.
  // Canister damage / heat exposure = light leaks. High grain from accelerated dye decay.
  {
    id: "expired", label: "Expired",
    cssPreview: "sepia(50%) saturate(52%) brightness(118%) contrast(76%)",
    lutR: buildLUT(0.10, 1.02, 0.98, 0.80),   // heavy red fog lift
    lutG: buildLUT(0.06, 0.97, 0.88, 0.79),   // green dye faded
    lutB: buildLUT(0.06, 0.95, 0.85, 0.80),   // blue dye faded
    saturation: 0.60,
    shadowTint:    [ 0.059,  0.008,  0.043],   // red-magenta base fog
    highlightTint: [ 0.031,  0.004,  0.024],
    grain: 0.20, grainSize: 2.8,
    vignette: 0.28,
    lightLeak: 0.40, lightLeakVariant: 1, haze: 0.10, halation: 0.22, stamp: 5,
  },

  // ── Lomo LC-A ───────────────────────────────────────────────────────────────
  // Minitar-1 32mm f/2.8 plastic lens — extreme corner vignette (r⁴ falloff).
  // Oversaturated, cool blue shadows vs warm centre, imprecise exposure.
  // Cheap spring-loaded back = frequent light leaks from both edges (double leak).
  {
    id: "lomo", label: "Lomo",
    cssPreview: "saturate(142%) contrast(116%) brightness(93%)",
    lutR: buildLUT(0.01, 1.03, 1.01, 1.15),
    lutG: buildLUT(0.01, 1.01, 0.98, 1.12),
    lutB: buildLUT(0.02, 1.04, 1.02, 1.13),
    saturation: 1.24,
    shadowTint:    [-0.027, -0.010,  0.039],   // cool blue-teal corners
    highlightTint: [ 0.031,  0.014, -0.018],   // warm bright centre
    grain: 0.06, grainSize: 1.6,
    vignette: 0.68,                             // extreme — Minitar-1 plastic lens
    lightLeak: 0.34, lightLeakVariant: 4, haze: 0, halation: 0, stamp: 6,
  },

  // ── Polaroid SX-70 ──────────────────────────────────────────────────────────
  // Integral peel-apart chemistry. Diffusion transfer: dyes migrate through reagent layer.
  // Signature milky haze (protective opacifier), warm cast, crushed contrast.
  // Highlights clip early; blacks are never deep. The dreamy photobooth staple.
  {
    id: "polaroid", label: "Polaroid",
    cssPreview: "sepia(15%) brightness(110%) saturate(85%) contrast(92%)",
    lutR: buildLUT(0.04, 1.06, 1.02, 0.92),
    lutG: buildLUT(0.03, 1.03, 0.99, 0.92),
    lutB: buildLUT(0.02, 0.95, 0.88, 0.92),
    saturation: 0.88,
    shadowTint:    [ 0.020,  0.006, -0.004],
    highlightTint: [ 0.025,  0.012, -0.008],
    grain: 0.06, grainSize: 1.4,
    vignette: 0.10,
    lightLeak: 0, lightLeakVariant: 0, haze: 0.08, halation: 0.18, stamp: 7,
    borderVariant: 2,
  },

  // ── Cinestill 800T ──────────────────────────────────────────────────────────
  // Kodak Vision3 500T motion-picture film re-spooled without remjet layer.
  // Tungsten-balanced (3200K) shot in daylight → warm-orange cast throughout.
  // Without remjet, bright highlights bloom red-orange (halation).
  // The signature look of lo-fi night/portrait photography. Very Gen-Z.
  {
    id: "cinestill", label: "Cinestill",
    cssPreview: "sepia(35%) saturate(118%) brightness(102%) contrast(108%)",
    lutR: buildLUT(0.02, 1.05, 1.07, 1.10),   // push reds hard (tungsten daylight)
    lutG: buildLUT(0.01, 1.00, 0.97, 1.08),
    lutB: buildLUT(0.01, 0.91, 0.80, 1.06),   // hard blue cut → orange cast
    saturation: 1.08,
    shadowTint:    [ 0.024, -0.004,  0.020],   // warm-magenta in shadows
    highlightTint: [ 0.043,  0.010, -0.027],   // orange highlight push
    grain: 0.12, grainSize: 2.8,
    vignette: 0.28,
    lightLeak: 0, lightLeakVariant: 0, haze: 0, halation: 0.48, stamp: 8,
  },

  // ── Tri-X B&W ───────────────────────────────────────────────────────────────
  // Kodak Tri-X 400 — the street photographer's film since 1954.
  // High contrast, deep blacks, crisp grain that clumps in midtones.
  // Pushed to 1600 ISO look: crushed shadows, blown highlights, gritty grain.
  {
    id: "trix", label: "Tri-X",
    cssPreview: "grayscale(100%) contrast(124%) brightness(91%)",
    lutR: buildLUT(0.00, 1.04, 1.00, 1.20),
    lutG: buildLUT(0.00, 1.02, 1.00, 1.18),
    lutB: buildLUT(0.00, 1.00, 1.00, 1.18),
    saturation: 0,
    shadowTint:    [0,0,0], highlightTint: [0,0,0],
    grain: 0.19, grainSize: 2.4,
    vignette: 0.26,
    lightLeak: 0, lightLeakVariant: 0, haze: 0, halation: 0, stamp: 9,
  },

  // ── 90s Golden (Premium Point & Shoot) ──────────────────────────────────────
  // Emulating the highly coveted Olympus Stylus Epic / Contax T2 look with Portra.
  // Flattering skin rendering, soft golden warmth, creamy highlight roll-off,
  // beautiful highlight bloom, fine authentic grain, and clean analog date stamp.
  {
    id: "nineties_golden", label: "90s Golden",
    cssPreview: "sepia(15%) saturate(110%) brightness(105%) contrast(98%)",
    lutR: buildLUT(0.04, 1.05, 1.03, 0.96),
    lutG: buildLUT(0.03, 1.02, 1.00, 0.95),
    lutB: buildLUT(0.02, 0.95, 0.90, 0.95),
    saturation: 1.08,
    shadowTint:    [ 0.025,  0.010, -0.010],
    highlightTint: [ 0.020,  0.010, -0.005],
    grain: 0.10, grainSize: 1.6,
    vignette: 0.22,
    lightLeak: 0, lightLeakVariant: 0, haze: 0.02, halation: 0.28, stamp: 1,
  },

  // ── 90s Scan (Classic Analog Frame) ─────────────────────────────────────────
  // Authentic uncropped lab scan aesthetic complete with physical film frame border.
  // Deep warm blacks, crisp midtone definition, and highly stylized overall vibe.
  {
    id: "nineties_scan", label: "90s Scan",
    cssPreview: "saturate(105%) contrast(105%) brightness(102%)",
    lutR: buildLUT(0.03, 1.03, 1.01, 1.04),
    lutG: buildLUT(0.02, 1.01, 1.00, 1.03),
    lutB: buildLUT(0.02, 0.98, 0.95, 1.03),
    saturation: 1.02,
    shadowTint:    [ 0.015,  0.005, -0.005],
    highlightTint: [ 0.015,  0.005,  0.000],
    grain: 0.12, grainSize: 1.8,
    vignette: 0.15,
    lightLeak: 0, lightLeakVariant: 0, haze: 0, halation: 0.20, stamp: 2,
    borderVariant: 1,
  },

  // ── 90s Cinema (Letterbox Strip) ────────────────────────────────────────────
  // Vintage cinematic aesthetic with sleek top and bottom black border bars.
  // Punchy lighting curves, warm glowing highlights, and bottom edge light leak.
  {
    id: "nineties_cinema", label: "90s Cinema",
    cssPreview: "saturate(115%) contrast(110%) brightness(100%)",
    lutR: buildLUT(0.02, 1.04, 1.02, 1.08),
    lutG: buildLUT(0.01, 1.01, 0.99, 1.06),
    lutB: buildLUT(0.01, 0.96, 0.92, 1.06),
    saturation: 1.12,
    shadowTint:    [-0.010,  0.005,  0.015],
    highlightTint: [ 0.030,  0.010, -0.015],
    grain: 0.14, grainSize: 2.0,
    vignette: 0.30,
    lightLeak: 0.20, lightLeakVariant: 3, haze: 0.01, halation: 0.35, stamp: 8,
    borderVariant: 3,
  },
];

export const FILTER_MAP = Object.fromEntries(FILTERS.map((f) => [f.id, f]));
