import type { RadiusMode, RippleEffectSchema, TabsIndicatorPosition, ThemeMode } from '@kiskadee/core';
import { useEffect, useState } from 'react';
import { extraMaps, paletteIndex } from '@/registry/design-systems.registry';
import type { DesignSystemKey } from '@/registry/registry-utils';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

type BackgroundTones = Partial<Record<ThemeMode, string | undefined>>;

// Cache for global radius/ripple metadata loaded from <ds>/global.kiskadee.json
const radiusGlobalCache: Partial<Record<string, RadiusMode | null>> = {};
const rippleGlobalCache: Partial<Record<string, RippleEffectSchema | null>> = {};
const tabsIndicatorPositionCache: Partial<Record<string, TabsIndicatorPosition | null>> = {};

export function useThemeExtras({
  designSystem,
  segment
}: {
  designSystem: DesignSystemKey;
  segment: string;
}) {
  const [backgroundsByTheme, setBackgroundsByTheme] = useState<BackgroundTones>({});
  const [globalRadius, setGlobalRadius] = useState<RadiusMode | undefined>(undefined);
  const [globalRipple, setGlobalRipple] = useState<RippleEffectSchema | undefined>(undefined);
  const [tabsIndicatorPosition, setTabsIndicatorPosition] = useState<
    TabsIndicatorPosition | undefined
  >(undefined);

  // Load global radius/ripple metadata.
  useEffect(() => {
    let cancelled = false;

    const loadGlobals = async () => {
      const dsKey = String(designSystem);
      if (!dsKey) return;

      const hasRadius = Object.prototype.hasOwnProperty.call(radiusGlobalCache, dsKey);
      let radius = radiusGlobalCache[dsKey] ?? undefined;
      const hasRipple = Object.prototype.hasOwnProperty.call(rippleGlobalCache, dsKey);
      let ripple = rippleGlobalCache[dsKey] ?? undefined;
      const hasTabsIndicatorPosition = Object.prototype.hasOwnProperty.call(
        tabsIndicatorPositionCache,
        dsKey
      );
      let indicatorPosition = tabsIndicatorPositionCache[dsKey] ?? undefined;
      if (!hasRadius || !hasRipple || !hasTabsIndicatorPosition) {
        try {
          const json = await loadJsonFromBuild<{
            radius?: RadiusMode;
            effects?: { ripple?: RippleEffectSchema };
            components?: {
              tabs?: {
                options?: {
                  indicatorPosition?: TabsIndicatorPosition;
                };
              };
            };
          }>(
            `${dsKey}/global.kiskadee.json`,
            { required: false, fallback: {} }
          );
          radius = json.radius;
          radiusGlobalCache[dsKey] = radius ?? null;
          ripple = json.effects?.ripple;
          rippleGlobalCache[dsKey] = ripple ?? null;
          indicatorPosition = json.components?.tabs?.options?.indicatorPosition;
          tabsIndicatorPositionCache[dsKey] = indicatorPosition ?? null;
        } catch (error) {
          console.warn(
            `[showcase] Failed to load global artifact for "${dsKey}". Retrying on next mount/selection change.`,
            error
          );
        }
      }

      if (cancelled) return;
      setGlobalRadius(radius);
      setGlobalRipple(ripple);
      setTabsIndicatorPosition(indicatorPosition);
    };

    void loadGlobals();

    return () => {
      cancelled = true;
    };
  }, [designSystem]);

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
          } catch (error) {
            console.warn(
              `[showcase] Failed to load extra artifact for "${key}". Falling back to undefined background.`,
              error
            );
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

  return { backgroundsByTheme, globalRadius, globalRipple, tabsIndicatorPosition };
}
