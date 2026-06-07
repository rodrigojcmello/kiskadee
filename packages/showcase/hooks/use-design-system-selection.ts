import type { ThemeMode } from '@kiskadee/core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { coreMaps, designSystemList, paletteIndex } from '@/registry/design-systems.registry';
import {
  type DesignSystemKey,
  getDefaultSegmentAndThemeForDesignSystem
} from '@/registry/registry-utils';

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

    if (!Object.hasOwn(coreMaps, storedDesignSystem)) {
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

const designSystemKeysFromRegistry = designSystemList.map(
  (entry) => entry.key
) as DesignSystemKey[];

if (!designSystemKeysFromRegistry.length) {
  throw new Error('No design systems registered in coreMaps.');
}

const DEFAULT_DESIGN_SYSTEM = designSystemKeysFromRegistry[0];
const { segment: DEFAULT_SEGMENT, theme: DEFAULT_THEME } =
  getDefaultSegmentAndThemeForDesignSystem(DEFAULT_DESIGN_SYSTEM);

export function useDesignSystemSelection() {
  // During the first render (including SSR), always use registry-based defaults.
  // Persisted selection from localStorage is applied later in a layout effect
  // to avoid hydration mismatches between server HTML and client hydration.
  const [designSystem, _setDesignSystem] = useState<DesignSystemKey>(DEFAULT_DESIGN_SYSTEM);
  const [segment, _setSegment] = useState<string>(DEFAULT_SEGMENT);
  const [theme, _setTheme] = useState<ThemeMode>(DEFAULT_THEME);

  const designSystemKeys = useMemo(() => designSystemList.map((entry) => entry.key), []);

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

  return {
    designSystem,
    segment,
    theme,
    setDesignSystem,
    setSegment,
    setTheme,
    availableSegments,
    availableThemes,
    designSystemKeys
  };
}
