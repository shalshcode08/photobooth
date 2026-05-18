"use client";

import { useMemo } from "react";
import { useCameraStore } from "@/store/cameraStore";

export function useSelectedPhotos(photoIndices: number[], photoCount: number) {
  const photos = useCameraStore((state) => state.photos);

  return useMemo(() => {
    return Array.from({ length: photoCount }, (_, index) => {
      const photoIndex = photoIndices[index] ?? index;
      return photos[photoIndex] ?? null;
    });
  }, [photoCount, photoIndices, photos]);
}
