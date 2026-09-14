'use client';

import { fontFamilyCatalogById } from '@kiskadee/fonts/catalog';
import { DEFAULT_ESSENTIAL_ICONS } from '@kiskadee/icons/interface';
import { interfaceIconFamilyCatalog } from '@kiskadee/icons/interface/catalog';
import { lucideIconFamily } from '@kiskadee/icons/interface/lucide';
import type {
  ComponentClassMapScope,
  DefinedFontFamily,
  FontFamilyRoleSelection,
  ShowcaseContextValue
} from '@kiskadee/react-components';
import {
  EssentialIconProvider,
  FontFamilyProvider,
  IconFamilyProvider,
  KiskadeeContext,
  ShowcaseContext,
  useIconFamilyStatus
} from '@kiskadee/react-components/resources';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArtifactProgress } from '@/components/ArtifactProgress/ArtifactProgress';
import { useDesignSystemSelection } from '@/hooks/use-design-system-selection';
import { useFontPreference } from '@/hooks/use-font-preference';
import { useGlobalThemeClasses } from '@/hooks/use-global-theme-classes';
import { usePreparedSelection } from '@/hooks/use-prepared-selection';
import { useRuntimePlatformClasses } from '@/hooks/use-runtime-platform-classes';
import { useThemeExtras } from '@/hooks/use-theme-extras';
import { designSystemList } from '@/registry/design-systems.registry';
import { loadBrandPack } from '@/utils/brand-pack-loader.client';
import {
  activateComponentStyles,
  prepareComponentResources
} from '@/utils/component-resources.client';
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
  const activeBrandPacks = useRef(
    new Map<
      string,
      Pick<import('@kiskadee/react-components').BrandPackLoadRequest, 'pack' | 'components'>
    >()
  );
  const brandConsumerCounts = useRef(new Map<string, number>());
  const registerBrandPack = useCallback(
    (
      pack: import('@kiskadee/brands').BrandPackId,
      components: readonly import('@kiskadee/react-components').BrandPackComponentName[]
    ) => {
      const key = [pack, ...components].join('|');
      activeBrandPacks.current.set(key, { pack, components });
      brandConsumerCounts.current.set(key, (brandConsumerCounts.current.get(key) ?? 0) + 1);
      return () => {
        const remaining = (brandConsumerCounts.current.get(key) ?? 1) - 1;
        if (remaining) brandConsumerCounts.current.set(key, remaining);
        else {
          brandConsumerCounts.current.delete(key);
          activeBrandPacks.current.delete(key);
        }
      };
    },
    []
  );
  const consumedComponents = useRef(new Set<string>());
  const consumerCounts = useRef(new Map<string, number>());
  const registerComponent = useCallback((name: string) => {
    consumerCounts.current.set(name, (consumerCounts.current.get(name) ?? 0) + 1);
    consumedComponents.current.add(name);
    return () => {
      const count = (consumerCounts.current.get(name) ?? 1) - 1;
      if (count > 0) consumerCounts.current.set(name, count);
      else {
        consumerCounts.current.delete(name);
        consumedComponents.current.delete(name);
      }
    };
  }, []);
  const {
    prepared,
    error: selectionError,
    retry: retrySelection,
    load: artifactLoad
  } = usePreparedSelection(
    {
      designSystem: requestedDesignSystem,
      segment: requestedSegment,
      theme: requestedTheme
    },
    consumedComponents.current,
    activeBrandPacks.current
  );
  const designSystem = prepared?.designSystem ?? requestedDesignSystem;
  const segment = prepared?.segment ?? requestedSegment;
  const theme = prepared?.theme ?? requestedTheme;
  const globalConfig = prepared?.global;

  const classesMap = prepared?.classMaps ?? {};

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
  const activeSelection = useRef('');
  activeSelection.current = [designSystem, segment, theme].join('|');
  const prepareComponent = useCallback(
    async (component: string) => {
      if (!activeManifest) return undefined;
      const ready = await prepareComponentResources(
        String(designSystem),
        activeManifest,
        component,
        segment,
        theme
      );
      if (
        ready &&
        !prepared?.componentArtifacts[component] &&
        activeSelection.current === [designSystem, segment, theme].join('|')
      )
        activateComponentStyles(ready.links);
      return ready;
    },
    [activeManifest, designSystem, segment, theme, prepared]
  );
  const loadComponentArtifact = useCallback(
    async <T,>(component: string): Promise<T | undefined> =>
      (await prepareComponent(component))?.metadata as T | undefined,
    [prepareComponent]
  );
  const loadComponentClassMap = useCallback(
    async <T,>(component: string, scope: ComponentClassMapScope): Promise<T | undefined> => {
      const ready = await prepareComponent(component);
      return (scope.kind === 'core' ? ready?.core : ready?.palette) as T | undefined;
    },
    [prepareComponent]
  );

  const contextValue = useMemo(
    () => ({
      classesMap,
      componentArtifacts: prepared?.componentArtifacts,
      registerComponent,
      registerBrandPack,
      preloadedBrandPacks: prepared?.preloadedBrandPacks,
      segment,
      theme,
      setSegment,
      setTheme,
      designSystem: String(designSystem),
      setDesignSystem: setShowcaseDesignSystem,
      artifactVersion: activeManifest?.revision ?? activeManifest?.version ?? undefined,
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
    return (
      <>
        <ArtifactProgress load={artifactLoad} />
        {selectionError ? (
          <div role="alert">
            Não foi possível carregar o tema.{' '}
            <button type="button" onClick={retrySelection}>
              Tentar novamente
            </button>
          </div>
        ) : (
          <div role="status">Carregando tema…</div>
        )}
      </>
    );
  }

  return (
    <>
      <ArtifactProgress load={artifactLoad} />
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
    </>
  );
}
