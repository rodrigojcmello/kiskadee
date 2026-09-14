import type {
  ComponentPaletteResourceArtifact,
  ComponentResourceArtifact,
  Manifest
} from '@kiskadee/web-builder/types';
import { prepareStylesheet } from '@/hooks/use-stylesheet-manager';
import { loadSelectedComponentArtifact } from './component-artifacts.client';

export type PreparedComponent = {
  metadata: ComponentResourceArtifact;
  links: HTMLLinkElement[];
  core?: unknown;
  palette?: unknown;
};
const pending = new Map<string, Promise<PreparedComponent | undefined>>();

/** A component is ready only after metadata, maps and every declared stylesheet have loaded. */
export function prepareComponentResources(
  designSystem: string,
  manifest: Manifest,
  component: string,
  segment: string,
  theme: string
): Promise<PreparedComponent | undefined> {
  const path = (
    manifest.components as Record<string, { artifacts?: { metadata?: string } }> | undefined
  )?.[component]?.artifacts?.metadata;
  if (!path) return Promise.resolve(undefined);
  const revision = manifest.revision ?? manifest.version;
  const key = [designSystem, revision, component, segment, theme].join('|');
  const cached = pending.get(key);
  if (cached) return cached;
  const load = async () => {
    const metadata = await loadSelectedComponentArtifact<ComponentResourceArtifact>(
      `${designSystem}/${path}`,
      revision
    );
    if (metadata.component !== component || !metadata.resources || !metadata.sizeSupport)
      throw new Error(`Invalid component metadata: ${component}`);
    const palettePath = metadata.resources.palettes?.[`${segment}.${theme}`];
    const palette = palettePath
      ? await loadSelectedComponentArtifact<ComponentPaletteResourceArtifact>(
          `${designSystem}/${palettePath}`,
          revision
        )
      : undefined;
    if (palette && palette.component !== component)
      throw new Error(`Invalid component palette: ${component}`);
    const styles = [...metadata.resources.styles, ...(palette?.styles ?? [])].sort(
      (a, b) => a.order - b.order
    );
    const [links, core, colors] = await Promise.all([
      Promise.all(
        styles.map(async (resource) => {
          const link = await prepareStylesheet(
            `/build/${designSystem}/${resource.path}`,
            resource.sha256
          );
          link.dataset.kOrder = String(resource.order);
          return link;
        })
      ),
      metadata.resources.core
        ? loadSelectedComponentArtifact(`${designSystem}/${metadata.resources.core}`, revision)
        : undefined,
      palette?.classMap
        ? loadSelectedComponentArtifact(`${designSystem}/${palette.classMap}`, revision)
        : undefined
    ]);
    return {
      metadata: {
        ...metadata,
        ...palette?.config,
        ...(palette?.config?.options || (metadata as any).options
          ? { options: { ...(metadata as any).options, ...palette?.config?.options } }
          : {}),
        capabilities: { ...metadata.capabilities, ...palette?.capabilities }
      },
      links,
      core,
      palette: colors
    };
  };
  const promise = load();
  pending.set(key, promise);
  void promise.catch(() => pending.delete(key));
  return promise;
}

export { activateComponentStylesheets as activateComponentStyles } from '@/hooks/use-stylesheet-manager';
