import { mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import {
  type ComponentSizeSupport,
  compileDensityMap,
  resolveSupportedSize,
  type Schema
} from '@kiskadee/core';
import { minifyCss } from '@kiskadee/css-build';
import { componentNameToArtifactSlug } from './componentClassMapArtifacts.ts';
import type { StylesheetResource } from './componentResources.ts';
import { artifactHash, partitionComponentCss } from './partitionComponentCss.ts';

const isRecord = (value: unknown): value is Record<string, any> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** The branch union includes actual size geometry/typography, never another variant's sizes. */
export function buildSizeSupport(branch: unknown): ComponentSizeSupport {
  if (!isRecord(branch)) return {};
  const support: ComponentSizeSupport = {};
  if (branch.elements) {
    const sizes = new Set<string>();
    const collect = (value: unknown) => {
      if (!isRecord(value)) return;
      for (const [key, child] of Object.entries(value)) {
        if (/^s:(sm|md|lg):[1-5]$/.test(key)) sizes.add(key.slice(2));
        else collect(child);
      }
    };
    for (const element of Object.values(branch.elements) as any[]) {
      collect(element.scales);
      collect(element.iconSize);
    }
    support.sizes = [...sizes].sort();
    resolveSupportedSize('md:1', support.sizes);
  }
  for (const key of ['variants', 'modes'] as const)
    if (isRecord(branch[key]))
      support[key] = Object.fromEntries(
        Object.entries(branch[key]).map(([name, child]) => [name, buildSizeSupport(child)])
      );
  return support;
}

/** Converts phase-local aggregate intermediates to the only published runtime handoff. */
export async function publishComponentResources(buildDir: string, schema: Schema) {
  const read = async (path: string) => JSON.parse(await readFile(resolve(buildDir, path), 'utf8'));
  const write = async (path: string, value: unknown) => {
    await mkdir(dirname(resolve(buildDir, path)), { recursive: true });
    await writeFile(resolve(buildDir, path), JSON.stringify(value));
  };
  const manifest = await read('manifest.json');
  let segmentMetadata: string | null = null;
  if (manifest.segmentMetadata) {
    try {
      segmentMetadata = await readFile(resolve(buildDir, manifest.segmentMetadata), 'utf8');
    } catch (cause) {
      throw new Error(
        `[web-builder] Cannot read declared segment metadata ${manifest.segmentMetadata} in ${buildDir}; rerun metadata publication before component resources`,
        { cause }
      );
    }
  }
  const global = await read('global.kiskadee.json');
  const coreMap = await read('core.kiskadee.json');
  delete coreMap.$schema;
  const paletteNames = [
    ...new Set(
      Object.entries(manifest.themes).flatMap(([segment, themes]) =>
        (themes as string[]).map((theme) => `${segment}.${theme}`)
      )
    )
  ];
  const components = {
    ...schema.components,
    ...(global.classMap?.text && !schema.components.text ? { text: {} } : {})
  };
  const resources: Record<
    string,
    {
      styles: StylesheetResource[];
      palettes: Record<
        string,
        { styles: StylesheetResource[]; classMap?: string; metadata?: string }
      >;
      core?: string;
    }
  > = {};
  for (const name of Object.keys(components)) resources[name] = { styles: [], palettes: {} };
  const globalStyles: StylesheetResource[] = [];
  const paletteStyles: Record<string, StylesheetResource[]> = {};
  const mapRevisions: string[] = [artifactHash(JSON.stringify(coreMap))];
  let order = 0;
  const split = async (file: string, maps: Record<string, unknown>, palette?: string) => {
    let css: string;
    try {
      css = await readFile(resolve(buildDir, file), 'utf8');
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') return;
      throw error;
    }
    for (const part of partitionComponentCss(css, maps)) {
      const minified = await minifyCss(part.css);
      const sha256 = artifactHash(minified);
      const path = `styles/${sha256.slice(0, 20)}.css`;
      await mkdir(resolve(buildDir, 'styles'), { recursive: true });
      await writeFile(resolve(buildDir, path), minified);
      const resource = { path, sha256, order: order++ };
      if (!part.consumers.length) {
        if (palette) {
          paletteStyles[palette] ??= [];
          paletteStyles[palette].push(resource);
        } else globalStyles.push(resource);
      }
      for (const name of part.consumers) {
        if (name === '$global') {
          globalStyles.push(resource);
          continue;
        }
        const target = resources[name];
        if (!target) throw new Error(`CSS refers to unpublished component ${name}.`);
        if (palette) {
          target.palettes[palette] ??= { styles: [] };
          target.palettes[palette].styles.push(resource);
        } else target.styles.push(resource);
      }
    }
  };
  await split('core.kiskadee.css', {
    ...coreMap,
    text: { ...coreMap.text, typography: global.classMap?.text }
  });
  for (const palette of paletteNames) {
    try {
      const map = await read(`${palette}.kiskadee.json`);
      mapRevisions.push(artifactHash(JSON.stringify(map)));
      await split(`${palette}.kiskadee.css`, map, palette);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error;
    }
  }
  await split('effects.kiskadee.css', coreMap);
  const revisions: unknown[] = [];
  for (const [name, component] of Object.entries(components)) {
    const entry = manifest.components?.[name] ?? {};
    const path = `components/${componentNameToArtifactSlug(name)}.kiskadee.json`;
    let existing = {};
    if (entry.artifacts?.metadata) existing = await read(entry.artifacts.metadata);
    const { artifacts, ...capabilities } = entry;
    const resource = resources[name]!;
    if (artifacts?.classMaps?.core) resource.core = artifacts.classMaps.core;
    const paletteCapabilities = capabilities.surfaceContexts;
    delete capabilities.surfaceContexts;
    const payload = {
      ...global.components?.[name],
      ...existing,
      options: {
        ...(component as any).options,
        ...(global.components?.[name]?.options ?? {}),
        ...((existing as any).options ?? {})
      },
      component: name,
      sizeSupport: buildSizeSupport(component),
      capabilities,
      resources: { ...resource, palettes: {} as Record<string, string> },
      ...((component as any).options?.density
        ? { density: compileDensityMap((component as any).options.density) }
        : {}),
      ...(name === 'text' && global.classMap?.text ? { classMap: global.classMap.text } : {})
    };
    const contentSurfaceContext = payload.contentSurfaceContext;
    delete payload.contentSurfaceContext;
    const canonicalSurfaces = payload.options?.canonicalSurfaces;
    if (payload.options) {
      payload.options = { ...payload.options };
      delete payload.options.density;
      delete payload.options.canonicalSurfaces;
      if (!Object.keys(payload.options).length) delete payload.options;
    }
    for (const palette of paletteNames) {
      const [segment, theme] = palette.split('.');
      const classMap = artifacts?.classMaps?.palettes?.[palette];
      const surfaceContexts = paletteCapabilities?.[palette];
      const styles = resource.palettes[palette]?.styles ?? [];
      const context = contentSurfaceContext?.[segment!]?.[theme!];
      const canonical = canonicalSurfaces?.[segment!]?.[theme!];
      if (!classMap && !surfaceContexts && !styles.length && !context && !canonical) continue;
      const palettePath = `components/${palette}/${componentNameToArtifactSlug(name)}.json`;
      const selected = {
        component: name,
        styles,
        ...(classMap ? { classMap } : {}),
        ...(surfaceContexts
          ? { capabilities: { surfaceContexts: { [palette]: surfaceContexts } } }
          : {}),
        ...(context || canonical
          ? {
              config: {
                ...(context
                  ? { contentSurfaceContext: { [segment!]: { [theme!]: context } } }
                  : {}),
                ...(canonical
                  ? { options: { canonicalSurfaces: { [segment!]: { [theme!]: canonical } } } }
                  : {})
              }
            }
          : {})
      };
      await write(palettePath, selected);
      payload.resources.palettes[palette] = palettePath;
      revisions.push(selected);
    }
    await write(path, payload);
    manifest.components[name] = { artifacts: { metadata: path } };
    revisions.push(payload);
  }
  delete global.components;
  delete global.classMap;
  if (schema.global?.density) global.density = compileDensityMap(schema.global.density);
  else delete global.density;
  manifest.formatVersion = 2;
  manifest.styles = globalStyles;
  if (Object.keys(paletteStyles).length) manifest.paletteStyles = paletteStyles;
  manifest.revision = artifactHash(
    JSON.stringify([global, revisions, mapRevisions, globalStyles, paletteStyles, segmentMetadata])
  );
  await write('global.kiskadee.json', global);
  await write('manifest.json', manifest);
  // Aggregate maps/CSS and authorship snapshots are build-only inspection outputs.
  const debugDir = resolve(buildDir, '_debug');
  await mkdir(debugDir, { recursive: true });
  for (const file of await readdir(buildDir)) {
    if (
      /^(?:core|effects|[^.]+\.(?:light|dark|darker))\.kiskadee\.(?:json|css)$/.test(file) ||
      file === 'schema.json' ||
      file === 'core.kiskadee.schema.json'
    )
      await rename(resolve(buildDir, file), resolve(debugDir, file));
  }
}
