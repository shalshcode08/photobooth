"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { VideoIcon, VideoOffIcon } from "lucide-react";
import Image from "next/image";
import { useCameraStore } from "@/store/cameraStore";
import FilterSelector from "@/components/appComponents/FilterSelector";

export default function BoothCamera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { enabled, setEnabled } = useCameraStore();
  const [flashing, setFlashing] = useState(false);
  const [ripple, setRipple] = useState(0);

  const handleCapture = useCallback(() => {
    new Audio("/sound/camera-sound.mp3").play();
    setFlashing(true);
    setRipple((n) => n + 1);
    setTimeout(() => setFlashing(false), 350);
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setEnabled(true);
    } catch {
      // permission denied or no camera
    }
  }, [setEnabled]);

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
    setEnabled(false);
  }, [setEnabled]);

  // Auto-start if camera was already enabled before navigating here
  useEffect(() => {
    if (enabled) startCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6">
      <div className="relative w-full max-w-lg">
        <Image
          src="/stickers/look-here.svg"
          alt="Look Here"
          width={100}
          height={100}
          className="absolute -top-2 -left-28 z-10 hidden w-40 -rotate-12 drop-shadow-md md:block"
        />
        <Image
          src="/stickers/say.svg"
          alt="Say Cheese"
          width={100}
          height={100}
          className="absolute bottom-30 -right-32 z-10 hidden w-36 rotate-12 drop-shadow-md md:block"
        />
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover [-webkit-transform:scaleX(-1)] [transform:scaleX(-1)]"
          />
          {!enabled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoOffIcon className="h-10 w-10 text-muted-foreground opacity-40" />
            </div>
          )}
          <AnimatePresence>
            {flashing && (
              <motion.div
                key="flash"
                className="pointer-events-none absolute inset-0 bg-white"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          <Button
            variant={enabled ? "destructive" : "default"}
            size="icon"
            onClick={enabled ? stopCamera : startCamera}
            className="absolute bottom-3 right-3"
          >
            {enabled ? (
              <VideoOffIcon className="h-4 w-4" />
            ) : (
              <VideoIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <FilterSelector />

      <button
        onClick={handleCapture}
        className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-[#C8390A] shadow-[0_4px_20px_rgba(200,57,10,0.5)] ring-4 ring-[#C8390A]/30 transition-transform active:scale-95"
      >
        <AnimatePresence>
          {ripple > 0 && (
            <motion.span
              key={ripple}
              className="pointer-events-none absolute inset-0 rounded-full bg-[#C8390A]"
              initial={{ scale: 1, opacity: 0.6 }}
              animate={{ scale: 2.4, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            />
          )}
        </AnimatePresence>
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="1"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 drop-shadow-sm"
        >
          <path d="M21.4155 15.3411C18.5924 17.3495 14.8895 17.5726 11.877 16M2.58445 8.65889C5.41439 6.64566 9.12844 6.42638 12.1448 8.01149M15.3737 14.1243C18.2604 12.305 19.9319 8.97413 19.601 5.51222M8.58184 9.90371C5.72231 11.7291 4.06959 15.0436 4.39878 18.4878M15.5269 10.137C15.3939 6.72851 13.345 3.61684 10.1821 2.17222M8.47562 13.9256C8.63112 17.3096 10.6743 20.392 13.8177 21.8278M19.071 4.92893C22.9763 8.83418 22.9763 15.1658 19.071 19.071C15.1658 22.9763 8.83416 22.9763 4.92893 19.071C1.02369 15.1658 1.02369 8.83416 4.92893 4.92893C8.83418 1.02369 15.1658 1.02369 19.071 4.92893ZM14.8284 9.17157C16.3905 10.7337 16.3905 13.2663 14.8284 14.8284C13.2663 16.3905 10.7337 16.3905 9.17157 14.8284C7.60948 13.2663 7.60948 10.7337 9.17157 9.17157C10.7337 7.60948 13.2663 7.60948 14.8284 9.17157Z" />
        </svg>
      </button>
    </div>
  );
}
