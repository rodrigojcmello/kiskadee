import { useEffect, useState } from 'react';
import { FONT_STORAGE_KEY, FONTS } from '../registry/fonts.registry';

export function useFontPreference() {
  const [fontName, setFontName] = useState('system');

  // 1. Load initial font preference from localStorage (if available)
  useEffect(() => {
    try {
      const saved = localStorage.getItem(FONT_STORAGE_KEY);
      if (saved && FONTS.some((f) => f.key === saved)) {
        setFontName(saved);
      }
    } catch {
      // Silently ignore environments without localStorage
    }
  }, []);

  // 2. Apply font to document and persist preference whenever it changes
  useEffect(() => {
    const font = FONTS.find((f) => f.key === fontName) ?? FONTS[0];

    document.documentElement.style.setProperty('--k-font-name', font.family);

    try {
      localStorage.setItem(FONT_STORAGE_KEY, font.key);
    } catch {
      // Silently ignore persistence errors
    }
  }, [fontName]);

  return { fontName, setFontName } as const;
}
