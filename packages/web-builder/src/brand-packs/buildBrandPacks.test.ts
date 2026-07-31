import { createHash } from 'node:crypto';
import { mkdtemp, readdir, readFile, rm, stat } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { getBrandPackDefinition } from '@kiskadee/brands';
import type { Schema } from '@kiskadee/core';
import {
  buildExtensions as fluent2MicrosoftBuildExtensions,
  schema as fluent2MicrosoftSchema
} from '@kiskadee/presets/src/presets/fluent-2-microsoft/index.ts';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { ComponentClassMapArtifactJSON } from '../component-artifacts/componentClassMapArtifacts.ts';
import { convertElementSchemaToStyleKeys } from '../phase-1-convert-schema-to-style-keys/convertElementSchemaToStyleKeys.ts';
import type { BrandPackBuildManifest } from './brandPackArtifacts.ts';
import { buildOptionalBrandPacksForPreset } from './buildBrandPacks.ts';

const FLUENT_SCHEMA = {
  name: 'Fluent',
  author: 'Microsoft',
  prefix: 'fm',
  version: [2, 0, 0],
  components: {}
} as unknown as Schema;

const AUTH_BRANDS = ['brand.apple', 'brand.google', 'brand.microsoft'] as const;
const SOCIAL_BRANDS = getBrandPackDefinition('social').brands.map((id) => `brand.${id}`);
const PALETTES = ['default.dark', 'default.darker', 'default.light'] as const;
const SURFACE_CONTEXT_KEYS = ['s', 'v'] as const;
const EMPHASIS_KEYS = ['h', 'l', 'll', 'm'] as const;

function sha256(value: string): string {
  return createHash('sha256').update(value).digest('hex');
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, 'utf8')) as T;
}

async function snapshotFiles(root: string): Promise<Record<string, string>> {
  const relativePaths = (await readdir(root, { recursive: true })).map(String).sort();
  const snapshot: Record<string, string> = {};

  for (const relativePath of relativePaths) {
    const physicalPath = resolve(root, relativePath);
    if ((await stat(physicalPath)).isFile()) {
      snapshot[relativePath] = await readFile(physicalPath, 'utf8');
    }
  }

  return snapshot;
}

function expectIntentMatrix(
  artifact: ComponentClassMapArtifactJSON<Record<string, unknown>>,
  intents: readonly string[]
): void {
  expect(artifact.component).toBe('button');
  const classMap = artifact.classMap as Record<
    string,
    { c?: Record<string, Record<string, Record<string, string>>> }
  >;

  for (const element of ['e1', 'e2', 'e3']) {
    const colorMap = classMap[element]?.c;
    expect(colorMap).toBeDefined();

    for (const context of SURFACE_CONTEXT_KEYS) {
      expect(Object.keys(colorMap?.[context] ?? {}).sort()).toEqual([...intents].sort());
      for (const intent of intents) {
        expect(Object.keys(colorMap?.[context]?.[intent] ?? {}).sort()).toEqual([...EMPHASIS_KEYS]);
      }
    }
  }
}

