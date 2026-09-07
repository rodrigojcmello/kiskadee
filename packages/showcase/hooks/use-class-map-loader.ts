import type { ComponentClassNameMapJSON, ThemeMode } from '@kiskadee/core';
import { useEffect, useState } from 'react';
import { coreMaps, paletteMaps } from '@/registry/design-systems.registry';
import type { DesignSystemKey } from '@/registry/registry-utils';
import { mergeMaps } from '@/utils/merge-class-maps';

// Cache of already loaded class maps to avoid repeated dynamic imports
const coreMapCache: Partial<Record<DesignSystemKey, ComponentClassNameMapJSON>> = {};
const paletteMapCache: Partial<Record<string, ComponentClassNameMapJSON>> = {};

export function useClassMapLoader({
  designSystem,
  segment,
  theme,
  enabled = true
}: {
  designSystem: DesignSystemKey;
  segment: string;
  theme: ThemeMode;
  enabled?: boolean;
}) {
  const [classesMap, setClassesMap] = useState<ComponentClassNameMapJSON>({});

  useEffect(() => {
    let cancelled = false;
    if (!enabled) {
      setClassesMap({});
      return;
    }

    const loadCore = async () => {
      if (coreMapCache[designSystem]) return coreMapCache[designSystem];
      const loader = coreMaps[designSystem];
      if (!loader) return {};
      const module = await loader();
      const value = (module as { default?: ComponentClassNameMapJSON }).default ?? module;
      coreMapCache[designSystem] = value as ComponentClassNameMapJSON;
      return value as ComponentClassNameMapJSON;
    };
    const loadPalette = async () => {
      const key = `${String(designSystem)}|${segment}|${theme}`;
      if (paletteMapCache[key]) return paletteMapCache[key];
      const loader = paletteMaps[key as keyof typeof paletteMaps];
      if (!loader) return {};
      const module = await loader();
      const value = (module as { default?: ComponentClassNameMapJSON }).default ?? module;
      paletteMapCache[key] = value as ComponentClassNameMapJSON;
      return value as ComponentClassNameMapJSON;
    };

    void Promise.all([loadCore(), loadPalette()]).then(
      ([core, palette]) => {
        if (!cancelled) setClassesMap(mergeMaps(core ?? {}, palette ?? {}));
      },
      (error) => {
        if (!cancelled) console.error('[showcase] Failed to load aggregate class maps.', error);
      }
    );
    return () => {
      cancelled = true;
    };
  }, [designSystem, enabled, segment, theme]);

  return classesMap;
}
