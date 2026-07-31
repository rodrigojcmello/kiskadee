import { createHash } from 'node:crypto';
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import type { BrandPackArtifact, BrandPackId } from '@kiskadee/brands';
import {
  BRAND_PACK_CONTRACT,
  BRAND_PACK_FORMAT_VERSION,
  isBrandId,
  isBrandPackId
} from '@kiskadee/brands';
import type { Schema } from '@kiskadee/core';
import { minifyCss } from '@kiskadee/css-build';
import type { PresetBrandPackBuildExtension } from '@kiskadee/presets/src/preset-build-extensions.ts';
import {
  type StandaloneKiskadeeTonalFamilyArtifact,
  verifyStandaloneKiskadeeTonalFamilyArtifact
} from '@kiskadee/tonal-scale/standalone';
import {
  buildComponentClassMapArtifact,
  componentNameToArtifactSlug
} from '../component-artifacts/componentClassMapArtifacts.ts';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import { mapStyleKeyUsage } from '../phase-2-map-style-key-usage/mapStyleKeyUsage.ts';
import { shortenCssClassNames } from '../phase-3-shorten-css-class-names/shortenCssClassNames.ts';
import { generateCssSplit } from '../phase-4-convert-style-keys-to-css-rules/generateCssSplit.ts';
import { generateClassNamesMapSplit } from '../phase-5-generate-class-names-map/generateClassNamesMap.ts';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy.ts';
import {
  BRAND_PACK_BUILD_CONTRACT,
  BRAND_PACK_BUILD_FORMAT_VERSION,
  type BrandPackBuildManifest
} from './brandPackArtifacts.ts';

type JsonModule<T> = { default: T };

