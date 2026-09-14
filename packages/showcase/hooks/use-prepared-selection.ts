import type { ComponentClassNameMapJSON, ThemeMode } from '@kiskadee/core';
import type {
  BrandPackLoadRequest,
  KiskadeeGlobalArtifact,
  LoadedBrandPackResources
} from '@kiskadee/react-components';
import type { Manifest } from '@kiskadee/web-builder/types';
import { useCallback, useEffect, useInsertionEffect, useRef, useState } from 'react';
import type { ArtifactLoad } from '@/components/ArtifactProgress/ArtifactProgress';
import type { DesignSystemKey } from '@/registry/registry-utils';
import { loadBrandPack } from '@/utils/brand-pack-loader.client';
import { loadJsonFromBuild } from '@/utils/build-artifacts.client';
import { prepareComponentResources } from '@/utils/component-resources.client';
import { mergeMaps } from '@/utils/merge-class-maps';
import { playWowTransition } from '@/utils/playWowTransition';
import {
  activateSelectionStylesheets,
  prepareSelectionStylesheets,
  prepareStylesheet
} from './use-stylesheet-manager';

type Selection = { designSystem: DesignSystemKey; segment: string; theme: ThemeMode };
type PreparedSelection = Selection & {
  manifest: Manifest;
  global: KiskadeeGlobalArtifact;
  stylesheets: HTMLLinkElement[];
  classMaps: ComponentClassNameMapJSON;
  componentArtifacts: Record<string, unknown>;
  preloadedBrandPacks: Record<string, LoadedBrandPackResources>;
};

const EMPTY_COMPONENTS = new Set<string>();
const EMPTY_BRAND_PACKS = new Map<string, Pick<BrandPackLoadRequest, 'pack' | 'components'>>();

export function usePreparedSelection(
  { designSystem, segment, theme }: Selection,
  componentNames: ReadonlySet<string> = EMPTY_COMPONENTS,
  brandPacks: ReadonlyMap<
    string,
    Pick<BrandPackLoadRequest, 'pack' | 'components'>
  > = EMPTY_BRAND_PACKS
) {
  const hasActivatedSelection = useRef(false);
  const requestId = useRef(0);
  const [load, setLoad] = useState<ArtifactLoad>({ id: 0, status: 'ready' });
  const [prepared, setPrepared] = useState<PreparedSelection>();
  const [error, setError] = useState<unknown>();
  const [attempt, setAttempt] = useState(0);
  const retry = useCallback(() => setAttempt((value) => value + 1), []);
  useEffect(() => {
    let cancelled = false;
    const id = ++requestId.current;
    setLoad({ id, status: 'pending' });
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
        const componentArtifacts: Record<string, unknown> = {};
        const preloadedBrandPacks: Record<string, LoadedBrandPackResources> = {};
        await Promise.all([
          ...[...brandPacks.values()].map(async (request) => {
            const resources = await loadBrandPack({
              ...request,
              designSystem: String(designSystem),
              segment,
              theme,
              artifactVersion: manifest.revision ?? manifest.version ?? undefined
            });
            if (!resources) return;
            const styles = resources.stylesheets ?? [];
            const links = await Promise.all(
              styles.map((resource) => prepareStylesheet(resource.href, resource.sha256))
            );
            links.forEach((link, index) => {
              link.dataset.kOrder = String(1000000 + index);
            });
            stylesheets.push(...links);
            preloadedBrandPacks[resources.cacheKey] = resources;
          }),
          ...[...componentNames].map(async (component) => {
            const ready = await prepareComponentResources(
              String(designSystem),
              manifest,
              component,
              segment,
              theme
            );
            if (!ready) return;
            componentArtifacts[component] = ready.metadata;
            stylesheets.push(...ready.links);
            const unwrap = (value: any) => (value ? { [component]: value.classMap } : {});
            Object.assign(classMaps, mergeMaps(unwrap(ready.core), unwrap(ready.palette)));
          }),
          ...[
            ...(manifest.styles ?? []),
            ...(manifest.paletteStyles?.[`${segment}.${theme}`] ?? [])
          ].map(async (resource) => {
            const link = await prepareStylesheet(
              `/build/${designSystem}/${resource.path}`,
              resource.sha256
            );
            link.dataset.kOrder = String(resource.order);
            stylesheets.push(link);
          })
        ]);
        if (!cancelled) {
          setLoad({ id, status: 'ready' });
          setPrepared({
            designSystem,
            segment,
            theme,
            manifest,
            global,
            stylesheets,
            classMaps,
            componentArtifacts,
            preloadedBrandPacks
          });
        }
      })
      .catch((reason) => {
        if (!cancelled) {
          setError(reason);
          setLoad({ id, status: 'error' });
        }
      });
    return () => {
      cancelled = true;
    };
  }, [designSystem, segment, theme, attempt, componentNames, brandPacks]);
  // Activate CSS before descendant layout effects can measure the new class names.
  useInsertionEffect(() => {
    if (!prepared) return;
    if (hasActivatedSelection.current) playWowTransition();
    activateSelectionStylesheets(prepared.stylesheets);
    hasActivatedSelection.current = true;
  }, [prepared]);
  return { prepared, error, retry, load };
}
