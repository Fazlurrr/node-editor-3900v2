import { create } from 'zustand';

interface TransformModeState {
  transformMode: boolean;
  setTransformMode: (enabled: boolean) => void;
}

export const useTransformMode = create<TransformModeState>((set) => ({
  transformMode: false,
  setTransformMode: (enabled) => set({ transformMode: enabled }),
}));
