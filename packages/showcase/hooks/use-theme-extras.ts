import type {
  RadiusMode,
  RippleEffectSchema,
  TabsIndicatorPosition,
  TabsIndicatorVariant,
  TabsIndicatorWidthMode,
  TabsType,
  ThemeMode
} from '@kiskadee/core';
import { useEffect, useState } from 'react';
import { extraMaps, paletteIndex } from '@/registry/design-systems.registry';
import type { DesignSystemKey } from '@/registry/registry-utils';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

type BackgroundTones = Partial<Record<ThemeMode, string | undefined>>;

// Cache for global radius/ripple metadata loaded from <ds>/global.kiskadee.json
const radiusGlobalCache: Partial<Record<string, RadiusMode | null>> = {};
const rippleGlobalCache: Partial<Record<string, RippleEffectSchema | null>> = {};
const tabsTypeCache: Partial<Record<string, TabsType | null>> = {};
const tabsIndicatorPositionCache: Partial<Record<string, TabsIndicatorPosition | null>> = {};
const tabsIndicatorVariantCache: Partial<Record<string, TabsIndicatorVariant | null>> = {};
const tabsIndicatorWidthModeCache: Partial<Record<string, TabsIndicatorWidthMode | null>> = {};
const tabsSeparatorCache: Partial<Record<string, boolean | null>> = {};

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
  const [tabsType, setTabsType] = useState<TabsType | undefined>(undefined);
  const [tabsIndicatorPosition, setTabsIndicatorPosition] = useState<
    TabsIndicatorPosition | undefined
  >(undefined);
  const [tabsIndicatorVariant, setTabsIndicatorVariant] = useState<
    TabsIndicatorVariant | undefined
  >(
    undefined
  );
  const [tabsIndicatorWidthMode, setTabsIndicatorWidthMode] = useState<
    TabsIndicatorWidthMode | undefined
  >(undefined);
  const [tabsSeparator, setTabsSeparator] = useState<boolean | undefined>(undefined);

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
      const hasTabsType = Object.hasOwn(tabsTypeCache, dsKey);
      let type = tabsTypeCache[dsKey] ?? undefined;
      const hasTabsIndicatorPosition = Object.prototype.hasOwnProperty.call(
        tabsIndicatorPositionCache,
        dsKey
      );
      let indicatorPosition = tabsIndicatorPositionCache[dsKey] ?? undefined;
      const hasTabsIndicatorVariant = Object.hasOwn(tabsIndicatorVariantCache, dsKey);
      let indicatorVariant = tabsIndicatorVariantCache[dsKey] ?? undefined;
      const hasTabsIndicatorWidthMode = Object.prototype.hasOwnProperty.call(
        tabsIndicatorWidthModeCache,
        dsKey
      );
      let indicatorWidthMode = tabsIndicatorWidthModeCache[dsKey] ?? undefined;
      const hasTabsSeparator = Object.prototype.hasOwnProperty.call(tabsSeparatorCache, dsKey);
      let separator = tabsSeparatorCache[dsKey] ?? undefined;
      if (
        !hasRadius ||
        !hasRipple ||
        !hasTabsType ||
        !hasTabsIndicatorPosition ||
        !hasTabsIndicatorVariant ||
        !hasTabsIndicatorWidthMode ||
        !hasTabsSeparator
      ) {
        try {
          const json = await loadJsonFromBuild<{
            radius?: RadiusMode;
            effects?: { ripple?: RippleEffectSchema };
            components?: {
              tabs?: {
                options?: {
                  type?: TabsType;
                  indicatorPosition?: TabsIndicatorPosition;
                  indicatorVariant?: TabsIndicatorVariant;
                  indicatorWidthMode?: TabsIndicatorWidthMode;
                  separator?: boolean;
                  variant?: TabsType;
                  indicatorShape?: TabsIndicatorVariant;
                };
              };
            };
          }>(`${dsKey}/global.kiskadee.json`, { required: false, fallback: {} });
          radius = json.radius;
          radiusGlobalCache[dsKey] = radius ?? null;
          ripple = json.effects?.ripple;
          rippleGlobalCache[dsKey] = ripple ?? null;
          type = json.components?.tabs?.options?.type ?? json.components?.tabs?.options?.variant;
          tabsTypeCache[dsKey] = type ?? null;
          indicatorPosition = json.components?.tabs?.options?.indicatorPosition;
          tabsIndicatorPositionCache[dsKey] = indicatorPosition ?? null;
          indicatorVariant =
            json.components?.tabs?.options?.indicatorVariant ??
            json.components?.tabs?.options?.indicatorShape;
          tabsIndicatorVariantCache[dsKey] = indicatorVariant ?? null;
          indicatorWidthMode = json.components?.tabs?.options?.indicatorWidthMode;
          tabsIndicatorWidthModeCache[dsKey] = indicatorWidthMode ?? null;
          separator = json.components?.tabs?.options?.separator;
          tabsSeparatorCache[dsKey] = separator ?? null;
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
      setTabsType(type);
      setTabsIndicatorPosition(indicatorPosition);
      setTabsIndicatorVariant(indicatorVariant);
      setTabsIndicatorWidthMode(indicatorWidthMode);
      setTabsSeparator(separator);
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

  return {
    backgroundsByTheme,
    globalRadius,
    globalRipple,
    tabsType,
    tabsIndicatorPosition,
    tabsIndicatorVariant,
    tabsIndicatorWidthMode,
    tabsSeparator
  };
}