describe('buildOptionalBrandPacksForPreset', () => {
  it('does not publish brand resources for unsupported presets', async () => {
    const root = await mkdtemp(join(tmpdir(), 'kiskadee-no-brand-pack-'));
    try {
      await buildOptionalBrandPacksForPreset({
        schema: {
          name: 'Material Design',
          author: 'Google',
          version: [3, 0, 0],
          components: {}
        } as unknown as Schema,
        outDirSlug: 'material-design-3-google',
        baseBuildDir: root
      });

      expect(await readdir(root)).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('does not infer brand-pack support from preset metadata', async () => {
    const root = await mkdtemp(join(tmpdir(), 'kiskadee-no-inferred-brand-pack-'));
    try {
      await buildOptionalBrandPacksForPreset({
        schema: FLUENT_SCHEMA,
        outDirSlug: 'fluent-2-microsoft',
        baseBuildDir: root
      });

      expect(await readdir(root)).toEqual([]);
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });

  it('keeps brand intents out of the normal Fluent preset projection', () => {
    const { styleKeys } = convertElementSchemaToStyleKeys(fluent2MicrosoftSchema);
    expect(JSON.stringify(styleKeys)).not.toContain('brand.');
  });
});

describe('Fluent 2 Microsoft brand pack artifacts', () => {
  let firstRoot: string;
  let secondRoot: string;
  const outDirSlug = 'fluent-2-microsoft';

  beforeAll(async () => {
    firstRoot = await mkdtemp(join(tmpdir(), 'kiskadee-brand-pack-a-'));
    secondRoot = await mkdtemp(join(tmpdir(), 'kiskadee-brand-pack-b-'));

    await buildOptionalBrandPacksForPreset({
      schema: FLUENT_SCHEMA,
      extension: fluent2MicrosoftBuildExtensions.brandPacks,
      outDirSlug,
      baseBuildDir: firstRoot
    });
    await buildOptionalBrandPacksForPreset({
      schema: FLUENT_SCHEMA,
      extension: fluent2MicrosoftBuildExtensions.brandPacks,
      outDirSlug,
      baseBuildDir: secondRoot
    });
  }, 120_000);

  afterAll(async () => {
    await Promise.all([
      rm(firstRoot, { recursive: true, force: true }),
      rm(secondRoot, { recursive: true, force: true })
    ]);
  });

  it('publishes deterministic pack bytes outside normal preset artifacts', async () => {
    const firstBuild = resolve(firstRoot, outDirSlug);
    const secondBuild = resolve(secondRoot, outDirSlug);
    const firstSnapshot = await snapshotFiles(firstBuild);

    expect(firstSnapshot).toEqual(await snapshotFiles(secondBuild));
    expect(Object.keys(firstSnapshot)).toHaveLength(14);
    expect(Object.keys(firstSnapshot)).toEqual(
      expect.arrayContaining(['brand-packs/auth/manifest.json', 'brand-packs/social/manifest.json'])
    );
    expect(Object.keys(firstSnapshot)).toEqual(
      expect.not.arrayContaining(['colors.json', 'default.light.kiskadee.css'])
    );
  });

  it.each([
    ['auth', AUTH_BRANDS],
    ['social', SOCIAL_BRANDS]
  ] as const)('publishes the %s pack with complete Fluent Button matrices', async (pack, intents) => {
    const packDir = resolve(firstRoot, outDirSlug, 'brand-packs', pack);
    const manifest = await readJson<BrandPackBuildManifest>(resolve(packDir, 'manifest.json'));

    expect(manifest.pack).toBe(pack);
    expect(manifest.designSystem).toBe(outDirSlug);
    expect(manifest.components).toEqual(['button']);
    expect(manifest.namespace).toMatch(new RegExp(`^fm-brand-${pack}-[a-f0-9]{10}$`));
    expect(manifest.brands.map((brand) => brand.intent)).toEqual(intents);
    expect(Object.keys(manifest.palettes).sort()).toEqual([...PALETTES]);

    for (const palette of PALETTES) {
      const paletteArtifact = manifest.palettes[palette];
      expect(paletteArtifact).toBeDefined();
      if (!paletteArtifact) continue;

      const css = await readFile(resolve(packDir, paletteArtifact.css), 'utf8');
      expect(sha256(css)).toBe(paletteArtifact.cssSha256);
      expect(css).toContain(`${manifest.namespace}-`);
      expect(css).toContain(':hover');
      expect(css).toContain(':active');
      expect(css).toContain('.-s.-a');
      expect(css).toContain('.-d.-a');

      const classMapPath = paletteArtifact.classMaps.button;
      const classMapJson = await readFile(resolve(packDir, classMapPath), 'utf8');
      expect(sha256(classMapJson)).toBe(paletteArtifact.classMapSha256.button);
      expectIntentMatrix(
        JSON.parse(classMapJson) as ComponentClassMapArtifactJSON<Record<string, unknown>>,
        intents
      );
    }
  });

  it('uses isolated namespaces for auth and social', async () => {
    const base = resolve(firstRoot, outDirSlug, 'brand-packs');
    const auth = await readJson<BrandPackBuildManifest>(resolve(base, 'auth', 'manifest.json'));
    const social = await readJson<BrandPackBuildManifest>(resolve(base, 'social', 'manifest.json'));

    expect(auth.namespace).not.toBe(social.namespace);
    expect(auth.brands.map((brand) => brand.intent)).not.toEqual(
      social.brands.map((brand) => brand.intent)
    );
  });
});
