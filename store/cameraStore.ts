import { create } from "zustand";

interface CameraStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
  photos: string[];
  addPhoto: (dataUrl: string) => void;
  removePhoto: (index: number) => void;
  activeFilter: string;
  setActiveFilter: (filter: string) => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
  photos: [],
  addPhoto: (dataUrl) => set((s) => ({ photos: [...s.photos, dataUrl] })),
  removePhoto: (index) => set((s) => ({ photos: s.photos.filter((_, i) => i !== index) })),
  activeFilter: "",
  setActiveFilter: (filter) => set({ activeFilter: filter }),
}));
