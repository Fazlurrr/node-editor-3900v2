import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

interface useLocalStorageState {
  firstVisit: boolean;
  setFirstVisit: (firstVisit: boolean) => void;
}

export const useFirstVisit = create<useLocalStorageState>()(
    persist<useLocalStorageState>(
        (set) => ({
          firstVisit: true,
          setFirstVisit: (value: boolean) => set({ firstVisit: value }),
        }),
        {
          name: 'first-visit',
          storage: createJSONStorage(() => localStorage),
        }
      )
);