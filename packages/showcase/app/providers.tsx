'use client';
import type { ComponentClassNameMapJSON, ThemeMode } from '@kiskadee/core';
import { KiskadeeContext } from '@kiskadee/react-components';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { cssPaths } from './registry/css.registry';
import { coreMaps, paletteIndex, paletteMaps } from './registry/templates.registry';

// Client-side provider that mirrors legacy App.tsx/main.tsx responsibilities
// Loads classNames maps (core + palette) via dynamic import (no fetch) and injects CSS served from /public/build.

type TemplateKey = keyof typeof coreMaps;

const DEFAULT_TEMPLATE =
  (Object.keys(coreMaps)[0] as TemplateKey) ?? ('ios-26-apple' as TemplateKey);
const DEFAULT_SEGMENT = 'ios';
const DEFAULT_THEME: ThemeMode = 'light';

// ----------------------------------------------------------------------------------------------
// In-memory registries (module scoped)
// ----------------------------------------------------------------------------------------------

// Cache of already loaded class maps to avoid repeated dynamic imports
const coreMapCache: Partial<Record<TemplateKey, ComponentClassNameMapJSON>> = {};
const paletteMapCache: Partial<Record<string, ComponentClassNameMapJSON>> = {};

// Cache of <link> elements by href to keep all loaded CSS in memory during the session
// and avoid duplicating link tags.
const stylesheetLinkCache: Partial<Record<string, HTMLLinkElement>> = {};

export function Providers({ children }: { children: React.ReactNode }) {
  const [template, _setTemplate] = useState<TemplateKey>(DEFAULT_TEMPLATE);
  const [segment, _setSegment] = useState<string>(DEFAULT_SEGMENT);
  const [theme, _setTheme] = useState<ThemeMode>(DEFAULT_THEME);
  const [classesMap, setClassesMap] = useState<ComponentClassNameMapJSON>({});

  const templateKeys = useMemo(() => Object.keys(coreMaps) as string[], []);

  // Helpers to get mutable arrays from readonly registry entries
  const getSegments = useCallback((tpl: TemplateKey): string[] => {
    const info = paletteIndex[tpl as keyof typeof paletteIndex];
    return info ? Array.from(info.segments) : [DEFAULT_SEGMENT];
  }, []);

  const getThemes = useCallback((tpl: TemplateKey, seg: string): ThemeMode[] => {
    const info = paletteIndex[tpl as keyof typeof paletteIndex];
    if (!info) return [DEFAULT_THEME];
    const map = info.themesBySegment as unknown as Record<string, readonly ThemeMode[]>;
    const ro = map[seg] ?? ([] as readonly ThemeMode[]);
    return Array.from(ro) as ThemeMode[];
  }, []);

  // Clamp segment/theme to what's available for a template
  const clampPair = useCallback(
    (tpl: TemplateKey, seg: string, th: ThemeMode) => {
      const segments = getSegments(tpl);
      const nextSeg = segments.includes(seg) ? seg : segments[0];
      const themes = getThemes(tpl, nextSeg);
      const nextTh = themes.includes(th) ? th : (themes[0] ?? DEFAULT_THEME);
      return { seg: nextSeg, th: nextTh } as const;
    },
    [getSegments, getThemes]
  );

  const availableSegments = useMemo(() => getSegments(template), [getSegments, template]);
  const availableThemes = useMemo(
    () => getThemes(template, segment),
    [getThemes, template, segment]
  );

  const setTemplate = useCallback(
    (v: string) => {
      const tpl = v as TemplateKey;
      const { seg, th } = clampPair(tpl, segment, theme);
      _setTemplate(tpl);
      _setSegment(seg);
      _setTheme(th);
    },
    [segment, theme, clampPair]
  );

  const setSegment = useCallback(
    (v: string) => {
      const { th } = clampPair(template, v, theme);
      _setSegment(v);
      _setTheme(th);
    },
    [template, theme, clampPair]
  );

  const setTheme = useCallback(
    (v: ThemeMode) => {
      const { seg, th } = clampPair(template, segment, v);
      _setSegment(seg);
      _setTheme(th);
    },
    [template, segment, clampPair]
  );

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

  const templateMeta = useMemo(() => ({}) as Record<string, { displayName?: string }>, []);

  const ensureLoaded = useCallback(async () => {

    // Load core map via dynamic import registry (guard if not registered),
    // reusing cached results to avoid repeated imports.
    let core: ComponentClassNameMapJSON = coreMapCache[template] ?? {};
    if (!Object.keys(core).length) {
      const coreLoader = coreMaps[template];
      if (coreLoader) {
        const coreMod = await coreLoader();
        const asDefault = coreMod as { default?: ComponentClassNameMapJSON };
        core = asDefault.default ?? (coreMod as unknown as ComponentClassNameMapJSON);
        coreMapCache[template] = core;
      }
    }

    // Load palette map if it exists for the current segment/theme, also using cache.
    const paletteKey = `${String(template)}|${segment}|${theme}`;
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
  }, [template, segment, theme]);

  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  // Derive stylesheet hrefs declaratively from registry (Option B)
  const { coreHref, paletteHref, effectsHref } = useMemo(() => {
    const entry = cssPaths[template as keyof typeof cssPaths];
    const palettes = entry?.palettes as Record<string, string> | undefined;
    return {
      coreHref: entry?.core ?? null,
      paletteHref: palettes ? (palettes[`${segment}|${theme}`] ?? null) : null,
      effectsHref: entry?.effects ?? null
    } as const;
  }, [template, segment, theme]);

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
        template: String(template),
        setTemplate: (v) => setTemplate(v as TemplateKey),
        availableSegments,
        availableThemes,
        templateKeys,
        templateMeta
      }}
    >
      {children}
    </KiskadeeContext.Provider>
  );
}
