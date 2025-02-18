import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'dim' | 'cream';
export type Font = 'sans' | 'montserrat' | 'roboto-mono' | 'courier-prime';
export type Difficulty = 'normal' | 'hard' | 'extra-hard' | 'suicide';

interface ThemeState {
  theme: Theme;
  font: Font;
  difficulty: Difficulty;
  isFullscreen: boolean;
  setTheme: (theme: Theme) => void;
  setFont: (font: Font) => void;
  setDifficulty: (difficulty: Difficulty) => void;
  setIsFullscreen: (isFullscreen: boolean) => void;
  toggleFullscreen: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      font: 'sans',
      difficulty: 'normal',
      isFullscreen: false,
      setTheme: (theme) => set({ theme }),
      setFont: (font) => set({ font }),
      setDifficulty: (difficulty) => set({ difficulty }),
      setIsFullscreen: (isFullscreen) => set({ isFullscreen }),
      toggleFullscreen: async () => {
        if (!document.fullscreenElement) {
          await document.documentElement.requestFullscreen();
          set({ isFullscreen: true });
        } else {
          await document.exitFullscreen();
          set({ isFullscreen: false });
        }
      },
    }),
    {
      name: 'theme-storage',
    }
  )
);