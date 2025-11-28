'use client';
import { KiskadeeContext } from '@kiskadee/react-components';
import { useEffect, useState } from 'react';
import { designSystemMeta } from './registry/design-systems.registry';
import { FONTS, FONT_STORAGE_KEY } from './registry/fonts.registry';
import { useClassMapLoader } from './hooks/use-class-map-loader';
import { useDesignSystemSelection } from './hooks/use-design-system-selection';
import { useGlobalThemeClasses } from './hooks/use-global-theme-classes';
import { useStylesheetManager } from './hooks/use-stylesheet-manager';
import { useThemeExtras } from './hooks/use-theme-extras';

// Client-side provider that mirrors legacy App.tsx/main.tsx responsibilities
// Refactored to use custom hooks for separation of concerns.

export function Providers({ children }: { children: React.ReactNode }) {
  // 1. Manage selection state (designSystem, segment, theme) and persistence
  const {
    designSystem,
    segment,
    theme,
    setDesignSystem,
    setSegment,
    setTheme,
    availableSegments,
    availableThemes,
    designSystemKeys
  } = useDesignSystemSelection();

  // 2. Load class maps (core + palette) dynamically
  const classesMap = useClassMapLoader({ designSystem, segment, theme });

  // 3. Load extra resources (background colors, focus ring)
  const { backgroundsByTheme } = useThemeExtras({ designSystem, segment, theme });

  // 4. Manage global CSS and stylesheet injection (side-effects)
  useStylesheetManager({ designSystem, segment, theme });
  useGlobalThemeClasses(theme);

  // 5. Font Management
  const [fontName, setFontName] = useState('system');

  useEffect(() => {
    // Initial load
    try {
      const saved = localStorage.getItem(FONT_STORAGE_KEY);
      if (saved && FONTS.some((f) => f.key === saved)) {
        setFontName(saved);
      }
    } catch {}
  }, []);

  useEffect(() => {
    const font = FONTS.find((f) => f.key === fontName) ?? FONTS[0];
    document.documentElement.style.setProperty('--k-font-name', font.family);
    try {
      localStorage.setItem(FONT_STORAGE_KEY, font.key);
    } catch {}
  }, [fontName]);

  return (
    <KiskadeeContext.Provider
      value={{
        classesMap,
        segment,
        theme,
        setSegment,
        setTheme,
        designSystem: String(designSystem),
        setDesignSystem: (v) => setDesignSystem(v),
        designSystemKeys,
        designSystemMeta,
        availableSegments,
        availableThemes,
        backgroundsByTheme,
        fontName,
        setFontName
      }}
    >
      {children}
    </KiskadeeContext.Provider>
  );
}
