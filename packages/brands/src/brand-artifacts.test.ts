import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  type StandaloneKiskadeeTonalFamilyArtifact,
  verifyStandaloneKiskadeeTonalFamilyArtifact
} from '@kiskadee/tonal-scale/standalone';
import { describe, expect, it } from 'vitest';

import {
  BRAND_CATALOG_CONTRACT,
  BRAND_CATALOG_FORMAT_VERSION,
  BRAND_DEFINITIONS,
  BRAND_IDS,
  BRAND_PACK_CONTRACT,
  BRAND_PACK_DEFINITIONS,
  BRAND_PACK_FORMAT_VERSION,
  type BrandCatalogArtifact,
  type BrandPackArtifact
} from './index.ts';

const packageDir = resolve(fileURLToPath(new URL('..', import.meta.url)));

async function readJson<T>(relativePath: string): Promise<T> {
  return JSON.parse(await readFile(resolve(packageDir, relativePath), 'utf8')) as T;
}

describe('published brand artifacts', () => {
  it('keeps the catalog synchronized with the source definitions', async () => {
    const catalog = await readJson<BrandCatalogArtifact>('generated/catalog.json');

    expect(catalog.kind).toBe(BRAND_CATALOG_CONTRACT);
    expect(catalog.formatVersion).toBe(BRAND_CATALOG_FORMAT_VERSION);
    expect(catalog.generator).toEqual({
      package: '@kiskadee/brands',
      version: '0.2.0'
    });
    expect(catalog.brands.map(({ id }) => id)).toEqual(BRAND_IDS);
    expect(catalog.packs.map(({ id }) => id)).toEqual(BRAND_PACK_DEFINITIONS.map(({ id }) => id));

    for (const [index, published] of catalog.brands.entries()) {
      const source = BRAND_DEFINITIONS[index]!;
      expect(published).toMatchObject({
        ...source,
        intent: `brand.${source.id}`,
        tonalAsset: `scales/${source.id}.json`
      });
      expect(published.tonalIntegritySha256).toMatch(/^[0-9a-f]{64}$/);
    }
  });

  it('publishes non-overlapping packs that reference catalog tonal assets', async () => {
    const catalog = await readJson<BrandCatalogArtifact>('generated/catalog.json');
    const catalogBrands = new Map(catalog.brands.map((brand) => [brand.id, brand]));
    const emittedIds: string[] = [];

    for (const definition of BRAND_PACK_DEFINITIONS) {
      const pack = await readJson<BrandPackArtifact>(`generated/packs/${definition.id}.json`);
      expect(pack.kind).toBe(BRAND_PACK_CONTRACT);
      expect(pack.formatVersion).toBe(BRAND_PACK_FORMAT_VERSION);
      expect(pack.id).toBe(definition.id);
      expect(pack.brands.map(({ id }) => id)).toEqual(definition.brands);

      for (const entry of pack.brands) {
        emittedIds.push(entry.id);
        expect(entry).toEqual(
          expect.objectContaining({
            intent: `brand.${entry.id}`,
            tonalAsset: `scales/${entry.id}.json`,
            tonalIntegritySha256: catalogBrands.get(entry.id)?.tonalIntegritySha256
          })
        );
      }
    }

    expect(emittedIds).toEqual(BRAND_IDS);
    expect(new Set(emittedIds).size).toBe(BRAND_IDS.length);
  });

  it('publishes verified source-exact Light and Dark tonal assets', async () => {
    for (const definition of BRAND_DEFINITIONS) {
      const artifact = await readJson<StandaloneKiskadeeTonalFamilyArtifact>(
        `generated/scales/${definition.id}.json`
      );
      const verification = await verifyStandaloneKiskadeeTonalFamilyArtifact(artifact);

      expect(verification.valid).toBe(true);
      expect(artifact.seedHex).toBe(definition.seedHex);
      expect(artifact.policies).toEqual({
        light: 'source-exact',
        dark: 'source-exact'
      });
      expect(artifact.tonalProfile).toBe('muted-darks');
      expect(artifact.scales.light[artifact.generatedAnchors.light.tone]).toBe(definition.seedHex);
      expect(artifact.scales.dark[artifact.generatedAnchors.dark.tone]).toBe(definition.seedHex);

      for (const theme of ['light', 'dark'] as const) {
        const references = artifact.functionalReferences[theme];
        expect(artifact.scales[theme][references.subtle.tone]).toBe(references.subtle.hex);
        expect(artifact.scales[theme][references.vivid.tone]).toBe(references.vivid.hex);
      }
    }
  });

  it('uses diagnosed cap-safe vivid references for absolute-black brands', async () => {
    for (const id of ['apple', 'chat-gpt', 'tik-tok', 'x', 'threads', 'git-hub'] as const) {
      const artifact = await readJson<StandaloneKiskadeeTonalFamilyArtifact>(
        `generated/scales/${id}.json`
      );

      expect(artifact.generatedAnchors.light).toMatchObject({ tone: 100, hex: '#000000' });
      expect(artifact.generatedAnchors.dark).toMatchObject({ tone: 0, hex: '#000000' });
      expect(artifact.functionalReferences.light.vivid.source).toBe('cap-fallback');
      expect(artifact.functionalReferences.dark.vivid.source).toBe('contrast-mirror');
      expect(artifact.functionalReferences.light.vivid.tone).not.toBe(100);
      expect(artifact.functionalReferences.dark.vivid.tone).not.toBe(0);
    }
  });
});
