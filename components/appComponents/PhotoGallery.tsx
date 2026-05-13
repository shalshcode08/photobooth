"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconArrowLeft, IconArrowRight } from "@tabler/icons-react";
import { useCameraStore } from "@/store/cameraStore";
import { Trash2 } from "lucide-react";
function randomRotate(seed: number) {
  // deterministic tilt per card index so it doesn't re-randomise on re-render
  return ((seed * 7 + 3) % 21) - 10;
}

export default function PhotoGallery({ compact = false }: { compact?: boolean }) {
  const photos = useCameraStore((s) => s.photos);
  const removePhoto = useCameraStore((s) => s.removePhoto);
  const [active, setActive] = useState(0);

  // Always show the latest photo when a new one is captured
  useEffect(() => {
    if (photos.length === 0) return;

    const frame = requestAnimationFrame(() => {
      setActive(photos.length - 1);
    });

    return () => cancelAnimationFrame(frame);
  }, [photos.length]);

  const handleNext = () => setActive((p) => (p + 1) % photos.length);
  const handlePrev = () => setActive((p) => (p - 1 + photos.length) % photos.length);

  const safeActive = photos.length > 0 ? active % photos.length : 0;

  return (
    <div className={compact ? "flex w-full items-center justify-center gap-3 px-3 py-2 sm:px-4" : "flex w-full flex-col items-center justify-center gap-4 p-6 lg:w-80 lg:shrink-0"}>
      {photos.length > 0 && (
        <>
          <div className={compact ? "relative h-24 w-20 shrink-0 sm:h-28 sm:w-24" : "relative h-64 w-full"}>
            <AnimatePresence>
              {photos.map((src, index) => (
                <motion.div
                  key={src + index}
                  initial={{ opacity: 0, scale: 0.9, rotate: randomRotate(index) }}
                  animate={{
                    opacity: index === safeActive ? 1 : 0.6,
                    scale: index === safeActive ? 1 : 0.94,
                    rotate: index === safeActive ? 0 : randomRotate(index),
                    zIndex: index === safeActive ? 40 : photos.length + 2 - index,
                    y: index === safeActive ? [0, -16, 0] : 0,
                  }}
                  exit={{ opacity: 0, scale: 0.9, rotate: randomRotate(index) }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="absolute inset-0 origin-bottom"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={src}
                    alt={`Photo ${index + 1}`}
                    draggable={false}
                    className="h-full w-full rounded-2xl object-cover object-center shadow-md"
                  />
                  {index === safeActive && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        removePhoto(index);
                        setActive((p) => Math.max(0, p - 1));
                      }}
                      aria-label={`Delete photo ${index + 1}`}
                      className="absolute top-2 right-2 flex h-10 w-10 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm transition-opacity hover:bg-black/70 sm:h-8 sm:w-8 lg:h-7 lg:w-7"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          </div>

          <div className={compact ? "flex flex-col items-center gap-1" : "flex w-full items-center justify-between"}>
            <span className="text-xs text-muted-foreground">
              {safeActive + 1} / {photos.length}
            </span>
            <div className="flex gap-1.5">
              <button
                onClick={handlePrev}
                aria-label="Previous photo"
                className="group/btn flex h-11 w-11 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted-foreground/20 sm:h-8 sm:w-8 lg:h-7 lg:w-7"
              >
                <IconArrowLeft className="h-3.5 w-3.5 text-foreground transition-transform duration-200 group-hover/btn:rotate-12" />
              </button>
              <button
                onClick={handleNext}
                aria-label="Next photo"
                className="group/btn flex h-11 w-11 items-center justify-center rounded-full bg-muted transition-colors hover:bg-muted-foreground/20 sm:h-8 sm:w-8 lg:h-7 lg:w-7"
              >
                <IconArrowRight className="h-3.5 w-3.5 text-foreground transition-transform duration-200 group-hover/btn:-rotate-12" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
