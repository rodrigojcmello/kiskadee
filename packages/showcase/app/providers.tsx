'use client';
import {
  KiskadeeContext,
  ShowcaseContext,
  type ComponentClassMapScope
} from '@kiskadee/react-components';
import { usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { useClassMapLoader } from '@/hooks/use-class-map-loader';
import { useDesignSystemSelection } from '@/hooks/use-design-system-selection';
import { useFontPreference } from '@/hooks/use-font-preference';
import { useGlobalThemeClasses } from '@/hooks/use-global-theme-classes';
import { useRuntimePlatformClasses } from '@/hooks/use-runtime-platform-classes';
import { useStylesheetManager } from '@/hooks/use-stylesheet-manager';
import { useThemeExtras } from '@/hooks/use-theme-extras';
import { designSystemList } from '@/registry/design-systems.registry';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';

// Client-side provider that mirrors legacy App.tsx/main.tsx responsibilities
// Refactored to use custom hooks for separation of concerns.

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
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
  const shouldLoadAggregateClassMap = pathname !== '/switch';
  const classesMap = useClassMapLoader({
    designSystem,
    segment,
    theme,
    enabled: shouldLoadAggregateClassMap
  });

  // 3. Load extra resources (background colors) and global radius/ripple metadata
  const {
    backgroundsByTheme,
    globalRadius,
    globalRipple,
    textFieldVariant,
    textFieldMode,
    textFieldFocusRingColorSource,
    textFieldVariants,
    tabsVariant,
    tabsIndicatorPosition,
    tabsIndicatorShape,
    tabsIndicatorWidth,
    tabsTabWidth,
    tabsSeparator,
    tabsLowerCurve
  } = useThemeExtras({
    designSystem,
    segment
  });

  const globalConfig =
    globalRadius !== undefined ||
    globalRipple !== undefined ||
    textFieldVariant !== undefined ||
    textFieldMode !== undefined ||
    textFieldFocusRingColorSource !== undefined ||
    textFieldVariants !== undefined ||
    tabsVariant !== undefined ||
    tabsIndicatorPosition !== undefined ||
    tabsIndicatorShape !== undefined ||
    tabsIndicatorWidth !== undefined ||
    tabsTabWidth !== undefined ||
    tabsSeparator !== undefined ||
    tabsLowerCurve !== undefined
      ? {
          ...(globalRadius !== undefined ? { radius: globalRadius } : {}),
          ...(globalRipple !== undefined ? { effects: { ripple: globalRipple } } : {}),
          ...(textFieldVariant !== undefined ||
          textFieldMode !== undefined ||
          textFieldFocusRingColorSource !== undefined ||
          textFieldVariants !== undefined ||
          tabsVariant !== undefined ||
          tabsIndicatorPosition !== undefined ||
          tabsIndicatorShape !== undefined ||
          tabsIndicatorWidth !== undefined ||
          tabsTabWidth !== undefined ||
          tabsSeparator !== undefined ||
          tabsLowerCurve !== undefined
            ? {
                components: {
                  ...(textFieldVariant !== undefined ||
                  textFieldMode !== undefined ||
                  textFieldFocusRingColorSource !== undefined ||
                  textFieldVariants !== undefined
                    ? {
                        textField: {
                          options: {
                            ...(textFieldVariant !== undefined
                              ? { variant: textFieldVariant }
                              : {}),
                            ...(textFieldMode !== undefined ? { mode: textFieldMode } : {}),
                            ...(textFieldFocusRingColorSource !== undefined
                              ? { focusRingColorSource: textFieldFocusRingColorSource }
                              : {})
                          },
                          ...(textFieldVariants !== undefined
                            ? { variants: textFieldVariants }
                            : {})
                        }
                      }
                    : {}),
                  ...(tabsVariant !== undefined ||
                  tabsIndicatorPosition !== undefined ||
                  tabsIndicatorShape !== undefined ||
                  tabsIndicatorWidth !== undefined ||
                  tabsTabWidth !== undefined ||
                  tabsSeparator !== undefined ||
                  tabsLowerCurve !== undefined
                    ? {
                        tabs: {
                          options: {
                            ...(tabsVariant !== undefined ? { variant: tabsVariant } : {}),
                            ...(tabsIndicatorPosition !== undefined
                              ? { indicatorPosition: tabsIndicatorPosition }
                              : {}),
                            ...(tabsIndicatorShape !== undefined
                              ? { indicatorShape: tabsIndicatorShape }
                              : {}),
                            ...(tabsIndicatorWidth !== undefined
                              ? { indicatorWidth: tabsIndicatorWidth }
                              : {}),
                            ...(tabsTabWidth !== undefined ? { tabWidth: tabsTabWidth } : {}),
                            ...(tabsSeparator !== undefined ? { separator: tabsSeparator } : {}),
                            ...(tabsLowerCurve !== undefined ? { lowerCurve: tabsLowerCurve } : {})
                          }
                        }
                      }
                    : {})
                }
              }
            : {})
        }
      : undefined;

  // 4. Manage global CSS and stylesheet injection (side effects)
  useStylesheetManager({ designSystem, segment, theme });
  useGlobalThemeClasses(theme);
  useRuntimePlatformClasses();

  // 5. Manifest + font management for the currently selected design system
  const { manifest, fontName, setFontName } = useFontPreference({
    designSystemKey: String(designSystem)
  });
  const activeManifest = manifest?.key === String(designSystem) ? manifest : undefined;
  const loadComponentArtifact = useCallback(
    <T,>(componentName: string): Promise<T | undefined> => {
      const artifactPath = (
        activeManifest?.components as
          | Record<string, { artifacts?: { metadata?: string } } | undefined>
          | undefined
      )?.[componentName]?.artifacts?.metadata;

      if (!artifactPath) {
        return Promise.resolve(undefined);
      }

      return loadJsonFromBuild<T | undefined>(`${String(designSystem)}/${artifactPath}`, {
        required: false,
        fallback: undefined
      }).catch((error) => {
        console.warn(
          `[showcase] Failed to load component artifact "${componentName}" for "${String(
            designSystem
          )}". Falling back to legacy/default config.`,
          error
        );
        return undefined;
      });
    },
    [activeManifest?.components, designSystem]
  );
  const loadComponentClassMap = useCallback(
    <T,>(componentName: string, scope: ComponentClassMapScope): Promise<T | undefined> => {
      const classMaps = (
        activeManifest?.components as
          | Record<
              string,
              {
                artifacts?: {
                  classMaps?: {
                    core?: string;
                    palettes?: Record<string, string>;
                  };
                };
              } | undefined
            >
          | undefined
      )?.[componentName]?.artifacts?.classMaps;
      const artifactPath =
        scope.kind === 'core'
          ? classMaps?.core
          : classMaps?.palettes?.[`${scope.segment}.${scope.theme}`];

      if (!artifactPath) {
        return Promise.resolve(undefined);
      }

      return loadJsonFromBuild<T | undefined>(`${String(designSystem)}/${artifactPath}`, {
        required: false,
        fallback: undefined
      }).catch((error) => {
        console.warn(
          `[showcase] Failed to load component class map "${componentName}" for "${String(
            designSystem
          )}". Falling back to aggregate/default classes.`,
          error
        );
        return undefined;
      });
    },
    [activeManifest?.components, designSystem]
  );

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
        artifactVersion: activeManifest?.version ?? undefined,
        loadComponentArtifact: activeManifest ? loadComponentArtifact : undefined,
        loadComponentClassMap: activeManifest ? loadComponentClassMap : undefined,
        global: globalConfig
      }}
    >
      <ShowcaseContext.Provider
        value={{
          designSystemKeys,
          availableSegments,
          availableThemes,
          designSystemList,
          manifest: activeManifest,
          backgroundsByTheme,
          fontName,
          setFontName
        }}
      >
        {children}
      </ShowcaseContext.Provider>
    </KiskadeeContext.Provider>
  );
}
