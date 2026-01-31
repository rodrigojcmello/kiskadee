import type { RadiusMode, ThemeMode } from '@kiskadee/core';
import { useEffect, useState } from 'react';
import { extraMaps, paletteIndex } from '@/registry/design-systems.registry';
import type { DesignSystemKey } from '@/registry/registry-utils';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

type BackgroundTones = Partial<Record<ThemeMode, string | undefined>>;

// Cache for focusColor values loaded from extra.<segment>.<theme>.kiskadee.json
const focusRingCache: Partial<Record<string, string>> = {};

// Cache for global focus metrics loaded from <ds>/global.kiskadee.json
const focusGlobalCache: Partial<Record<string, { width?: number; offset?: number }>> = {};
const radiusGlobalCache: Partial<Record<string, RadiusMode | null>> = {};

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
  const [globalRadius, setGlobalRadius] = useState<RadiusMode | undefined>(undefined);

  // Load global focus metrics and expose as CSS custom properties.
  useEffect(() => {
    if (typeof document === 'undefined') return;

    let cancelled = false;

    const loadFocusGlobals = async () => {
      const dsKey = String(designSystem);
      if (!dsKey) return;

      let focus = focusGlobalCache[dsKey];
      const hasRadius = Object.prototype.hasOwnProperty.call(radiusGlobalCache, dsKey);
      let radius = radiusGlobalCache[dsKey] ?? undefined;
      if (!focus || !hasRadius) {
        try {
          const json = await loadJsonFromBuild<{
            focus?: { width?: number; offset?: number };
            radius?: RadiusMode;
          }>(
            `${dsKey}/global.kiskadee.json`,
            { required: false, fallback: {} }
          );
          focus = json.focus;
          focusGlobalCache[dsKey] = focus ?? {};
          radius = json.radius;
          radiusGlobalCache[dsKey] = radius ?? null;
        } catch {
          focusGlobalCache[dsKey] = {};
          radiusGlobalCache[dsKey] = null;
        }
      }

      if (cancelled) return;

      const root = document.documentElement;
      if (focus?.width !== undefined) root.style.setProperty('--k-focus-width', String(focus.width));
      if (focus?.offset !== undefined) root.style.setProperty('--k-focus-offset', String(focus.offset));
      setGlobalRadius(radius);
    };

    void loadFocusGlobals();

    return () => {
      cancelled = true;
    };
  }, [designSystem]);

  // Load focus color from extra artifacts registry and expose as CSS custom property.
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
      root.style.setProperty('--k-focus-color', hex ?? '#0059b1');
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

  return { backgroundsByTheme, globalRadius };
}
