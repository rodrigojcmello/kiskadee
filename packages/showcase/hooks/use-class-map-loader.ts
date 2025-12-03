import type { ComponentClassNameMapJSON, ThemeMode } from '@kiskadee/core/dist';
import { useCallback, useEffect, useState } from 'react';
import { coreMaps, paletteMaps } from '@/registry/design-systems.registry';
import type { DesignSystemKey } from '@/registry/registry-utils';
import { mergeMaps } from '../utils/merge-class-maps';

// Cache of already loaded class maps to avoid repeated dynamic imports
const coreMapCache: Partial<Record<DesignSystemKey, ComponentClassNameMapJSON>> = {};
const paletteMapCache: Partial<Record<string, ComponentClassNameMapJSON>> = {};

export function useClassMapLoader({
  designSystem,
  segment,
  theme
}: {
  designSystem: DesignSystemKey;
  segment: string;
  theme: ThemeMode;
}) {
  const [classesMap, setClassesMap] = useState<ComponentClassNameMapJSON>({});

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

  useEffect(() => {
    void ensureLoaded();
  }, [ensureLoaded]);

  return classesMap;
}
