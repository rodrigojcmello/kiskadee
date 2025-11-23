'use client';
import type { ComponentClassNameMapJSON, ThemeMode } from '@kiskadee/core';
import { KiskadeeContext } from '@kiskadee/react-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cssPaths } from './registry/css.registry';
import { coreMaps, extraMaps, paletteIndex, paletteMaps } from './registry/design-systems.registry';

// Client-side provider that mirrors legacy App.tsx/main.tsx responsibilities
// Loads classNames maps (core + palette) via dynamic import (no fetch) and injects CSS served from /public/build.

type DesignSystemKey = keyof typeof coreMaps;

function getDefaultSegmentAndThemeForDesignSystem(key: DesignSystemKey): {
  segment: string;
  theme: ThemeMode;
} {
  const info = paletteIndex[key as keyof typeof paletteIndex];
  if (!info) {
    throw new Error(`No paletteIndex entry found for design system: ${key}`);
  }

  const segments = Array.from(info.segments) as string[];
  if (segments.length === 0) {
    throw new Error(`Design system ${key} has no segments configured in paletteIndex.`);
  }

  const segment = segments[0];

  const map = info.themesBySegment as unknown as Record<string, readonly ThemeMode[]>;
  const themes = map[segment] ?? ([] as readonly ThemeMode[]);
  if (!themes.length) {
    throw new Error(
      `Design system ${key} has no themes configured for segment "${segment}" in paletteIndex.`
    );
  }

  const theme = themes[0] as ThemeMode;
  return { segment, theme };
}

const designSystemKeysFromRegistry = Object.keys(coreMaps) as DesignSystemKey[];

if (!designSystemKeysFromRegistry.length) {
  throw new Error('No design systems registered in coreMaps.');
}

const DEFAULT_DESIGN_SYSTEM = designSystemKeysFromRegistry[0];
const { segment: DEFAULT_SEGMENT, theme: DEFAULT_THEME } =
  getDefaultSegmentAndThemeForDesignSystem(DEFAULT_DESIGN_SYSTEM);

const STORAGE_KEYS = {
  designSystem: 'kiskadee:design-system',
  segment: 'kiskadee:segment',
  theme: 'kiskadee:theme'
} as const;

function readPersistedSelection(): {
  designSystem: DesignSystemKey;
  segment: string;
  theme: ThemeMode;
} | null {
  if (typeof window === 'undefined') return null;

  try {
    const storedDesignSystem = window.localStorage.getItem(STORAGE_KEYS.designSystem);
    if (!storedDesignSystem) return null;

    if (!Object.prototype.hasOwnProperty.call(coreMaps, storedDesignSystem)) {
      return null;
    }

    const designSystem = storedDesignSystem as DesignSystemKey;
    const info = paletteIndex[designSystem as keyof typeof paletteIndex];
    if (!info) return null;

    const segments = Array.from(info.segments) as string[];
    if (!segments.length) return null;

    const storedSegment = window.localStorage.getItem(STORAGE_KEYS.segment) ?? undefined;
    const segment = storedSegment && segments.includes(storedSegment) ? storedSegment : segments[0];

    const map = info.themesBySegment as unknown as Record<string, readonly ThemeMode[]>;
    const availableThemes = map[segment] ?? ([] as readonly ThemeMode[]);
    if (!availableThemes.length) return null;

    const storedTheme = window.localStorage.getItem(STORAGE_KEYS.theme) as ThemeMode | null;
    const theme =
      storedTheme && (availableThemes as readonly string[]).includes(storedTheme)
        ? storedTheme
        : (availableThemes[0] as ThemeMode);

    return { designSystem, segment, theme };
  } catch {
    return null;
  }
}

function persistSelection(designSystem: DesignSystemKey, segment: string, theme: ThemeMode): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEYS.designSystem, String(designSystem));
    window.localStorage.setItem(STORAGE_KEYS.segment, segment);
    window.localStorage.setItem(STORAGE_KEYS.theme, theme);
  } catch {
    // Ignore persistence errors (e.g., private mode, quota exceeded)
  }
}

// ----------------------------------------------------------------------------------------------
// In-memory registries (module scoped)
// ----------------------------------------------------------------------------------------------

// Cache of already loaded class maps to avoid repeated dynamic imports
const coreMapCache: Partial<Record<DesignSystemKey, ComponentClassNameMapJSON>> = {};
const paletteMapCache: Partial<Record<string, ComponentClassNameMapJSON>> = {};

// Cache for focusRing values loaded from extra.<segment>.<theme>.kiskadee.json
const focusRingCache: Partial<Record<string, string>> = {};

// Cache of <link> elements by href to keep all loaded CSS in memory during the session
// and avoid duplicating link tags.
const stylesheetLinkCache: Partial<Record<string, HTMLLinkElement>> = {};

