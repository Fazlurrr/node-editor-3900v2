import { create } from 'zustand';

interface ModeState {
  mode: string;
  setMode: (mode: 'move' | 'transform' | 'relation') => void;
}

export const useMode = create<ModeState>((set) => ({
  mode: 'move',
  setMode: (mode: 'move' | 'transform' | 'relation') => set({ mode }),
}));
