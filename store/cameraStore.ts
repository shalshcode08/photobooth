import { create } from "zustand";

interface CameraStore {
  enabled: boolean;
  setEnabled: (enabled: boolean) => void;
}

export const useCameraStore = create<CameraStore>((set) => ({
  enabled: false,
  setEnabled: (enabled) => set({ enabled }),
}));
