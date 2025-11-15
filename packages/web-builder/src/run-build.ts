import { readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Schema, SchemaSegments } from '@kiskadee/core';
import { convertElementSchemaToStyleKeys } from './phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys';
import {
  mapStyleKeyUsage,
  type StyleKeyUsageMap
} from './phase-2-map-style-key-usage/mapStyleKeyUsage';
import {
  type ShortenCssClassNames,
  shortenCssClassNames
} from './phase-3-shorten-css-class-names/shortenCssClassNames';
import { generateCssSplit } from './phase-4-convert-style-keys-to-css-rules/generateCssSplit';
import {
  type ComponentClassNameMapSplit,
  generateClassNamesMapSplit
} from './phase-5-generate-class-names-map/generateClassNamesMap';
import { persistBuildArtifacts } from './phase-6-persist-build-artifacts/persistBuildArtifacts';
import { publishMetadata } from './phase-7-publish-metadata/publishMetadata';

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function loadPresetsToBuild(): Promise<
  Array<{ schema: Schema; segments: SchemaSegments; schemaPath: string }>
> {
  const presetsDistDir = resolve(__dirname, '..', '..', 'presets', 'src');

  const dirs = readdirSync(presetsDistDir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .map((e) => e.name);

  const items: Array<{ schema: Schema; segments: SchemaSegments; schemaPath: string }> = [];

  for (const dir of dirs) {
    const mod = (await import(`@kiskadee/presets/src/${dir}`)) as {
      schema?: Schema;
      segments?: SchemaSegments;
    };

    if (!mod?.schema || !mod?.segments) {
      console.warn(`Ignorando preset "${dir}": não exporta schema/segments.`);
      continue;
    }

    items.push({
      schema: mod.schema,
      segments: mod.segments,
      schemaPath: resolve(__dirname, '..', '..', 'presets', 'src', dir, `${dir}.schema.ts`)
    });
  }

  return items;
}

const baseBuildDir = resolve(__dirname, '..', '..', 'build');

(async () => {
  const presetsToBuild = await loadPresetsToBuild();
  for (const t of presetsToBuild) {
    const { schema, segments, schemaPath } = t;

    // Phase 1 - Convert Element Schema to Style Keys
    const { styleKeys, toneMetadata } = convertElementSchemaToStyleKeys(schema);
    console.log('phase 1', { name: schema.name, styleKeys: JSON.stringify(styleKeys, null, 2) });

    // Phase 2 - Map style key usage
    const styleKeyUsage: StyleKeyUsageMap = mapStyleKeyUsage(styleKeys);
    console.log('phase  2', { name: schema.name, styleKeyUsage });

    // Phase 3 - Shorten class names
    const shortenCssClassNameMap: ShortenCssClassNames = shortenCssClassNames(styleKeyUsage);
    console.log('phase 3', { name: schema.name, shortenCssClassNameMap });

    // Phase 4 - Generate CSS split
    const cssGenerated = await generateCssSplit(styleKeys, shortenCssClassNameMap, true);
    console.log('phase 4', { name: schema.name, cssGenerated });

    // Phase 5 - Generate class names map split
    const classNamesMapSplit: ComponentClassNameMapSplit = generateClassNamesMapSplit(
      styleKeys,
      shortenCssClassNameMap,
      toneMetadata
    );
    console.log('phrase 5', { name: schema.name, classNamesMapSplit });

    // Compute out dir
    const major = schema.version[0];
    const outDirSlug = `${slugifyName(schema.name)}-${major}-${slugifyName(schema.author || '')}`;

    // Phase 6 - Persist CSS & maps
    await persistBuildArtifacts(cssGenerated, classNamesMapSplit, outDirSlug);

    // Phase 7 - Publish manifest + raw schema/segments
    await publishMetadata({
      schema,
      segments,
      outDirSlug,
      schemaPath: schemaPath,
      baseBuildDir
    });
  }
})();