function hash(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

function slugifyName(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function hasEntries(value: unknown): value is Record<string, unknown> {
  return (
    typeof value === 'object' &&
    value !== null &&
    !Array.isArray(value) &&
    Object.keys(value).length > 0
  );
}

async function loadJsonModule<T>(specifier: string): Promise<T> {
  const module = (await import(specifier, {
    with: { type: 'json' }
  })) as JsonModule<T>;
  return module.default;
}

async function loadBrandPack(packId: BrandPackId): Promise<{
  pack: BrandPackArtifact;
  scales: StandaloneKiskadeeTonalFamilyArtifact[];
}> {
  const pack = await loadJsonModule<BrandPackArtifact>(`@kiskadee/brands/packs/${packId}.json`);
  assertBrandPackArtifact(pack, packId);
  const scales = await Promise.all(
    pack.brands.map((brand) =>
      loadJsonModule<StandaloneKiskadeeTonalFamilyArtifact>(
        `@kiskadee/brands/scales/${brand.id}.json`
      )
    )
  );
  await assertStandaloneScales(pack, scales);
  return { pack, scales };
}

function assertBrandPackArtifact(pack: BrandPackArtifact, requestedPackId: BrandPackId): void {
  if (pack.kind !== BRAND_PACK_CONTRACT || pack.formatVersion !== BRAND_PACK_FORMAT_VERSION) {
    throw new Error(`Brand pack "${requestedPackId}" uses an unsupported contract.`);
  }
  if (!isBrandPackId(pack.id) || pack.id !== requestedPackId) {
    throw new Error(
      `Brand pack "${requestedPackId}" resolved the unexpected ID "${String(pack.id)}".`
    );
  }
  if (pack.brands.length === 0) {
    throw new Error(`Brand pack "${pack.id}" cannot be empty.`);
  }

  const seen = new Set<string>();
  for (const brand of pack.brands) {
    if (!isBrandId(brand.id)) {
      throw new Error(`Brand pack "${pack.id}" contains unknown brand "${brand.id}".`);
    }
    if (seen.has(brand.id)) {
      throw new Error(`Brand pack "${pack.id}" duplicates brand "${brand.id}".`);
    }
    seen.add(brand.id);

    if (brand.intent !== `brand.${brand.id}`) {
      throw new Error(`Brand pack "${pack.id}" has an invalid intent for "${brand.id}".`);
    }
    if (brand.tonalAsset !== `scales/${brand.id}.json`) {
      throw new Error(`Brand pack "${pack.id}" has an invalid tonal asset for "${brand.id}".`);
    }
    if (brand.iconId.trim() === '') {
      throw new Error(`Brand pack "${pack.id}" is missing iconId for "${brand.id}".`);
    }
    if (brand.contentPolarity !== 'light' && brand.contentPolarity !== 'dark') {
      throw new Error(`Brand pack "${pack.id}" has invalid content polarity for "${brand.id}".`);
    }
  }
}

async function assertStandaloneScales(
  pack: BrandPackArtifact,
  scales: readonly StandaloneKiskadeeTonalFamilyArtifact[]
): Promise<void> {
  if (scales.length !== pack.brands.length) {
    throw new Error(`Brand pack "${pack.id}" did not resolve every tonal scale.`);
  }

  for (const [index, brand] of pack.brands.entries()) {
    const scale = scales[index];
    if (!scale) {
      throw new Error(`Brand pack "${pack.id}" is missing tonal scale "${brand.id}".`);
    }
    if (scale.integrity.payloadSha256 !== brand.tonalIntegritySha256) {
      throw new Error(`Brand pack "${pack.id}" references a stale tonal scale for "${brand.id}".`);
    }

    const verification = await verifyStandaloneKiskadeeTonalFamilyArtifact(scale);
    if (!verification.valid) {
      const details = verification.issues
        .map((issue) => `${issue.path}: ${issue.message}`)
        .join('; ');
      throw new Error(
        `Brand pack "${pack.id}" has an invalid tonal scale for "${brand.id}": ${details}`
      );
    }
  }
}

function createProjectedSchema(
  schema: Schema,
  extension: PresetBrandPackBuildExtension,
  pack: BrandPackArtifact,
  scales: readonly StandaloneKiskadeeTonalFamilyArtifact[]
): Schema {
  const scaleByBrand = new Map(
    pack.brands.map((brand, index) => [brand.id, scales[index]!] as const)
  );
  const components = extension.project(
    pack.brands.map((brand) => {
      const scale = scaleByBrand.get(brand.id);
      if (!scale) {
        throw new Error(`Brand pack "${pack.id}" is missing tonal scale "${brand.id}".`);
      }

      return {
        id: brand.id,
        contentPolarity: brand.contentPolarity,
        scales: scale.scales,
        functionalReferences: scale.functionalReferences
      };
    })
  );

  return {
    name: `${schema.name} Brand Pack ${pack.id}`,
    prefix: schema.prefix,
    version: schema.version,
    author: schema.author,
    breakpoints: schema.breakpoints,
    components
  } as unknown as Schema;
}

async function persistPack({
  buildDir,
  designSystem,
  namespace,
  pack,
  components,
  expectedPalettes,
  cssByPalette,
  classMapsByPalette
}: {
  buildDir: string;
  designSystem: string;
  namespace: string;
  pack: BrandPackArtifact;
  components: readonly string[];
  expectedPalettes: readonly string[];
  cssByPalette: Record<string, string>;
  classMapsByPalette: Record<string, Record<string, unknown>>;
}): Promise<void> {
  assertExactPaletteSet(pack.id, expectedPalettes, cssByPalette, 'CSS');
  assertExactPaletteSet(pack.id, expectedPalettes, classMapsByPalette, 'class map');

  const packDir = resolve(buildDir, 'brand-packs', pack.id);
  await rm(packDir, { recursive: true, force: true });
  await mkdir(packDir, { recursive: true });

  const palettes: BrandPackBuildManifest['palettes'] = {};

  for (const paletteName of Object.keys(cssByPalette).sort()) {
    const minifiedCss = await minifyCss(cssByPalette[paletteName] ?? '');
    const cssSha256 = hash(minifiedCss);
    const cssPath = `${paletteName}.${cssSha256.slice(0, 12)}.kiskadee.css`;
    await writeFile(resolve(packDir, cssPath), minifiedCss, 'utf8');

    const classMapPaths: Record<string, string> = {};
    const classMapHashes: Record<string, string> = {};

    for (const component of components) {
      const componentMap = classMapsByPalette[paletteName]?.[component];
      if (!hasEntries(componentMap)) {
        throw new Error(
          `Brand pack "${pack.id}" did not emit a "${component}" class map for "${paletteName}".`
        );
      }
      const classMapPayload = buildComponentClassMapArtifact(component, componentMap);
      const classMapJson = `${JSON.stringify(classMapPayload, null, 2)}\n`;
      const classMapSha256 = hash(classMapJson);
      const classMapPath = `class-maps/${paletteName}/${componentNameToArtifactSlug(
        component
      )}.${classMapSha256.slice(0, 12)}.kiskadee.json`;
      const physicalClassMapPath = resolve(packDir, classMapPath);
      await mkdir(dirname(physicalClassMapPath), { recursive: true });
      await writeFile(physicalClassMapPath, classMapJson, 'utf8');
      classMapPaths[component] = classMapPath;
      classMapHashes[component] = classMapSha256;
    }

    palettes[paletteName] = {
      css: cssPath,
      cssSha256,
      classMaps: classMapPaths,
      classMapSha256: classMapHashes
    };
  }

  const manifest: BrandPackBuildManifest = {
    kind: BRAND_PACK_BUILD_CONTRACT,
    formatVersion: BRAND_PACK_BUILD_FORMAT_VERSION,
    designSystem,
    pack: pack.id,
    namespace,
    brands: pack.brands.map((brand) => ({
      id: brand.id,
      intent: brand.intent,
      iconId: brand.iconId,
      contentPolarity: brand.contentPolarity,
      tonalIntegritySha256: brand.tonalIntegritySha256
    })),
    components: [...components],
    palettes
  };
  await writeFile(resolve(packDir, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
}

function assertExactPaletteSet(
  packId: BrandPackId,
  expectedPalettes: readonly string[],
  palettes: Record<string, unknown>,
  artifactKind: string
): void {
  const actual = Object.keys(palettes).sort();
  const expected = [...expectedPalettes].sort();
  if (
    actual.length !== expected.length ||
    actual.some((palette, index) => palette !== expected[index])
  ) {
    throw new Error(
      `Brand pack "${packId}" emitted unexpected ${artifactKind} palettes: ${actual.join(', ')}.`
    );
  }
}

function assertBrandPackBuildExtension(extension: PresetBrandPackBuildExtension): void {
  if (extension.projectionContract.trim() === '') {
    throw new Error('Brand pack build extension requires a projection contract.');
  }
  if (extension.packs.length === 0) {
    throw new Error('Brand pack build extension requires at least one pack.');
  }
  if (extension.palettes.length === 0) {
    throw new Error('Brand pack build extension requires at least one palette.');
  }

  const packs = new Set<string>();
  for (const packId of extension.packs) {
    if (!isBrandPackId(packId)) {
      throw new Error(`Brand pack build extension references unknown pack "${packId}".`);
    }
    if (packs.has(packId)) {
      throw new Error(`Brand pack build extension duplicates pack "${packId}".`);
    }
    packs.add(packId);
  }

  const palettes = new Set<string>();
  for (const palette of extension.palettes) {
    if (palette.trim() === '') {
      throw new Error('Brand pack build extension contains an empty palette.');
    }
    if (palettes.has(palette)) {
      throw new Error(`Brand pack build extension duplicates palette "${palette}".`);
    }
    palettes.add(palette);
  }
}

async function buildBrandPack({
  schema,
  extension,
  baseBuildDir,
  outDirSlug,
  packId
}: {
  schema: Schema;
  extension: PresetBrandPackBuildExtension;
  baseBuildDir: string;
  outDirSlug: string;
  packId: BrandPackId;
}): Promise<void> {
  const { pack, scales } = await loadBrandPack(packId);
  const projectionHash = hash(
    JSON.stringify({
      contract: extension.projectionContract,
      pack: pack.id,
      brands: pack.brands.map((brand) => ({
        id: brand.id,
        tonalIntegritySha256: brand.tonalIntegritySha256,
        contentPolarity: brand.contentPolarity
      }))
    })
  ).slice(0, 10);
  const namespacePrefix = slugifyName(schema.prefix ?? schema.name);
  const namespace = `${namespacePrefix}-brand-${pack.id}-${projectionHash}`;
  const projectedSchema = createProjectedSchema(schema, extension, pack, scales);
  const components = Object.keys(projectedSchema.components).sort();
  if (components.length === 0) {
    throw new Error(
      `Brand pack projection "${extension.projectionContract}" did not emit any components.`
    );
  }
  const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys(projectedSchema);
  const usage = mapStyleKeyUsage(styleKeys, {
    webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
  });
  const shortened = shortenCssClassNames(usage, {
    prefix: `${namespace}-`
  });
  const css = await generateCssSplit(styleKeys, shortened, {
    forceState: true,
    webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
  });
  const classMaps = generateClassNamesMapSplit(styleKeys, shortened, toneMetadataByPalette, {
    webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
  });

  await persistPack({
    buildDir: resolve(baseBuildDir, outDirSlug),
    designSystem: outDirSlug,
    namespace,
    pack,
    components,
    expectedPalettes: extension.palettes,
    cssByPalette: css.palettes,
    classMapsByPalette: classMaps.palettes as Record<string, Record<string, unknown>>
  });
}

export async function buildOptionalBrandPacksForPreset({
  schema,
  extension,
  outDirSlug,
  baseBuildDir
}: {
  schema: Schema;
  extension?: PresetBrandPackBuildExtension;
  outDirSlug: string;
  baseBuildDir: string;
}): Promise<void> {
  if (!extension) return;
  assertBrandPackBuildExtension(extension);

  for (const packId of extension.packs) {
    await buildBrandPack({
      schema,
      extension,
      baseBuildDir,
      outDirSlug,
      packId: packId as BrandPackId
    });
  }
}
