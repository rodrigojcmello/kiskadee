'use client';
import { fontFamilyCatalogById } from '@kiskadee/fonts/catalog';
import { interfaceIconFamilyCatalog } from '@kiskadee/icons/interface/catalog';
import { lucideIconFamily } from '@kiskadee/icons/interface/lucide';
import {
  type ComponentClassMapScope,
  type DefinedFontFamily,
  FontFamilyProvider,
  type FontFamilyRoleSelection,
  IconFamilyProvider,
  KiskadeeContext,
  ShowcaseContext,
  type ShowcaseContextValue,
  useIconFamilyStatus
} from '@kiskadee/react-components';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useClassMapLoader } from '@/hooks/use-class-map-loader';
import { useDesignSystemSelection } from '@/hooks/use-design-system-selection';
import { useFontPreference } from '@/hooks/use-font-preference';
import { useGlobalThemeClasses } from '@/hooks/use-global-theme-classes';
import { useRuntimePlatformClasses } from '@/hooks/use-runtime-platform-classes';
import { useStylesheetManager } from '@/hooks/use-stylesheet-manager';
import { useThemeExtras } from '@/hooks/use-theme-extras';
import { designSystemList } from '@/registry/design-systems.registry';
import { loadBrandPack } from '@/utils/brand-pack-loader.client';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';
import { FOLLOW_PRESET_FONT_KEY } from '@/utils/font-family-selection';

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

const EAGER_ICON_FAMILIES = [lucideIconFamily] as const;

function ShowcaseIconContextBridge({
  children,
  value,
  setIconFamilyId
}: {
  children: React.ReactNode;
  value: Omit<ShowcaseContextValue, 'iconFamilyId' | 'setIconFamilyId'>;
  setIconFamilyId: (value: string) => void;
}) {
  const iconFamily = useIconFamilyStatus();

  return (
    <ShowcaseContext.Provider
      value={{
        ...value,
        iconFamilyId: iconFamily.effectiveFamilyId ?? 'lucide',
        setIconFamilyId
      }}
    >
      {children}
    </ShowcaseContext.Provider>
  );
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
    pathname !== '/progress' &&
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
  const { manifest, fontName, fontRoleNames, setFontName, setFontRoleName } = useFontPreference({
    designSystemKey: String(designSystem)
  });
  const requestedFontFamilyIds = useMemo(() => {
    const requested = new Set<string>();

    for (const familyId of Object.values(globalConfig?.fonts?.roles ?? {})) {
      if (familyId && fontFamilyCatalogById.has(familyId)) requested.add(familyId);
    }

    for (const selection of Object.values(fontRoleNames)) {
      if (selection !== FOLLOW_PRESET_FONT_KEY && fontFamilyCatalogById.has(selection)) {
        requested.add(selection);
      }
    }

    return [...requested].sort();
  }, [fontRoleNames, globalConfig?.fonts?.roles]);
  const requestedFontFamilyKey = requestedFontFamilyIds.join('|');
  const [fontFamilyDefinitions, setFontFamilyDefinitions] = useState<readonly DefinedFontFamily[]>(
    []
  );

  useEffect(() => {
    let cancelled = false;

    const loadSelectedDefinitions = async () => {
      const definitions = await Promise.all(
        requestedFontFamilyIds.map((familyId) => {
          const entry = fontFamilyCatalogById.get(familyId);
          if (!entry) throw new Error(`Missing font catalog entry for "${familyId}".`);
          return entry.load();
        })
      );

      if (!cancelled) setFontFamilyDefinitions(definitions);
    };

    void loadSelectedDefinitions().catch((error: unknown) => {
      console.warn('[showcase] Failed to load selected font integrations.', error);
    });

    return () => {
      cancelled = true;
    };
  }, [requestedFontFamilyKey]);

  const loadedFontFamilyIds = useMemo(
    () => new Set(fontFamilyDefinitions.map((definition) => definition.id)),
    [fontFamilyDefinitions]
  );
  const fontRoles = useMemo<FontFamilyRoleSelection | undefined>(() => {
    const roles: FontFamilyRoleSelection = {};

    for (const role of ['body', 'heading', 'code'] as const) {
      const selection = fontRoleNames[role];
      if (selection === FOLLOW_PRESET_FONT_KEY || !loadedFontFamilyIds.has(selection)) continue;
      roles[role] = selection;
    }

    return Object.keys(roles).length > 0 ? roles : undefined;
  }, [fontRoleNames, loadedFontFamilyIds]);
  const activeManifest = manifest?.key === String(designSystem) ? manifest : undefined;
  const [iconFamilySelection, setIconFamilySelection] = useState<{
    designSystem: string;
    family?: string;
  }>({ designSystem: String(designSystem) });
  const selectedIconFamily =
    iconFamilySelection.designSystem === String(designSystem)
      ? iconFamilySelection.family
      : undefined;
  const setShowcaseDesignSystem = useCallback(
    (value: string) => {
      setIconFamilySelection({ designSystem: value });
      setDesignSystem(value);
    },
    [setDesignSystem]
  );
  const setIconFamilyId = useCallback(
    (value: string) => {
      setIconFamilySelection({ designSystem: String(designSystem), family: value });
    },
    [designSystem]
  );
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
        setDesignSystem: setShowcaseDesignSystem,
        artifactVersion: activeManifest?.version ?? undefined,
        loadComponentArtifact: activeManifest ? loadComponentArtifact : undefined,
        loadComponentClassMap: activeManifest ? loadComponentClassMap : undefined,
        brandPackLoader: loadBrandPack,
        global: globalConfig
      }}
    >
      <FontFamilyProvider families={fontFamilyDefinitions} roles={fontRoles}>
        <IconFamilyProvider
          families={EAGER_ICON_FAMILIES}
          catalog={interfaceIconFamilyCatalog}
          defaultFamily="lucide"
          family={selectedIconFamily}
        >
          <ShowcaseIconContextBridge
            value={{
              designSystemKeys,
              availableSegments,
              availableThemes,
              designSystemList,
              manifest: activeManifest ?? manifest,
              backgroundsByTheme,
              fontName,
              setFontName,
              fontRoleNames,
              setFontRoleName
            }}
            setIconFamilyId={setIconFamilyId}
          >
            {children}
          </ShowcaseIconContextBridge>
        </IconFamilyProvider>
      </FontFamilyProvider>
    </KiskadeeContext.Provider>
  );
}
