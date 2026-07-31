import { mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  formatStandaloneKiskadeeTonalFamilyArtifact,
  generateStandaloneKiskadeeTonalFamily,
  type StandaloneKiskadeeTonalFamilyArtifact,
  verifyStandaloneKiskadeeTonalFamilyArtifact
} from '@kiskadee/tonal-scale/standalone';

import {
  BRAND_CATALOG_CONTRACT,
  BRAND_CATALOG_FORMAT_VERSION,
  BRAND_DEFINITIONS,
  BRAND_PACK_CONTRACT,
  BRAND_PACK_DEFINITIONS,
  BRAND_PACK_FORMAT_VERSION,
  type BrandCatalogArtifact,
  type BrandId,
  type BrandPackArtifact,
  type BrandPackId,
  type GeneratedBrandArtifacts,
  publishBrandDefinition
} from '../src/index.ts';

const PACKAGE_NAME = '@kiskadee/brands' as const;
const PACKAGE_VERSION = '0.2.0';
const TONAL_PROFILE = 'muted-darks' as const;

const packageDir = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const generatedDir = resolve(packageDir, 'generated');
const checkMode = process.argv.includes('--check');

type GeneratedFile = {
  path: string;
  contents: string;
};

function formatCanonicalJsonFile(value: unknown): string {
  const canonicalize = (input: unknown): unknown => {
    if (Array.isArray(input)) return input.map(canonicalize);
    if (input && typeof input === 'object') {
      return Object.fromEntries(
        Object.entries(input)
          .sort(([left], [right]) => left.localeCompare(right))
          .map(([key, nested]) => [key, canonicalize(nested)])
      );
    }
    return input;
  };

  const formatted = JSON.stringify(canonicalize(value), null, 2);
  const biomeCompatible = formatted.replace(
    /"brands": \[\n\s+"([^"]+)",\n\s+"([^"]+)",\n\s+"([^"]+)"\n\s+\]/g,
    '"brands": ["$1", "$2", "$3"]'
  );
  return `${biomeCompatible}\n`;
}

async function generateScale(
  id: BrandId,
  seedHex: string
): Promise<readonly [BrandId, StandaloneKiskadeeTonalFamilyArtifact]> {
  const artifact = await generateStandaloneKiskadeeTonalFamily({
    seedHex,
    tonalProfile: TONAL_PROFILE,
    lightPolicy: 'source-exact',
    darkPolicy: 'source-exact'
  });

  const verification = await verifyStandaloneKiskadeeTonalFamilyArtifact(artifact);
  if (!verification.valid) {
    throw new Error(
      `Generated tonal artifact for ${id} failed verification: ${JSON.stringify(verification, null, 2)}`
    );
  }

  return [id, artifact];
}

async function generateArtifacts(): Promise<GeneratedBrandArtifacts> {
  const scaleEntries = await Promise.all(
    BRAND_DEFINITIONS.map(({ id, seedHex }) => generateScale(id, seedHex))
  );
  const scales = Object.fromEntries(scaleEntries) as Record<
    BrandId,
    StandaloneKiskadeeTonalFamilyArtifact
  >;
  const publishedBrands = BRAND_DEFINITIONS.map((definition) =>
    publishBrandDefinition(definition, scales[definition.id])
  );
  const generator = { package: PACKAGE_NAME, version: PACKAGE_VERSION } as const;

  const packs = Object.fromEntries(
    BRAND_PACK_DEFINITIONS.map(({ id, brands }) => {
      const entries = brands.map((brandId) => {
        const brand = publishedBrands.find((candidate) => candidate.id === brandId);
        if (!brand) throw new Error(`Pack ${id} references unknown brand ${brandId}.`);

        return {
          id: brand.id,
          intent: brand.intent,
          iconId: brand.iconId,
          contentPolarity: brand.contentPolarity,
          tonalAsset: brand.tonalAsset,
          tonalIntegritySha256: brand.tonalIntegritySha256
        };
      });

      return [
        id,
        {
          kind: BRAND_PACK_CONTRACT,
          formatVersion: BRAND_PACK_FORMAT_VERSION,
          generator,
          id,
          brands: entries
        } satisfies BrandPackArtifact
      ];
    })
  ) as unknown as Record<BrandPackId, BrandPackArtifact>;

  const catalog = {
    kind: BRAND_CATALOG_CONTRACT,
    formatVersion: BRAND_CATALOG_FORMAT_VERSION,
    generator,
    brands: publishedBrands,
    packs: BRAND_PACK_DEFINITIONS.map(({ id, brands }) => ({
      id,
      asset: `packs/${id}.json`,
      brands
    }))
  } satisfies BrandCatalogArtifact;

  return { catalog, packs, scales };
}

function collectGeneratedFiles(artifacts: GeneratedBrandArtifacts): GeneratedFile[] {
  return [
    {
      path: resolve(generatedDir, 'catalog.json'),
      contents: formatCanonicalJsonFile(artifacts.catalog)
    },
    ...BRAND_PACK_DEFINITIONS.map(({ id }) => ({
      path: resolve(generatedDir, 'packs', `${id}.json`),
      contents: formatCanonicalJsonFile(artifacts.packs[id])
    })),
    ...BRAND_DEFINITIONS.map(({ id }) => ({
      path: resolve(generatedDir, 'scales', `${id}.json`),
      contents: formatStandaloneKiskadeeTonalFamilyArtifact(artifacts.scales[id])
    }))
  ];
}

async function listJsonFiles(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true }).catch(
    (error: NodeJS.ErrnoException) => {
      if (error.code === 'ENOENT') return [];
      throw error;
    }
  );
  const nested = await Promise.all(
    entries.map((entry) => {
      const path = resolve(directory, entry.name);
      return entry.isDirectory()
        ? listJsonFiles(path)
        : Promise.resolve(entry.name.endsWith('.json') ? [path] : []);
    })
  );
  return nested.flat().sort();
}

async function checkGeneratedFiles(files: readonly GeneratedFile[]): Promise<void> {
  const expectedPaths = files.map(({ path }) => path).sort();
  const actualPaths = await listJsonFiles(generatedDir);
  const unexpected = actualPaths.filter((path) => !expectedPaths.includes(path));
  const missing = expectedPaths.filter((path) => !actualPaths.includes(path));
  const stale: string[] = [];

  for (const file of files) {
    const current = await readFile(file.path, 'utf8').catch(() => null);
    if (current !== file.contents) stale.push(file.path);
  }

  if (unexpected.length || missing.length || stale.length) {
    const display = (paths: readonly string[]) =>
      paths.map((path) => relative(packageDir, path)).join(', ') || 'none';
    throw new Error(
      [
        'Generated brand artifacts are stale.',
        `Missing: ${display(missing)}`,
        `Unexpected: ${display(unexpected)}`,
        `Changed: ${display(stale)}`,
        'Run `pnpm --filter @kiskadee/brands generate`.'
      ].join('\n')
    );
  }
}

async function writeGeneratedFiles(files: readonly GeneratedFile[]): Promise<void> {
  for (const file of files) {
    await mkdir(dirname(file.path), { recursive: true });
    await writeFile(file.path, file.contents, 'utf8');
  }
}

const artifacts = await generateArtifacts();
const files = collectGeneratedFiles(artifacts);

if (checkMode) {
  await checkGeneratedFiles(files);
} else {
  await writeGeneratedFiles(files);
}
