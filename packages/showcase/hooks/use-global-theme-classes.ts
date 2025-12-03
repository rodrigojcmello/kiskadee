import type { ThemeMode } from '@kiskadee/core/dist';
import { useEffect } from 'react';

export function useGlobalThemeClasses(theme: ThemeMode) {
  // Sync CSS theme classes with current ThemeMode so globals.scss variables apply app-wide.
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    const cssThemeClass = theme === 'light' ? 'light' : 'dark';
    root.classList.add(cssThemeClass);
  }, [theme]);
}
