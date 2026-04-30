import type {
  RadiusMode,
  RippleEffectSchema,
  TabsBridgeLowerCurve,
  TabsIndicatorPosition,
  TabsIndicatorShape,
  TabsIndicatorWidth,
  TabsTabWidth,
  TabsVariant,
  TextFieldMode,
  TextFieldVariant,
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
const textFieldVariantCache: Partial<Record<string, TextFieldVariant | null>> = {};
const textFieldModeCache: Partial<Record<string, TextFieldMode | null>> = {};
const tabsVariantCache: Partial<Record<string, TabsVariant | null>> = {};
const tabsIndicatorPositionCache: Partial<Record<string, TabsIndicatorPosition | null>> = {};
const tabsIndicatorShapeCache: Partial<Record<string, TabsIndicatorShape | null>> = {};
const tabsIndicatorWidthCache: Partial<Record<string, TabsIndicatorWidth | null>> = {};
const tabsTabWidthCache: Partial<Record<string, TabsTabWidth | null>> = {};
const tabsSeparatorCache: Partial<Record<string, boolean | null>> = {};
const tabsLowerCurveCache: Partial<Record<string, TabsBridgeLowerCurve | null>> = {};

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
  const [textFieldVariant, setTextFieldVariant] = useState<TextFieldVariant | undefined>(undefined);
  const [textFieldMode, setTextFieldMode] = useState<TextFieldMode | undefined>(undefined);
  const [tabsVariant, setTabsVariant] = useState<TabsVariant | undefined>(undefined);
  const [tabsIndicatorPosition, setTabsIndicatorPosition] = useState<
    TabsIndicatorPosition | undefined
  >(undefined);
  const [tabsIndicatorShape, setTabsIndicatorShape] = useState<TabsIndicatorShape | undefined>(
    undefined
  );
  const [tabsIndicatorWidth, setTabsIndicatorWidth] = useState<TabsIndicatorWidth | undefined>(
    undefined
  );
  const [tabsTabWidth, setTabsTabWidth] = useState<TabsTabWidth | undefined>(undefined);
  const [tabsSeparator, setTabsSeparator] = useState<boolean | undefined>(undefined);
  const [tabsLowerCurve, setTabsLowerCurve] = useState<TabsBridgeLowerCurve | undefined>(undefined);

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
      const hasTextFieldVariant = Object.hasOwn(textFieldVariantCache, dsKey);
      let textFieldVariantValue = textFieldVariantCache[dsKey] ?? undefined;
      const hasTextFieldMode = Object.hasOwn(textFieldModeCache, dsKey);
      let textFieldModeValue = textFieldModeCache[dsKey] ?? undefined;
      const hasTabsVariant = Object.hasOwn(tabsVariantCache, dsKey);
      let variant = tabsVariantCache[dsKey] ?? undefined;
      const hasTabsIndicatorPosition = Object.prototype.hasOwnProperty.call(
        tabsIndicatorPositionCache,
        dsKey
      );
      let indicatorPosition = tabsIndicatorPositionCache[dsKey] ?? undefined;
      const hasTabsIndicatorShape = Object.hasOwn(tabsIndicatorShapeCache, dsKey);
      let indicatorShape = tabsIndicatorShapeCache[dsKey] ?? undefined;
      const hasTabsIndicatorWidth = Object.prototype.hasOwnProperty.call(
        tabsIndicatorWidthCache,
        dsKey
      );
      let indicatorWidth = tabsIndicatorWidthCache[dsKey] ?? undefined;
      const hasTabsTabWidth = Object.prototype.hasOwnProperty.call(tabsTabWidthCache, dsKey);
      let tabWidth = tabsTabWidthCache[dsKey] ?? undefined;
      const hasTabsSeparator = Object.prototype.hasOwnProperty.call(tabsSeparatorCache, dsKey);
      let separator = tabsSeparatorCache[dsKey] ?? undefined;
      const hasTabsLowerCurve = Object.prototype.hasOwnProperty.call(tabsLowerCurveCache, dsKey);
      let lowerCurve = tabsLowerCurveCache[dsKey] ?? undefined;
      if (
        !hasRadius ||
        !hasRipple ||
        !hasTextFieldVariant ||
        !hasTextFieldMode ||
        !hasTabsVariant ||
        !hasTabsIndicatorPosition ||
        !hasTabsIndicatorShape ||
        !hasTabsIndicatorWidth ||
        !hasTabsTabWidth ||
        !hasTabsSeparator ||
        !hasTabsLowerCurve
      ) {
        try {
          const json = await loadJsonFromBuild<{
            radius?: RadiusMode;
            effects?: { ripple?: RippleEffectSchema };
            components?: {
              tabs?: {
                options?: {
                  variant?: TabsVariant;
                  indicatorPosition?: TabsIndicatorPosition;
                  indicatorShape?: TabsIndicatorShape;
                  indicatorWidth?: TabsIndicatorWidth;
                  tabWidth?: TabsTabWidth;
                  separator?: boolean;
                  lowerCurve?: TabsBridgeLowerCurve;
                  type?: TabsVariant;
                  indicatorVariant?: TabsIndicatorShape;
                  indicatorWidthMode?: TabsIndicatorWidth;
                  tabWidthMode?: TabsTabWidth;
                  lowerCurveMode?: TabsBridgeLowerCurve;
                };
              };
              textField?: {
                options?: {
                  variant?: TextFieldVariant;
                  mode?: TextFieldMode;
                };
              };
            };
          }>(`${dsKey}/global.kiskadee.json`, { required: false, fallback: {} });
          radius = json.radius;
          radiusGlobalCache[dsKey] = radius ?? null;
          ripple = json.effects?.ripple;
          rippleGlobalCache[dsKey] = ripple ?? null;
          textFieldVariantValue = json.components?.textField?.options?.variant;
          textFieldVariantCache[dsKey] = textFieldVariantValue ?? null;
          textFieldModeValue = json.components?.textField?.options?.mode;
          textFieldModeCache[dsKey] = textFieldModeValue ?? null;
          variant = json.components?.tabs?.options?.variant ?? json.components?.tabs?.options?.type;
          tabsVariantCache[dsKey] = variant ?? null;
          indicatorPosition = json.components?.tabs?.options?.indicatorPosition;
          tabsIndicatorPositionCache[dsKey] = indicatorPosition ?? null;
          indicatorShape = json.components?.tabs?.options?.indicatorShape;
          if (indicatorShape === undefined) {
            indicatorShape = json.components?.tabs?.options?.indicatorVariant;
          }
          tabsIndicatorShapeCache[dsKey] = indicatorShape ?? null;
          indicatorWidth = json.components?.tabs?.options?.indicatorWidth;
          if (indicatorWidth === undefined) {
            indicatorWidth = json.components?.tabs?.options?.indicatorWidthMode;
          }
          tabsIndicatorWidthCache[dsKey] = indicatorWidth ?? null;
          tabWidth = json.components?.tabs?.options?.tabWidth;
          if (tabWidth === undefined) {
            tabWidth = json.components?.tabs?.options?.tabWidthMode;
          }
          tabsTabWidthCache[dsKey] = tabWidth ?? null;
          separator = json.components?.tabs?.options?.separator;
          tabsSeparatorCache[dsKey] = separator ?? null;
          lowerCurve = json.components?.tabs?.options?.lowerCurve;
          if (lowerCurve === undefined) {
            lowerCurve = json.components?.tabs?.options?.lowerCurveMode;
          }
          tabsLowerCurveCache[dsKey] = lowerCurve ?? null;
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
      setTextFieldVariant(textFieldVariantValue);
      setTextFieldMode(textFieldModeValue);
      setTabsVariant(variant);
      setTabsIndicatorPosition(indicatorPosition);
      setTabsIndicatorShape(indicatorShape);
      setTabsIndicatorWidth(indicatorWidth);
      setTabsTabWidth(tabWidth);
      setTabsSeparator(separator);
      setTabsLowerCurve(lowerCurve);
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
    textFieldVariant,
    textFieldMode,
    tabsVariant,
    tabsIndicatorPosition,
    tabsIndicatorShape,
    tabsIndicatorWidth,
    tabsTabWidth,
    tabsSeparator,
    tabsLowerCurve
  };
}
