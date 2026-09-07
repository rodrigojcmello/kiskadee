'use client';
import { fontFamilyCatalogById } from '@kiskadee/fonts/catalog';
import { DEFAULT_ESSENTIAL_ICONS } from '@kiskadee/icons/interface';
import { interfaceIconFamilyCatalog } from '@kiskadee/icons/interface/catalog';
import { lucideIconFamily } from '@kiskadee/icons/interface/lucide';
import {
  type ComponentClassMapScope,
  type DefinedFontFamily,
  EssentialIconProvider,
  FontFamilyProvider,
  type FontFamilyRoleSelection,
  IconFamilyProvider,
  KiskadeeContext,
  ShowcaseContext,
  type ShowcaseContextValue,
  useIconFamilyStatus
} from '@kiskadee/react-components';
import { usePathname } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useClassMapLoader } from '@/hooks/use-class-map-loader';
import { useDesignSystemSelection } from '@/hooks/use-design-system-selection';
import { useFontPreference } from '@/hooks/use-font-preference';
import { useGlobalThemeClasses } from '@/hooks/use-global-theme-classes';
import { usePreparedSelection } from '@/hooks/use-prepared-selection';
import { useRuntimePlatformClasses } from '@/hooks/use-runtime-platform-classes';
import { useThemeExtras } from '@/hooks/use-theme-extras';
import { designSystemList } from '@/registry/design-systems.registry';
import { loadBrandPack } from '@/utils/brand-pack-loader.client';
import { loadSelectedComponentArtifact } from '@/utils/component-artifacts.client';
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
  setIconFamilySelection
}: {
  children: React.ReactNode;
  value: Omit<
    ShowcaseContextValue,
    'iconFamilyFallbackFor' | 'iconFamilyId' | 'iconVariantId' | 'setIconFamilySelection'
  >;
  setIconFamilySelection: (familyId: string, variantId: string) => void;
}) {
  const iconFamily = useIconFamilyStatus();

  return (
    <ShowcaseContext.Provider
      value={{
        ...value,
        ...(iconFamily.fallbackFor ? { iconFamilyFallbackFor: iconFamily.fallbackFor } : {}),
        iconFamilyId: iconFamily.effectiveFamilyId ?? 'lucide',
        iconVariantId: iconFamily.effectiveVariantId ?? 'regular',
        setIconFamilySelection
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
    designSystem: requestedDesignSystem,
    segment: requestedSegment,
    theme: requestedTheme,
    setDesignSystem,
    setSegment,
    setTheme,
    availableSegments,
    availableThemes,
    designSystemKeys
  } = useDesignSystemSelection();
  const consumedComponents = useRef(new Set<string>());
  const {
    prepared,
    error: selectionError,
    retry: retrySelection
  } = usePreparedSelection(
    {
      designSystem: requestedDesignSystem,
      segment: requestedSegment,
      theme: requestedTheme
    },
    consumedComponents.current
  );
  const designSystem = prepared?.designSystem ?? requestedDesignSystem;
  const segment = prepared?.segment ?? requestedSegment;
  const theme = prepared?.theme ?? requestedTheme;
  const globalConfig = prepared?.global;

  // 2. Load class maps (core + palette) dynamically
  const shouldLoadAggregateClassMap =
    pathname !== '/switch' &&
    pathname !== '/slider' &&
    pathname !== '/button' &&
    pathname !== '/card' &&
    pathname !== '/badge' &&
    pathname !== '/typography' &&
    pathname !== '/colors' &&
    pathname !== '/icons' &&
    pathname !== '/progress' &&
    pathname !== '/text-field' &&
    !pathname.startsWith('/tabs');
  const aggregateClassesMap = useClassMapLoader({
    designSystem,
    segment,
    theme,
    enabled: shouldLoadAggregateClassMap
  });
  const classesMap = useMemo(
    () => ({ ...aggregateClassesMap, ...prepared?.classMaps }),
    [aggregateClassesMap, prepared?.classMaps]
  );

  // 3. Load extra resources (background colors) and global metadata
  const { backgroundsByTheme } = useThemeExtras({
    designSystem,
    segment
  });

  // 4. Manage global CSS and stylesheet injection (side effects)
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
  const activeManifest = prepared?.manifest;
  const [iconFamilySelection, setIconFamilySelection] = useState<{
    designSystem: string;
    family?: string;
    variant?: string;
  }>({ designSystem: String(designSystem) });
  const selectedIconFamily =
    iconFamilySelection.designSystem === String(designSystem)
      ? iconFamilySelection.family
      : undefined;
  const selectedIconVariant =
    iconFamilySelection.designSystem === String(designSystem)
      ? iconFamilySelection.variant
      : undefined;
  const setShowcaseDesignSystem = useCallback(
    (value: string) => {
      setIconFamilySelection({ designSystem: value });
      setDesignSystem(value);
    },
    [setDesignSystem]
  );
  const setShowcaseIconFamilySelection = useCallback(
    (family: string, variant: string) => {
      setIconFamilySelection({
        designSystem: String(designSystem),
        family,
        variant
      });
    },
    [designSystem]
  );
  const loadComponentArtifact = useCallback(
    <T,>(componentName: string): Promise<T | undefined> => {
      consumedComponents.current.add(componentName);
      const artifactPath = (
        activeManifest?.components as
          | Record<string, { artifacts?: { metadata?: string } } | undefined>
          | undefined
      )?.[componentName]?.artifacts?.metadata;

      if (!artifactPath) {
        return Promise.resolve(undefined);
      }

      return loadSelectedComponentArtifact<T | undefined>(
        `${String(designSystem)}/${artifactPath}`,
        activeManifest?.version
      );
    },
    [activeManifest?.components, activeManifest?.version, designSystem]
  );
  const loadComponentClassMap = useCallback(
    <T,>(componentName: string, scope: ComponentClassMapScope): Promise<T | undefined> => {
      consumedComponents.current.add(componentName);
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

      return loadSelectedComponentArtifact<T | undefined>(
        `${String(designSystem)}/${artifactPath}`,
        activeManifest?.version
      );
    },
    [activeManifest?.components, activeManifest?.version, designSystem]
  );

  const contextValue = useMemo(
    () => ({
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
    }),
    [
      classesMap,
      segment,
      theme,
      setSegment,
      setTheme,
      designSystem,
      setShowcaseDesignSystem,
      activeManifest,
      loadComponentArtifact,
      loadComponentClassMap,
      loadBrandPack,
      globalConfig
    ]
  );

  if (!prepared) {
    return selectionError ? (
      <div role="alert">
        Não foi possível carregar o tema.{' '}
        <button type="button" onClick={retrySelection}>
          Tentar novamente
        </button>
      </div>
    ) : (
      <div role="status">Carregando tema…</div>
    );
  }

  return (
    <KiskadeeContext.Provider value={contextValue}>
      {selectionError ? (
        <div role="alert">
          Não foi possível trocar o tema.{' '}
          <button type="button" onClick={retrySelection}>
            Tentar novamente
          </button>
        </div>
      ) : null}
      <FontFamilyProvider families={fontFamilyDefinitions} roles={fontRoles}>
        <IconFamilyProvider
          families={EAGER_ICON_FAMILIES}
          catalog={interfaceIconFamilyCatalog}
          defaultFamily="lucide"
          family={selectedIconFamily}
          variant={selectedIconVariant}
        >
          <EssentialIconProvider icons={DEFAULT_ESSENTIAL_ICONS}>
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
              setIconFamilySelection={setShowcaseIconFamilySelection}
            >
              {children}
            </ShowcaseIconContextBridge>
          </EssentialIconProvider>
        </IconFamilyProvider>
      </FontFamilyProvider>
    </KiskadeeContext.Provider>
  );
}
