"use client";

import { motion } from "framer-motion";
import Image from "next/image";

// Four small corner stickers. "Pressed to the wall" comes from a tight
// directional drop-shadow (offset down-right, suggesting light from top-left)
// plus a 0-radius edge shadow that crisps the paper outline. No drag, no
// parallax, no idle motion — they settle in once and stay put.
type StickerSpec = {
  src: string;
  pos: { top?: string; bottom?: string; left?: string; right?: string };
  w: number;
  rot: number;
};

const STICKERS: StickerSpec[] = [
  { src: "/stickers/look-here.svg",
    pos: { top: "9%",    left:  "3%"   }, w: 72, rot: -7 },
  { src: "/stickers/chic.svg",
    pos: { top: "11%",   right: "4%"   }, w: 50, rot:  9 },
  { src: "/stickers/say.svg",
    pos: { bottom: "15%", right: "3.5%" }, w: 64, rot: 11 },
  { src: "/stickers/a-very-nice.svg",
    pos: { bottom: "15%", left:  "4%"   }, w: 48, rot: -9 },
];

export default function ScatteredStickers() {
  return (
    <>
      {STICKERS.map((s, i) => (
        <motion.div
          key={`${s.src}-${i}`}
          className="pointer-events-none fixed z-10 hidden lg:block"
          style={{
            ...s.pos,
            filter:
              "drop-shadow(1.5px 2.5px 1.5px rgba(60,40,20,0.28)) drop-shadow(0 0 0.5px rgba(40,28,14,0.45))",
          }}
          initial={{ opacity: 0, scale: 0.9, rotate: s.rot - 4 }}
          animate={{ opacity: 1, scale: 1, rotate: s.rot }}
          transition={{
            type: "spring",
            stiffness: 260,
            damping: 24,
            mass: 0.55,
            delay: 0.25 + i * 0.07,
          }}
        >
          <Image
            src={s.src}
            alt=""
            width={s.w}
            height={s.w}
            style={{ width: s.w, height: "auto", display: "block" }}
          />
        </motion.div>
      ))}
    </>
  );
}
