'use client';
import { KiskadeeContext } from '@kiskadee/react-components';
import { useClassMapLoader } from '@/hooks/use-class-map-loader';
import { useDesignSystemSelection } from '@/hooks/use-design-system-selection';
import { useFontPreference } from '@/hooks/use-font-preference';
import { useGlobalThemeClasses } from '@/hooks/use-global-theme-classes';
import { useStylesheetManager } from '@/hooks/use-stylesheet-manager';
import { useThemeExtras } from '@/hooks/use-theme-extras';
import { designSystemMeta } from '@/registry/design-systems.registry';

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
  const { fontName, setFontName } = useFontPreference();

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
