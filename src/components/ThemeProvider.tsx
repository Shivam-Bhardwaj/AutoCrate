'use client';

import { useEffect } from 'react';
import { useThemeStore } from '../store/theme-store';

interface ThemeProviderProps {
  children: React.ReactNode;
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const { isDarkMode, isHydrated } = useThemeStore();

  useEffect(() => {
    if (isHydrated) {
      const html = document.documentElement;
      if (isDarkMode) {
        html.classList.add('dark');
        html.setAttribute('data-theme', 'dark');
      } else {
        html.classList.remove('dark');
        html.setAttribute('data-theme', 'light');
      }
    }
  }, [isDarkMode, isHydrated]);

  return <>{children}</>;
}