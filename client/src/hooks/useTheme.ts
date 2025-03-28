import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type ThemeData = {
  theme: 'light' | 'dark';
  toggleTheme: (mode: 'light' | 'dark') => void;
};

const useTheme = create<ThemeData>()(
  persist(
    set => ({
      theme: 'light',
      toggleTheme: (theme: 'dark' | 'light') => set({ theme: theme }),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useTheme;
