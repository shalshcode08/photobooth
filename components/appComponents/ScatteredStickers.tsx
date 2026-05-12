"use client";

import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";

// Compositional plan — five stickers, three weight classes, asymmetric balance:
//
//   hero (1)    : the eye-anchor — large, top-left, strongest shadow
//   counter (1) : diagonal mirror of the hero — bottom-right
//   support (1) : mid-edge filler, medium weight
//   accents (2) : small punctuation, diagonally opposite from each other
//
// Each sticker has its own parallax depth (closer = stronger response to mouse,
// crisper shadow) so the page reads as a layered space instead of a flat sheet.
type StickerSpec = {
  src: string;
  pos: { top?: string; bottom?: string; left?: string; right?: string };
  w: number;
  rot: number;
  parallax: number;        // 0..1 — depth (1 = closest)
  opacity: number;         // base opacity (accents recede slightly)
  shadow: string;          // drop-shadow CSS for layered depth
};

const STICKERS: StickerSpec[] = [
  // hero
  {
    src: "/stickers/look-here.svg",
    pos: { top: "8%", left: "3%" },
    w: 144, rot: -13,
    parallax: 1.0, opacity: 0.95,
    shadow: "0 14px 28px rgba(20,12,8,0.18), 0 4px 8px rgba(20,12,8,0.08)",
  },
  // counter-hero (diagonal mirror)
  {
    src: "/stickers/say.svg",
    pos: { bottom: "12%", right: "3.5%" },
    w: 112, rot: 16,
    parallax: 0.82, opacity: 0.93,
    shadow: "0 10px 22px rgba(20,12,8,0.15), 0 3px 7px rgba(20,12,8,0.07)",
  },
  // mid-left support
  {
    src: "/stickers/baddie.svg",
    pos: { top: "45%", left: "2.5%" },
    w: 86, rot: 9,
    parallax: 0.58, opacity: 0.86,
    shadow: "0 7px 16px rgba(20,12,8,0.13), 0 2px 4px rgba(20,12,8,0.06)",
  },
  // top-right accent
  {
    src: "/stickers/chic.svg",
    pos: { top: "9%", right: "4%" },
    w: 64, rot: 18,
    parallax: 0.38, opacity: 0.80,
    shadow: "0 4px 10px rgba(20,12,8,0.11)",
  },
  // bottom-left accent
  {
    src: "/stickers/a-very-nice.svg",
    pos: { bottom: "13%", left: "4%" },
    w: 62, rot: -19,
    parallax: 0.32, opacity: 0.78,
    shadow: "0 4px 10px rgba(20,12,8,0.11)",
  },
];

// Mouse-position driven parallax, smoothed by spring. Hooks live per-sticker
// so we can call useTransform in a stable order.
function Sticker({
  s, index, mx, my,
}: {
  s: StickerSpec;
  index: number;
  mx: MotionValue<number>;
  my: MotionValue<number>;
}) {
  // Closer stickers respond more strongly than distant accents.
  const px = useTransform(mx, (v) => -v * s.parallax * 9);
  const py = useTransform(my, (v) => -v * s.parallax * 6);

  return (
    <motion.div
      className="pointer-events-none fixed z-10 hidden lg:block"
      style={s.pos}
      // Slap-on entrance: drop from above with a rotation overshoot, settle
      // into final tilt. Staggered so they look placed one-by-one, not stamped.
      initial={{ opacity: 0, scale: 0.55, rotate: s.rot - 22, y: -18 }}
      animate={{ opacity: s.opacity, scale: 1, rotate: s.rot, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 210,
        damping: 15,
        mass: 0.85,
        delay: 0.25 + index * 0.13,
      }}
    >
      <motion.div
        style={{
          x: px,
          y: py,
          filter: `drop-shadow(${s.shadow})`,
        }}
      >
        <Image
          src={s.src}
          alt=""
          width={s.w}
          height={s.w}
          style={{ width: s.w, height: "auto", display: "block" }}
          priority={index < 2}
        />
      </motion.div>
    </motion.div>
  );
}

export default function ScatteredStickers() {
  // Normalized mouse position in [-1, 1]. Springs smooth raw movement so the
  // parallax doesn't jitter on fast cursor flicks.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 55, damping: 18, mass: 0.6 });
  const smy = useSpring(my, { stiffness: 55, damping: 18, mass: 0.6 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  return (
    <>
      {STICKERS.map((s, i) => (
        <Sticker key={`${s.src}-${i}`} s={s} index={i} mx={smx} my={smy} />
      ))}
    </>
  );
}
