import { readdir } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Schema } from '@kiskadee/core';
import type { PresetBuildExtensions } from '@kiskadee/presets/src/preset-build-extensions.ts';

export type SurfacePreset = {
  key: string;
  schema: Schema;
  schemaPath: string;
  buildExtensions?: PresetBuildExtensions;
};

const presetsDirectory = fileURLToPath(new URL('../../presets/src/presets/', import.meta.url));

function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getSurfacePresetKey(schema: Schema): string {
  return `${slugify(schema.name)}-${schema.version[0]}-${slugify(schema.author || '')}`;
}

export async function loadSurfacePresets(): Promise<SurfacePreset[]> {
  const entries = await readdir(presetsDirectory, { withFileTypes: true });
  const presets: SurfacePreset[] = [];
  const keys = new Set<string>();

  for (const name of entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()) {
    const { schema, buildExtensions } = (await import(
      `@kiskadee/presets/src/presets/${name}/index.ts`
    )) as {
      schema?: Schema;
      buildExtensions?: PresetBuildExtensions;
    };
    if (!schema) {
      console.warn(`[surface-builder] Skipping preset "${name}": missing schema export.`);
      continue;
    }
    const key = getSurfacePresetKey(schema);
    if (keys.has(key)) throw new Error(`[surface-builder] Duplicate preset key "${key}".`);
    keys.add(key);
    presets.push({
      key,
      schema,
      schemaPath: resolve(presetsDirectory, name, `${name}.schema.ts`),
      ...(buildExtensions && { buildExtensions })
    });
  }
  return presets;
}
