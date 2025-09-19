import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  isDarkMode: boolean;
  primaryColor: string;
  accentColor: string;
  toggleTheme: () => void;
  setDarkMode: (isDark: boolean) => void;
  setPrimaryColor: (color: string) => void;
  setAccentColor: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: true,
      primaryColor: '#2196f3',
      accentColor: '#f50057',
      toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      setDarkMode: (isDark) => set({ isDarkMode: isDark }),
      setPrimaryColor: (color) => set({ primaryColor: color }),
      setAccentColor: (color) => set({ accentColor: color }),
    }),
    {
      name: 'theme-storage',
    }
  )
);
