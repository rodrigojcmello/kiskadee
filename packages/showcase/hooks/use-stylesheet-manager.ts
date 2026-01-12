import type { ThemeMode } from '@kiskadee/core';
import { useEffect, useMemo } from 'react';
import { cssPaths } from '@/registry/css.registry';
import type { DesignSystemKey } from '@/registry/registry-utils';

const stylesheetLinkCache: Partial<Record<string, HTMLLinkElement>> = {};

export function useStylesheetManager({
  designSystem,
  segment,
  theme
}: {
  designSystem: DesignSystemKey;
  segment: string;
  theme: ThemeMode;
}) {
  // Derive stylesheet hrefs declaratively from registry
  const { coreHref, paletteHref, effectsHref } = useMemo(() => {
    const entry = cssPaths[designSystem as keyof typeof cssPaths];
    const palettes = entry?.palettes as Record<string, string> | undefined;
    return {
      coreHref: entry?.core ?? null,
      paletteHref: palettes ? (palettes[`${segment}|${theme}`] ?? null) : null,
      effectsHref: entry?.effects ?? null
    } as const;
  }, [designSystem, segment, theme]);

  // Inject and clean up stylesheets via effects
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
}
