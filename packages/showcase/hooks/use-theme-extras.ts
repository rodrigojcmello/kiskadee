import type { ThemeMode } from '@kiskadee/core/dist';
import { useEffect, useState } from 'react';
import { extraMaps, paletteIndex } from '@/registry/design-systems.registry.generated';
import type { DesignSystemKey } from '@/registry/registry-utils';

type BackgroundTones = Partial<Record<ThemeMode, string | undefined>>;

// Cache for focusColor values loaded from extra.<segment>.<theme>.kiskadee.json
const focusRingCache: Partial<Record<string, string>> = {};

export function useThemeExtras({
  designSystem,
  segment,
  theme
}: {
  designSystem: DesignSystemKey;
  segment: string;
  theme: ThemeMode;
}) {
  const [backgroundsByTheme, setBackgroundsByTheme] = useState<BackgroundTones>({});

  // Load focusColor from extra artifacts registry and expose as CSS custom property.
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let cancelled = false;

    const loadFocusRing = async () => {
      const key = `${String(designSystem)}|${segment}|${theme}`;

      // Try cache first
      let hex = focusRingCache[key];

      if (!hex) {
        const loader = extraMaps[key as keyof typeof extraMaps];
        if (loader) {
          try {
            const extra = await loader();
            if (!cancelled && extra?.focusColor) {
              hex = extra.focusColor;
              focusRingCache[key] = hex;
            }
          } catch {
            // Ignore load errors; fallback will be used.
          }
        }
      }

      if (cancelled) return;

      const root = document.documentElement;
      root.style.setProperty('--k-focus-ring-color', hex ?? '#0059b1');
    };

    void loadFocusRing();

    return () => {
      cancelled = true;
    };
  }, [designSystem, segment, theme]);

  // Load background colors for all available themes of the current design system/segment
  // and keep them in memory so they can be consumed later via context.
  useEffect(() => {
    let cancelled = false;

    const loadBackgrounds = async () => {
      const info = paletteIndex[designSystem as keyof typeof paletteIndex];
      if (!info) return;

      const themesMap = info.themesBySegment as unknown as Record<string, readonly ThemeMode[]>;
      const themesForSegment = themesMap[segment] ?? ([] as readonly ThemeMode[]);

      if (!themesForSegment.length) return;

      const entries = await Promise.all(
        themesForSegment.map(async (themeForBackground) => {
          const key = `${String(designSystem)}|${segment}|${themeForBackground}`;
          const loader = extraMaps[key as keyof typeof extraMaps];

          if (!loader) {
            return [themeForBackground, undefined] as const;
          }

          try {
            const extra = await loader();
            return [themeForBackground, extra.background] as const;
          } catch {
            return [themeForBackground, undefined] as const;
          }
        })
      );

      if (cancelled) return;

      const nextBackgrounds: BackgroundTones = {};
      for (const [themeKey, background] of entries) {
        nextBackgrounds[themeKey] = background;
      }

      setBackgroundsByTheme(nextBackgrounds);
    };

    void loadBackgrounds();

    return () => {
      cancelled = true;
    };
  }, [designSystem, segment]);

  return { backgroundsByTheme };
}
