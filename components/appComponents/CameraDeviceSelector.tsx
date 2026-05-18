"use client";

import { useEffect, useState } from "react";
import { ChevronDownIcon, VideoIcon } from "lucide-react";
import { useCameraStore } from "@/store/cameraStore";
import { cn } from "@/lib/utils";

function deviceLabel(device: MediaDeviceInfo, index: number) {
  if (device.label) return device.label;
  return `Camera ${index + 1}`;
}

export default function CameraDeviceSelector({
  className,
}: {
  className?: string;
}) {
  const { videoDeviceId, setVideoDeviceId, enabled } = useCameraStore();
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  // Enumerate available video inputs. Labels are only populated after the user
  // has granted camera permission, so we re-enumerate when `enabled` flips on
  // and whenever the device list changes (USB cam plugged in / removed).
  useEffect(() => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices) return;

    let cancelled = false;

    const refresh = async () => {
      try {
        const all = await navigator.mediaDevices.enumerateDevices();
        if (cancelled) return;
        setDevices(all.filter((device) => device.kind === "videoinput"));
      } catch {
        // ignore — most likely a denied permission, the UI will hide itself
      }
    };

    refresh();
    navigator.mediaDevices.addEventListener?.("devicechange", refresh);

    return () => {
      cancelled = true;
      navigator.mediaDevices.removeEventListener?.("devicechange", refresh);
    };
  }, [enabled]);

  if (devices.length === 0) return null;

  const activeIndex = Math.max(
    devices.findIndex((d) => d.deviceId === videoDeviceId),
    0,
  );
  const active = devices[activeIndex];
  const activeLabel = deviceLabel(active, activeIndex);
  const hasMultiple = devices.length > 1;

  return (
    <div
      className={cn(
        "relative inline-flex max-w-[min(80vw,14rem)] items-center gap-1.5 rounded-full border border-border/30 bg-background/35 px-2.5 py-1 text-[11px] font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:bg-background/60 hover:text-foreground sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs",
        className,
      )}
    >
      <VideoIcon className="h-3.5 w-3.5 shrink-0 opacity-70 sm:h-4 sm:w-4" />
      <span className="truncate" title={activeLabel}>
        {activeLabel}
      </span>
      {hasMultiple && (
        <ChevronDownIcon className="h-3 w-3 shrink-0 opacity-60 sm:h-3.5 sm:w-3.5" />
      )}
      {hasMultiple && (
        <select
          value={active.deviceId}
          onChange={(event) => setVideoDeviceId(event.target.value)}
          aria-label="Select camera"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
        >
          {devices.map((device, index) => (
            <option key={device.deviceId} value={device.deviceId}>
              {deviceLabel(device, index)}
            </option>
          ))}
        </select>
      )}
    </div>
  );
}