export function Providers({ children }: { children: React.ReactNode }) {
  // During the first render (including SSR), always use registry-based defaults.
  // Persisted selection from localStorage is applied later in a layout effect
  // to avoid hydration mismatches between server HTML and client hydration.
  const [designSystem, _setDesignSystem] = useState<DesignSystemKey>(DEFAULT_DESIGN_SYSTEM);
  const [segment, _setSegment] = useState<string>(DEFAULT_SEGMENT);
  const [theme, _setTheme] = useState<ThemeMode>(DEFAULT_THEME);
  const [classesMap, setClassesMap] = useState<ComponentClassNameMapJSON>({});

  const designSystemKeys = useMemo(() => Object.keys(coreMaps) as string[], []);

  // Helpers to get mutable arrays from readonly registry entries
  const getSegments = useCallback((key: DesignSystemKey): string[] => {
    const info = paletteIndex[key as keyof typeof paletteIndex];
    if (!info) {
      throw new Error(`No paletteIndex entry found for design system: ${key}`);
    }
    const segments = Array.from(info.segments) as string[];
    if (!segments.length) {
      throw new Error(`Design system ${key} has no segments configured in paletteIndex.`);
    }
    return segments;
  }, []);

  const getThemes = useCallback((key: DesignSystemKey, seg: string): ThemeMode[] => {
    const info = paletteIndex[key as keyof typeof paletteIndex];
    if (!info) {
      throw new Error(`No paletteIndex entry found for design system: ${key}`);
    }
    const map = info.themesBySegment as unknown as Record<string, readonly ThemeMode[]>;
    const ro = map[seg] ?? ([] as readonly ThemeMode[]);
    if (!ro.length) {
      throw new Error(
        `Design system ${key} has no themes configured for segment "${seg}" in paletteIndex.`
      );
    }
    return Array.from(ro) as ThemeMode[];
  }, []);

  // Clamp segment/theme to what's available for a design system
  const clampPair = useCallback(
    (key: DesignSystemKey, seg: string, th: ThemeMode) => {
      const segments = getSegments(key);
      const nextSeg = segments.includes(seg) ? seg : segments[0];
      const themes = getThemes(key, nextSeg);
      const nextTh = themes.includes(th) ? th : themes[0];
      return { seg: nextSeg, th: nextTh } as const;
    },
    [getSegments, getThemes]
  );

  const availableSegments = useMemo(() => getSegments(designSystem), [getSegments, designSystem]);
  const availableThemes = useMemo(
    () => getThemes(designSystem, segment),
    [getThemes, designSystem, segment]
  );

  const setDesignSystem = useCallback(
    (v: string) => {
      const key = v as DesignSystemKey;
      const { seg, th } = clampPair(key, segment, theme);
      _setDesignSystem(key);
      _setSegment(seg);
      _setTheme(th);
      persistSelection(key, seg, th);
    },
    [segment, theme, clampPair]
  );

  const setSegment = useCallback(
    (v: string) => {
      const { th } = clampPair(designSystem, v, theme);
      _setSegment(v);
      _setTheme(th);
      persistSelection(designSystem, v, th);
    },
    [designSystem, theme, clampPair]
  );

  const setTheme = useCallback(
    (v: ThemeMode) => {
      const { seg, th } = clampPair(designSystem, segment, v);
      _setSegment(seg);
      _setTheme(th);
      persistSelection(designSystem, seg, th);
    },
    [designSystem, segment, clampPair]
  );

  // After mount on the client, try to restore a previously persisted selection.
  // This runs only in the browser and after the initial HTML has been hydrated,
  // so it will not cause hydration mismatches.
  useEffect(() => {
    const persisted = readPersistedSelection();
    if (!persisted) return;

    const {
      designSystem: persistedDesignSystem,
      segment: persistedSegment,
      theme: persistedTheme
    } = persisted;

    const { seg: clampedSegment, th: clampedTheme } = clampPair(
      persistedDesignSystem,
      persistedSegment,
      persistedTheme
    );

    _setDesignSystem(persistedDesignSystem);
    _setSegment(clampedSegment);
    _setTheme(clampedTheme);
  }, [clampPair]);

  // Sync CSS theme classes with current ThemeMode so globals.scss variables apply app-wide.
  // We intentionally map both "dark" and "darker" ThemeMode values to the same .dark
  // class, as requested, so they share the same CSS custom properties.
  useEffect(() => {
    if (typeof document === 'undefined') return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    const cssThemeClass = theme === 'light' ? 'light' : 'dark';
    root.classList.add(cssThemeClass);
  }, [theme]);

  const designSystemMeta = useMemo(() => ({}) as Record<string, { displayName?: string }>, []);

  const ensureLoaded = useCallback(async () => {
    // Load core map via dynamic import registry (guard if not registered),
    // reusing cached results to avoid repeated imports.
    let core: ComponentClassNameMapJSON = coreMapCache[designSystem] ?? {};
    if (!Object.keys(core).length) {
      const coreLoader = coreMaps[designSystem];
      if (coreLoader) {
        const coreMod = await coreLoader();
        const asDefault = coreMod as { default?: ComponentClassNameMapJSON };
        core = asDefault.default ?? (coreMod as unknown as ComponentClassNameMapJSON);
        coreMapCache[designSystem] = core;
      }
    }

    // Load palette map if it exists for the current segment/theme, also using cache.
    const paletteKey = `${String(designSystem)}|${segment}|${theme}`;
    let palette: ComponentClassNameMapJSON = paletteMapCache[paletteKey] ?? {};
    if (!Object.keys(palette).length) {
      const loader = paletteMaps[paletteKey as keyof typeof paletteMaps];
      if (loader) {
        const palMod = await loader();
        const asDefault = palMod as { default?: ComponentClassNameMapJSON };
        palette = asDefault.default ?? (palMod as unknown as ComponentClassNameMapJSON);
        paletteMapCache[paletteKey] = palette;
      }
    }

    // Deep merge: preserve core baseline (d/e/s) and overlay palette colors (c) and selected (cs)
    const mergeMaps = (
      coreMap: ComponentClassNameMapJSON,
      paletteMap: ComponentClassNameMapJSON
    ): ComponentClassNameMapJSON => {
      const out: Record<string, Record<string, unknown>> = {};
      const compKeys = new Set<string>([
        ...Object.keys(coreMap || {}),
        ...Object.keys(paletteMap || {})
      ]);
      for (const comp of compKeys) {
        const cComp = (coreMap as unknown as Record<string, unknown>)?.[comp] as
          | Record<string, unknown>
          | undefined;
        const pComp = (paletteMap as unknown as Record<string, unknown>)?.[comp] as
          | Record<string, unknown>
          | undefined;
        const elKeys = new Set<string>([...Object.keys(cComp || {}), ...Object.keys(pComp || {})]);
        out[comp] = {};
        for (const el of elKeys) {
          const cEl = (cComp?.[el] as Record<string, unknown> | undefined) ?? {};
          const pEl = (pComp?.[el] as Record<string, unknown> | undefined) ?? {};
          // start from core element so we don't lose d/e/s/scales
          const mergedEl: Record<string, unknown> = { ...(cEl as object) };
          // colors: merge semantics, palette takes precedence per semantic key
          if (pEl.c) {
            const cElC = (cEl.c as Record<string, unknown> | undefined) ?? {};
            const pElC = (pEl.c as Record<string, unknown> | undefined) ?? {};
            mergedEl.c = { ...cElC, ...pElC };
          }
          // selected state class from palette if provided
          if (pEl.cs !== undefined) mergedEl.cs = pEl.cs;
          // if core didn't have d/e/s, allow palette to define them
          if (mergedEl.d === undefined && pEl.d !== undefined) mergedEl.d = pEl.d;
          if (mergedEl.e === undefined && pEl.e !== undefined) mergedEl.e = pEl.e;
          if (mergedEl.s === undefined && pEl.s !== undefined) mergedEl.s = pEl.s;
          (out[comp] as Record<string, unknown>)[el] = mergedEl;
        }
      }
      return out as unknown as ComponentClassNameMapJSON;
    };

    const merged = mergeMaps(core, palette);
    setClassesMap(merged);

    // Stylesheets are managed via <Head> (css.registry). Here we only
    // re-enable animations after a small delay to ensure the first
    // paint happens without transitions.
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      window.setTimeout(() => {
        root.classList.remove('no-transitions');
      }, 300);
    }
  }, [designSystem, segment, theme]);

  // Load focusRing from extra artifacts registry and expose as CSS custom property.
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
            if (!cancelled && extra && typeof extra.focusRing === 'string') {
              hex = extra.focusRing;
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

  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  // Derive stylesheet hrefs declaratively from registry (Option B)
  const { coreHref, paletteHref, effectsHref } = useMemo(() => {
    const entry = cssPaths[designSystem as keyof typeof cssPaths];
    const palettes = entry?.palettes as Record<string, string> | undefined;
    return {
      coreHref: entry?.core ?? null,
      paletteHref: palettes ? (palettes[`${segment}|${theme}`] ?? null) : null,
      effectsHref: entry?.effects ?? null
    } as const;
  }, [designSystem, segment, theme]);

  // Inject and clean up stylesheets via effects (App Router friendly)
  useEffect(() => {
    if (!coreHref || typeof document === 'undefined') return;
    if (stylesheetLinkCache[coreHref]) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = coreHref;
    document.head.appendChild(link);
    stylesheetLinkCache[coreHref] = link;
  }, [coreHref]);

  useEffect(() => {
    if (!paletteHref || typeof document === 'undefined') return;
    if (stylesheetLinkCache[paletteHref]) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = paletteHref;
    document.head.appendChild(link);
    stylesheetLinkCache[paletteHref] = link;
  }, [paletteHref]);

  useEffect(() => {
    if (!effectsHref || typeof document === 'undefined') return;
    if (stylesheetLinkCache[effectsHref]) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = effectsHref;
    document.head.appendChild(link);
    stylesheetLinkCache[effectsHref] = link;
  }, [effectsHref]);

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
        designSystemKeys,
        designSystemMeta,
        availableSegments,
        availableThemes
      }}
    >
      {children}
    </KiskadeeContext.Provider>
  );
}
