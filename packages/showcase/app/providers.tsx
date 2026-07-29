'use client';
import {
  type ComponentClassMapScope,
  KiskadeeContext,
  ShowcaseContext
} from '@kiskadee/react-components';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect } from 'react';
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

function useInitialTransitionGate() {
  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      document.documentElement.classList.remove('no-transitions');
    }, 300);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, []);
}

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  useInitialTransitionGate();

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
  const shouldLoadAggregateClassMap =
    pathname !== '/switch' &&
    pathname !== '/slider' &&
    pathname !== '/button' &&
    pathname !== '/card' &&
    pathname !== '/colors' &&
    pathname !== '/icons' &&
    pathname !== '/text-field' &&
    !pathname.startsWith('/tabs');
  const classesMap = useClassMapLoader({
    designSystem,
    segment,
    theme,
    enabled: shouldLoadAggregateClassMap
  });

  // 3. Load extra resources (background colors) and global metadata
  const { backgroundsByTheme, globalConfig } = useThemeExtras({
    designSystem,
    segment
  });

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
              | {
                  artifacts?: {
                    classMaps?: {
                      core?: string;
                      palettes?: Record<string, string>;
                    };
                  };
                }
              | undefined
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
          manifest: activeManifest ?? manifest,
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
