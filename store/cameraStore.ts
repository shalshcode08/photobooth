import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export const MAX_PHOTOS = 4;

interface CameraStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  photos: string[];
  addPhoto: (dataUrl: string) => void;
  removePhoto: (index: number) => void;
  activeFilterId: string;
  setActiveFilterId: (id: string) => void;
  flashEnabled: boolean;
  setFlashEnabled: (enabled: boolean) => void;
}

export const useCameraStore = create<CameraStore>()(
  persist(
    (set) => ({
      enabled: false,
      setEnabled: (enabled) => set({ enabled }),
      photos: [],
      addPhoto: (dataUrl) =>
        set((s) =>
          s.photos.length >= MAX_PHOTOS
            ? s
            : { photos: [...s.photos, dataUrl] },
        ),
      removePhoto: (index) =>
        set((s) => ({ photos: s.photos.filter((_, i) => i !== index) })),
      activeFilterId: "none",
      setActiveFilterId: (id) => set({ activeFilterId: id }),
      flashEnabled: false,
      setFlashEnabled: (enabled) => set({ flashEnabled: enabled }),
    }),
    {
      name: "camera-store",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        enabled: state.enabled,
        photos: state.photos,
        activeFilterId: state.activeFilterId,
        flashEnabled: state.flashEnabled,
      }),
    },
  ),
);
