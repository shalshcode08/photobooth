"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRightIcon, TimerIcon, VideoIcon, VideoOffIcon, ZapIcon, ZapOffIcon } from "lucide-react";
import { MAX_PHOTOS, useCameraStore } from "@/store/cameraStore";
import FilterSelector from "@/components/appComponents/FilterSelector";
import PrintLayoutModal from "@/components/appComponents/PrintLayoutModal";
import CameraDeviceSelector from "@/components/appComponents/CameraDeviceSelector";
import P5VideoFilter, {
  type P5FilterHandle,
} from "@/components/appComponents/P5VideoFilter";
import { Modal, useModal } from "@/components/ui/animated-modal";
import { FILTER_MAP } from "@/lib/filters";

const BURST_SHOTS    = 4;
const BURST_INTERVAL = 5; // seconds between shots

// Shutter button. Lives inside <Modal> so it can open the print-layout modal
// when the user has filled the 4-photo quota. The visible inner icon swaps
// from the aperture-shutter SVG to a right-arrow with a small crossfade.
function ShutterButton({
  mode,
  onCapture,
  disabled,
  ripple,
}: {
  mode: "capture" | "proceed";
  onCapture: () => void;
  disabled: boolean;
  ripple: number;
}) {
  const { setOpen } = useModal();
  const handleClick = mode === "proceed" ? () => setOpen(true) : onCapture;
  const isCapture   = mode === "capture";

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled}
      aria-label={isCapture ? "Capture photo" : "Continue to print"}
      className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-[#C8390A] shadow-[0_4px_20px_rgba(200,57,10,0.5)] ring-4 ring-[#C8390A]/30 transition-transform active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:ring-transparent"
    >
      <AnimatePresence>
        {isCapture && ripple > 0 && (
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

      <AnimatePresence mode="wait" initial={false}>
        {isCapture ? (
          <motion.svg
            key="shutter"
            initial={{ opacity: 0, scale: 0.6, rotate: 25 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 0.6, rotate: -25 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
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
          </motion.svg>
        ) : (
          <motion.span
            key="proceed"
            initial={{ opacity: 0, scale: 0.55, x: -8 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.55, x: 8 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className="flex items-center justify-center"
          >
            <ArrowRightIcon className="h-7 w-7 text-white drop-shadow-sm" strokeWidth={2.5} />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

function stopMediaStream(stream: MediaStream | null) {
  if (!stream) return;

  stream.getTracks().forEach((track) => {
    track.enabled = false;
    track.stop();
    stream.removeTrack(track);
  });
}

function releaseVideoStream(video: HTMLVideoElement | null) {
  if (!video) return;

  if (video.srcObject instanceof MediaStream) {
    stopMediaStream(video.srcObject);
  }

  video.pause();
  video.srcObject = null;
  video.removeAttribute("src");
  video.load();
}

export default function BoothCamera() {
  const videoRef      = useRef<HTMLVideoElement>(null);
  const streamRef     = useRef<MediaStream | null>(null);
  const filterRef     = useRef<P5FilterHandle>(null);
  const burstIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  // Camera lifecycle guards
  const startingRef   = useRef(false);   // true while getUserMedia is in-flight
  const wantCameraRef = useRef(false);   // flipped to false by stopCamera so an
                                         // in-flight getUserMedia aborts on resolve

  const { enabled, setEnabled, activeFilterId, addPhoto, photos, flashEnabled, setFlashEnabled, videoDeviceId, setVideoDeviceId } = useCameraStore();
  const remainingSlots = MAX_PHOTOS - photos.length;
  const atMaxPhotos    = remainingSlots <= 0;
  const [screenFlashPhase, setScreenFlashPhase] = useState<"off"|"hold"|"fade">("off");
  const [shutterFlash, setShutterFlash] = useState(false);
  const [ripple,         setRipple]         = useState(0);
  const [burstActive,    setBurstActive]    = useState(false);
  const [burstShot,      setBurstShot]      = useState(0);      // 1..burstTotal
  const [burstTotal,     setBurstTotal]     = useState(0);      // shots this burst will fire (≤ BURST_SHOTS)
  const [burstCountdown, setBurstCountdown] = useState(0);      // seconds to next shot

  const activeFilter = FILTER_MAP[activeFilterId] ?? FILTER_MAP["none"];

  // ── Raw capture — used by both the manual button and burst mode ─────────────
  const capturePhoto = useCallback(() => {
    new Audio("/sound/camera-sound.mp3").play().catch(() => {});
    setRipple((n) => n + 1);

    if (flashEnabled) {
      // Phase 1: Blast the entire screen white at full brightness
      setScreenFlashPhase("hold");

      // Phase 2: After 300ms of full-white illumination, the webcam sensor has
      // absorbed the light — grab the frame NOW while still lit
      setTimeout(() => {
        const canvas = filterRef.current?.getCanvas();
        if (canvas) addPhoto(canvas.toDataURL("image/jpeg", 0.92));

        // Phase 3: Begin the fade-out
        setScreenFlashPhase("fade");
        setTimeout(() => setScreenFlashPhase("off"), 450);
      }, 300);
    } else {
      // No flash — standard quick shutter animation
      setShutterFlash(true);
      setTimeout(() => setShutterFlash(false), 350);
      const canvas = filterRef.current?.getCanvas();
      if (canvas) addPhoto(canvas.toDataURL("image/jpeg", 0.92));
    }
  }, [addPhoto, flashEnabled]);

  // ── Manual capture (also bound to Space) ────────────────────────────────────
  const handleCapture = useCallback(() => {
    if (!enabled || burstActive || atMaxPhotos) return;
    capturePhoto();
  }, [enabled, burstActive, atMaxPhotos, capturePhoto]);

  // ── Burst: 4 shots, BURST_INTERVAL seconds apart ───────────────────────────
  const cancelBurst = useCallback(() => {
    if (burstIntervalRef.current) {
      clearInterval(burstIntervalRef.current);
      burstIntervalRef.current = null;
    }
    setBurstActive(false);
    setBurstShot(0);
    setBurstTotal(0);
    setBurstCountdown(0);
  }, []);

  const handleBurst = useCallback(() => {
    if (!enabled || burstActive || atMaxPhotos) return;

    // Cap burst at remaining slots so we never overshoot MAX_PHOTOS.
    const shotsToFire = Math.min(BURST_SHOTS, remainingSlots);
    if (shotsToFire <= 0) return;

    setBurstActive(true);
    setBurstTotal(shotsToFire);
    let shot      = 0;
    let countdown = 0;

    const runShot = () => {
      shot++;
      setBurstShot(shot);
      capturePhoto();

      if (shot < shotsToFire) {
        countdown = BURST_INTERVAL;
        setBurstCountdown(countdown);
        burstIntervalRef.current = setInterval(() => {
          countdown--;
          setBurstCountdown(countdown);
          if (countdown <= 0) {
            clearInterval(burstIntervalRef.current!);
            burstIntervalRef.current = null;
            runShot();
          }
        }, 1000);
      } else {
        setBurstActive(false);
        setBurstShot(0);
        setBurstCountdown(0);
        setBurstTotal(0);
      }
    };

    runShot();
  }, [enabled, burstActive, atMaxPhotos, remainingSlots, capturePhoto]);

  // Spacebar → capture only when focus is not already on an interactive control.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== "Space" || e.repeat) return;

      const target = e.target instanceof HTMLElement ? e.target : null;
      const activeElement =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      const interactiveElement = target?.closest(
        "button,a,input,textarea,select,summary,[contenteditable]",
      ) ?? activeElement?.closest(
        "button,a,input,textarea,select,summary,[contenteditable]",
      );

      if (interactiveElement) return;

      e.preventDefault();
      handleCapture();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleCapture]);

  // Cleanup burst timers on unmount
  useEffect(() => () => cancelBurst(), [cancelBurst]);

  // ── Camera start / stop ─────────────────────────────────────────────────────
  const startCamera = useCallback(async () => {
    // Block concurrent calls (React StrictMode double-invoke, rapid toggling)
    if (streamRef.current || startingRef.current) return;
    startingRef.current  = true;
    wantCameraRef.current = true;
    try {
      // Try the saved device first; if it's gone (unplugged, different machine)
      // fall back to any available camera so the user is never left blank.
      const constraints: MediaStreamConstraints = {
        video: videoDeviceId ? { deviceId: { exact: videoDeviceId } } : true,
      };
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
      } catch (error) {
        if (videoDeviceId && error instanceof Error && (error.name === "OverconstrainedError" || error.name === "NotFoundError")) {
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        } else {
          throw error;
        }
      }
      // stopCamera may have been called while we were awaiting — kill the stream
      if (!wantCameraRef.current) {
        stopMediaStream(stream);
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      // Sync the store with the device we actually got so the selector reflects
      // reality (e.g. when no preference was set and the browser picked one).
      const settings = stream.getVideoTracks()[0]?.getSettings();
      if (settings?.deviceId && settings.deviceId !== videoDeviceId) {
        setVideoDeviceId(settings.deviceId);
      }
      setEnabled(true);
    } catch {
      // permission denied or no camera
    } finally {
      startingRef.current = false;
    }
  }, [setEnabled, videoDeviceId, setVideoDeviceId]);

  const stopCamera = useCallback(() => {
    // Signal any in-flight getUserMedia to abort on resolve
    wantCameraRef.current = false;
    cancelBurst();
    stopMediaStream(streamRef.current);
    releaseVideoStream(videoRef.current);
    streamRef.current = null;
    setEnabled(false);
  }, [setEnabled, cancelBurst]);

  // Synchronize camera state with enabled store flag
  useEffect(() => {
    if (enabled) {
      if (!streamRef.current) startCamera();
    } else {
      wantCameraRef.current = false;
      if (streamRef.current) {
        stopMediaStream(streamRef.current);
        releaseVideoStream(videoRef.current);
        streamRef.current = null;
      }
    }
  }, [enabled, startCamera]);

  // When the user picks a different camera, restart the stream against the new
  // device. We compare against the running track's deviceId to skip the no-op
  // case where startCamera just synced the store with the auto-selected device.
  useEffect(() => {
    if (!enabled || !streamRef.current) return;
    const currentDeviceId = streamRef.current
      .getVideoTracks()[0]
      ?.getSettings().deviceId;
    if (currentDeviceId === videoDeviceId) return;
    stopMediaStream(streamRef.current);
    releaseVideoStream(videoRef.current);
    streamRef.current = null;
    startCamera();
  }, [videoDeviceId, enabled, startCamera]);

  // Release camera on unmount (navigation away from the page)
  useEffect(() => () => {
    wantCameraRef.current = false;
    stopMediaStream(streamRef.current);
    releaseVideoStream(videoRef.current);
    streamRef.current = null;
  }, []);

  const captureDisabled = !enabled || burstActive || atMaxPhotos;

  return (
    <div className="flex min-h-0 w-full flex-1 flex-col items-center justify-start gap-3 px-3 py-2 pb-[max(env(safe-area-inset-bottom),0.5rem)] sm:gap-4 sm:p-4 lg:justify-center lg:p-6">

      {/* ── Viewfinder ──────────────────────────────────────────────────────── */}
      <div className="booth-viewfinder-shell relative w-full max-w-lg">

        {/* Camera device selector ── centered row directly above the
            viewfinder on every screen size. */}
        <div className="mb-2 flex justify-center">
          <CameraDeviceSelector />
        </div>

        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg border border-border bg-muted shadow-[0_18px_55px_rgba(64,40,20,0.16)] sm:rounded-xl">
          {/* Raw video — hidden under the p5 canvas overlay */}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="h-full w-full object-cover [-webkit-transform:scaleX(-1)] [transform:scaleX(-1)]"
          />

          {/* p5 filtered canvas */}
          <P5VideoFilter
            ref={filterRef}
            videoRef={videoRef}
            filter={activeFilter}
            active={enabled}
          />

          {/* Camera-off placeholder */}
          {!enabled && (
            <div className="absolute inset-0 flex items-center justify-center">
              <VideoOffIcon className="h-10 w-10 text-muted-foreground opacity-40" />
            </div>
          )}

          {/* Burst countdown overlay */}
          <AnimatePresence>
            {burstActive && burstCountdown > 0 && (
              <motion.div
                key={burstCountdown}
                className="pointer-events-none absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 1 }}
                animate={{ opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeIn" }}
              >
                <span className="text-[6rem] font-bold leading-none text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
                  {burstCountdown}
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shutter flash (no-flash mode only — quick white blink inside viewfinder) */}
          <AnimatePresence>
            {shutterFlash && (
              <motion.div
                key="shutter-flash"
                className="pointer-events-none absolute inset-0 z-20 bg-white"
                initial={{ opacity: 0.9 }}
                animate={{ opacity: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
              />
            )}
          </AnimatePresence>

          {/* ── Screen Flash (portaled to document.body) ────────────────────── */}
          {/* Covers the ENTIRE screen in pure white at max brightness to       */}
          {/* physically illuminate the user's face — exactly like a mobile     */}
          {/* phone selfie flash. Stays solid white during "hold" phase while   */}
          {/* the webcam sensor absorbs light, then fades out smoothly.         */}
          {typeof document !== "undefined" &&
            createPortal(
              <AnimatePresence>
                {screenFlashPhase !== "off" && (
                  <motion.div
                    key="screen-flash"
                    style={{
                      position: "fixed",
                      inset: 0,
                      zIndex: 99999,
                      backgroundColor: "#ffffff",
                      pointerEvents: "none",
                    }}
                    initial={{ opacity: 1 }}
                    animate={{ opacity: screenFlashPhase === "hold" ? 1 : 0 }}
                    exit={{ opacity: 0 }}
                    transition={{
                      duration: screenFlashPhase === "hold" ? 0 : 0.4,
                      ease: "easeOut",
                    }}
                  />
                )}
              </AnimatePresence>,
              document.body,
            )}

          {/* Camera toggle */}
          <Button
            variant={enabled ? "destructive" : "default"}
            size="icon"
            onClick={enabled ? stopCamera : startCamera}
            aria-label={enabled ? "Turn camera off" : "Turn camera on"}
            className="absolute bottom-3 right-3 z-10 size-11 shadow-sm sm:size-8"
          >
            {enabled ? (
              <VideoOffIcon className="h-4 w-4" />
            ) : (
              <VideoIcon className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>{/* end viewfinder container */}

      {/* ── Filter selector + controls (wrapped in Modal provider so the
            shutter can open the print-layout flow once 4 shots are in) ── */}
      <Modal>
      <div className="w-full max-w-lg">
        <FilterSelector />

        {/* ── Controls row ─────────────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-4 pt-2 sm:gap-5">

        {/* Auto-burst button */}
        <div className="group relative">
          <button
            onClick={handleBurst}
            disabled={captureDisabled}
            aria-label="Start automatic burst"
            className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-[#C8390A]/60 bg-background text-[#C8390A] transition-colors hover:bg-[#C8390A]/10 active:scale-95 disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:opacity-40 sm:h-12 sm:w-12"
          >
            {burstActive ? (
              <span className="text-sm font-bold tabular-nums">
                {burstShot}/{burstTotal}
              </span>
            ) : (
              <TimerIcon className="h-5 w-5" />
            )}
          </button>

          {/* Tooltip */}
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Auto: {Math.min(BURST_SHOTS, Math.max(remainingSlots, 0))} shots · {BURST_INTERVAL}s apart
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground" />
          </div>
        </div>

        {/* Shutter button — swaps to "proceed" mode once the 4-photo cap
            is reached, opening the print-layout modal on click. */}
        <ShutterButton
          mode={atMaxPhotos ? "proceed" : "capture"}
          onCapture={handleCapture}
          disabled={!atMaxPhotos && (!enabled || burstActive)}
          ripple={ripple}
        />

        {/* Flash toggle button */}
        <div className="group relative">
          <button
            onClick={() => setFlashEnabled(!flashEnabled)}
            disabled={captureDisabled}
            aria-label={flashEnabled ? "Turn screen flash off" : "Turn screen flash on"}
            className={`flex h-12 w-12 items-center justify-center rounded-full border-2 transition-colors active:scale-95 disabled:cursor-not-allowed disabled:border-border disabled:text-muted-foreground disabled:opacity-40 sm:h-12 sm:w-12 ${
              flashEnabled
                ? "border-[#C8390A] bg-[#C8390A] text-white shadow-sm"
                : "border-[#C8390A]/60 bg-background text-[#C8390A] hover:bg-[#C8390A]/10"
            }`}
          >
            {flashEnabled ? (
              <ZapIcon className="h-5 w-5 fill-current" />
            ) : (
              <ZapOffIcon className="h-5 w-5" />
            )}
          </button>

          {/* Tooltip */}
          <div className="pointer-events-none absolute bottom-full left-1/2 mb-2.5 -translate-x-1/2 whitespace-nowrap rounded-md bg-foreground px-2.5 py-1.5 text-xs text-background opacity-0 shadow-md transition-opacity group-hover:opacity-100">
            Screen Flash: {flashEnabled ? "On" : "Off"}
            <span className="absolute left-1/2 top-full -translate-x-1/2 border-4 border-transparent border-t-foreground" />
          </div>
        </div>

        </div>{/* end controls row */}
      </div>{/* end filter+controls wrapper */}
      <PrintLayoutModal />
      </Modal>

    </div>
  );
}
