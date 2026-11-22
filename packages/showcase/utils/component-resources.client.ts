import {
  COMPONENT_PALETTE_FORMAT_VERSION,
  decodePaletteSurfaceConfig
} from '@kiskadee/web-builder/surface-palette';
import type {
  ComponentPaletteResourceArtifact,
  ComponentResourceArtifact,
  Manifest
} from '@kiskadee/web-builder/types';
import { prepareStylesheet } from '@/hooks/use-stylesheet-manager';
import {
  evictSelectedComponentArtifact,
  loadSelectedComponentArtifact
} from './component-artifacts.client';

export type PreparedComponent = {
  metadata: ComponentResourceArtifact;
  links: HTMLLinkElement[];
  core?: unknown;
  palette?: unknown;
};
const pending = new Map<string, Promise<PreparedComponent | undefined>>();

/** Metadata discovery shares the JSON cache without requesting maps or stylesheets. */
export async function loadComponentMetadata(
  designSystem: string,
  manifest: Manifest,
  component: string
): Promise<ComponentResourceArtifact | undefined> {
  if (manifest.formatVersion !== 3) throw new Error('Unsupported manifest format version.');
  const path = (
    manifest.components as Record<string, { artifacts?: { metadata?: string } }> | undefined
  )?.[component]?.artifacts?.metadata;
  if (!path) return undefined;
  const metadata = await loadSelectedComponentArtifact<ComponentResourceArtifact>(
    `${designSystem}/${path}`,
    manifest.revision ?? manifest.version
  );
  if (
    metadata.formatVersion !== 3 ||
    metadata.component !== component ||
    !metadata.resources ||
    !metadata.sizeSupport
  )
    throw new Error(`Invalid component metadata: ${component}`);
  return metadata;
}

function assertClassMap(value: unknown, component: string): void {
  if (value === undefined) return;
  const artifact = value as { formatVersion?: number; component?: string; classMap?: unknown };
  if (artifact.formatVersion !== 3 || artifact.component !== component || !artifact.classMap)
    throw new Error(`Invalid component class map: ${component}`);
}

function mergeSurfaceModes(
  base: Record<string, { modes?: Record<string, object> }> | undefined,
  selected: ReturnType<typeof decodePaletteSurfaceConfig>['variants']
) {
  if (!selected) return base;
  return {
    ...base,
    ...Object.fromEntries(
      Object.entries(selected).map(([variant, { modes, ...surface }]) => {
        const original = base?.[variant];
        if (!modes) return [variant, { ...original, ...surface }];
        return [
          variant,
          {
            ...original,
            ...surface,
            modes: {
              ...original?.modes,
              ...Object.fromEntries(
                Object.entries(modes).map(([mode, surface]) => [
                  mode,
                  { ...original?.modes?.[mode], ...surface }
                ])
              )
            }
          }
        ];
      })
    )
  };
}

/** A component is ready only after metadata, maps and every declared stylesheet have loaded. */
export function prepareComponentResources(
  designSystem: string,
  manifest: Manifest,
  component: string,
  segment: string,
  theme: string
): Promise<PreparedComponent | undefined> {
  if (manifest.formatVersion !== 3)
    return Promise.reject(new Error('Unsupported manifest format version.'));
  const path = (
    manifest.components as Record<string, { artifacts?: { metadata?: string } }> | undefined
  )?.[component]?.artifacts?.metadata;
  if (!path) return Promise.resolve(undefined);
  const revision = manifest.revision ?? manifest.version;
  const key = [designSystem, revision, component, segment, theme].join('|');
  const cached = pending.get(key);
  if (cached) return cached;
  const load = async () => {
    const metadata = await loadComponentMetadata(designSystem, manifest, component);
    if (!metadata) return undefined;
    const palettePath = metadata.resources.palettes?.[`${segment}.${theme}`];
    const palette = palettePath
      ? await loadSelectedComponentArtifact<ComponentPaletteResourceArtifact>(
          `${designSystem}/${palettePath}`,
          revision
        )
      : undefined;
    let config: ReturnType<typeof decodePaletteSurfaceConfig>;
    try {
      if (
        palettePath &&
        (!palette ||
          palette.formatVersion !== COMPONENT_PALETTE_FORMAT_VERSION ||
          palette.component !== component)
      )
        throw new Error(`Invalid component palette: ${component}`);
      config = decodePaletteSurfaceConfig(palette?.config, segment, theme);
    } catch (error) {
      if (palettePath) evictSelectedComponentArtifact(`${designSystem}/${palettePath}`, revision);
      throw error;
    }
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
    assertClassMap(core, component);
    assertClassMap(colors, component);
    const common = metadata as ComponentResourceArtifact & {
      options?: Record<string, unknown>;
      variants?: Record<string, { modes?: Record<string, object> }>;
    };
    const variants = mergeSurfaceModes(common.variants, config.variants);
    return {
      metadata: {
        ...metadata,
        ...(config.regions ? { regions: config.regions } : {}),
        ...(config.contentSurfaceContext
          ? { contentSurfaceContext: config.contentSurfaceContext }
          : {}),
        ...(variants ? { variants } : {}),
        ...(config.options || common.options
          ? { options: { ...common.options, ...config.options } }
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
