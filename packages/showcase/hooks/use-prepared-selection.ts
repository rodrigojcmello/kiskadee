import type { ComponentClassNameMapJSON, ThemeMode } from '@kiskadee/core';
import type { KiskadeeGlobalArtifact } from '@kiskadee/react-components';
import type { Manifest } from '@kiskadee/web-builder/types';
import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import type { DesignSystemKey } from '@/registry/registry-utils';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';
import { loadSelectedComponentArtifact } from '@/utils/component-artifacts.client';
import { mergeMaps } from '@/utils/merge-class-maps';
import {
  activateSelectionStylesheets,
  prepareSelectionStylesheets
} from './use-stylesheet-manager';

type Selection = { designSystem: DesignSystemKey; segment: string; theme: ThemeMode };
type PreparedSelection = Selection & {
  manifest: Manifest;
  global: KiskadeeGlobalArtifact;
  stylesheets: HTMLLinkElement[];
  classMaps: ComponentClassNameMapJSON;
};

const EMPTY_COMPONENTS = new Set<string>();

export function usePreparedSelection(
  { designSystem, segment, theme }: Selection,
  componentNames: ReadonlySet<string> = EMPTY_COMPONENTS
) {
  const [prepared, setPrepared] = useState<PreparedSelection>();
  const [error, setError] = useState<unknown>();
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    let cancelled = false;
    setError(undefined);
    void Promise.all([
      prepareSelectionStylesheets({ designSystem, segment, theme }),
      loadJsonFromBuild<Manifest>(`${designSystem}/manifest.json`, { required: true }),
      loadJsonFromBuild<KiskadeeGlobalArtifact>(`${designSystem}/global.kiskadee.json`, {
        required: true
      })
    ])
      .then(async ([stylesheets, manifest, global]) => {
        if (manifest.key !== designSystem)
          throw new Error('Manifest does not match the requested design system.');
        const classMaps: ComponentClassNameMapJSON = {};
        await Promise.all(
          [...componentNames].map(async (component) => {
            const entry = (
              manifest.components as
                | Record<
                    string,
                    {
                      artifacts?: {
                        metadata?: string;
                        classMaps?: { core?: string; palettes?: Record<string, string> };
                      };
                    }
                  >
                | undefined
            )?.[component]?.artifacts;
            const loadMap = async (
              path: string | undefined
            ): Promise<ComponentClassNameMapJSON> => {
              if (!path) return {};
              const artifact = await loadSelectedComponentArtifact<{
                component: string;
                classMap: unknown;
              }>(`${designSystem}/${path}`, manifest.version);
              if (artifact.component !== component || !artifact.classMap)
                throw new Error(`Invalid component class map: ${component}`);
              return { [component]: artifact.classMap } as ComponentClassNameMapJSON;
            };
            const [core, palette] = await Promise.all([
              loadMap(entry?.classMaps?.core),
              loadMap(entry?.classMaps?.palettes?.[`${segment}.${theme}`]),
              entry?.metadata
                ? loadSelectedComponentArtifact(
                    `${designSystem}/${entry.metadata}`,
                    manifest.version
                  )
                : Promise.resolve()
            ]);
            Object.assign(classMaps, mergeMaps(core, palette));
          })
        );
        if (!cancelled)
          setPrepared({ designSystem, segment, theme, manifest, global, stylesheets, classMaps });
      })
      .catch((reason) => {
        if (!cancelled) setError(reason);
      });
    return () => {
      cancelled = true;
    };
  }, [designSystem, segment, theme, attempt, componentNames]);
  useLayoutEffect(() => {
    if (prepared) activateSelectionStylesheets(prepared.stylesheets);
  }, [prepared]);
  return { prepared, error, retry };
}
