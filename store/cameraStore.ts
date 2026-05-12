import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CameraStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  photos: string[];
  addPhoto: (dataUrl: string) => void;
  removePhoto: (index: number) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const useCameraStore = create<CameraStore>()(
  persist(
    (set) => ({
      enabled: false,
      setEnabled: (enabled) => set({ enabled }),
      photos: [],
      addPhoto: (dataUrl) => set((s) => ({ photos: [...s.photos, dataUrl] })),
      removePhoto: (index) => set((s) => ({ photos: s.photos.filter((_, i) => i !== index) })),
      activeFilter: "",
      setActiveFilter: (filter) => set({ activeFilter: filter }),
    }),
    {
      name: "camera-store",
      // only persist enabled and activeFilter — photos are large data URLs, keep in-memory only
      partialize: (state) => ({ enabled: state.enabled, activeFilter: state.activeFilter }),
    },
  ),
);
