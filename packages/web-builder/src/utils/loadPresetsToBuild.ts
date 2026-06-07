import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import type { Schema } from '@kiskadee/core';

export type PresetToBuild = { schema: Schema; schemaPath: string };

export async function loadPresetsToBuild(baseDir: string): Promise<PresetToBuild[]> {
  // Presets live under packages/presets/src/presets. We only want to iterate
  // actual preset folders, not tooling under src/tools.
  const presetsDistDir = resolve(baseDir, '..', '..', 'presets', 'src', 'presets');

  const dirs = readdirSync(presetsDistDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const items: PresetToBuild[] = [];

  for (const dir of dirs) {
    const mod = (await import(`@kiskadee/presets/src/presets/${dir}/index.ts`)) as {
      schema?: Schema;
    };

    if (!mod?.schema) {
      console.warn(`[web-builder] Skipping preset "${dir}": missing schema export.`);
      continue;
    }

    items.push({
      schema: mod.schema,
      schemaPath: resolve(baseDir, '..', '..', 'presets', 'src', 'presets', dir, `${dir}.schema.ts`)
    });
  }

  return items;
}
