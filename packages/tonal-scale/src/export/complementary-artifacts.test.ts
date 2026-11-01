import { readFile } from 'node:fs/promises';
import { gunzipSync } from 'node:zlib';
import { beforeAll, describe, expect, it } from 'vitest';
import { classifyTonalReference } from '../color-classification.ts';
import { generateKiskadeeTonalSystem } from '../tonal-system.ts';
import { DEFAULT_TONAL_SYSTEM_RECIPE } from '../tonal-system-contract.ts';
import { formatCanonicalJsonFile } from './canonical-json.ts';
import { projectPresetAsset } from './preset-asset.ts';
import { sha256Hex } from './sha256.ts';
import {
  createTonalArtifactBundle,
  TONAL_DIAGNOSTICS_PATH,
  TONAL_MANIFEST_PATH,
  TONAL_SOURCE_PATH,
  type TonalArtifactBundle,
  verifyTonalArtifactBundle
} from './tonal-artifacts.ts';

describe('Complementary color export', () => {
  let bundle: TonalArtifactBundle;

  beforeAll(async () => {
    const result = generateKiskadeeTonalSystem({
      ...DEFAULT_TONAL_SYSTEM_RECIPE,
      catalog: {
        colors: [
          {
            id: 'pb.indigo.v2',
            seedHex: '#5b5fc7',
            policies: { light: 'source-exact', dark: 'adaptive' }
          }
        ],
        names: {},
        neutrals: [],
        complementaryColors: [
          {
            id: 'b.blue.v1.c',
            sourceId: 'primary',
            strategy: 'material-complement-v1'
          },
          {
            id: 'pb.indigo.v2.c',
            sourceId: 'pb.indigo.v2',
            strategy: 'material-complement-v1',
            tonalProfile: 'balanced'
          }
        ]
      }
    });
    expect(result.valid, JSON.stringify(result.issues)).toBe(true);
    if (!result.valid) throw new Error('Complementary export fixture must resolve.');
    bundle = await createTonalArtifactBundle(result);
  }, 120000);

  it('publishes origin, strategy and actual profile without mistaking lineage for appearance', () => {
    const asset = bundle.assets.find((family) => family.id === 'pb.indigo.v2.c')!;
    expect(asset.seedOrigin).toBe('derived');
    expect(bundle.assets.find((family) => family.id === 'b.blue.v1.c')).toMatchObject({
      variant: 'v1',
      seedOrigin: 'derived'
    });
    expect(asset.formatVersion).toBe(8);
    expect(asset.tonalProfile).toBe('balanced');
    expect(asset.complementaryColorOrigin).toEqual({
      sourceId: 'pb.indigo.v2',
      referenceHex: bundle.assets.find((family) => family.id === 'pb.indigo.v2')!.restColors.light
        .hex,
      strategy: 'material-complement-v1',
      tonalProfile: 'balanced'
    });
    expect(asset).not.toHaveProperty('supportingColorOrigin');
    expect(asset.classification).toEqual(
      classifyTonalReference(asset.functionalReferences.light.vivid.hex)
    );
    expect(asset.classification?.sector).toBe('blue');
    expect(bundle.files.has('colors/pb.indigo.v2.c.json')).toBe(true);
    const projected = projectPresetAsset(asset);
    expect(projected.classification).toEqual(asset.classification);
    expect(projected).not.toHaveProperty('complementaryColorOrigin');
    expect(projected).not.toHaveProperty('id');
    expect(projected.scales).toEqual(asset.scales);
  });

  it('verifies a complementary bundle and detects origin tampering', async () => {
    expect((await verifyTonalArtifactBundle(bundle.files)).valid).toBe(true);
    const files = new Map<string, string>(bundle.files);
    const path = 'colors/pb.indigo.v2.c.json';
    const asset = JSON.parse(files.get(path)!);
    asset.complementaryColorOrigin.referenceHex = '#ffffff';
    files.set(path, formatCanonicalJsonFile(asset));
    const result = await verifyTonalArtifactBundle(files);
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'CONTENT_MISMATCH', path })
    );
  }, 120000);
});

async function readHistoricalBundle(preset: string) {
  const directory = new URL(
    `../../../presets/docs/design-systems/${preset}/colors/generated/`,
    import.meta.url
  );
  const manifestText = await readFile(new URL(TONAL_MANIFEST_PATH, directory), 'utf8');
  const manifest = JSON.parse(manifestText);
  const paths = [
    TONAL_SOURCE_PATH,
    TONAL_DIAGNOSTICS_PATH,
    ...manifest.assets.flatMap((asset: { path: string; preset: { path: string } }) => [
      asset.path,
      asset.preset.path
    ])
  ];
  const files = new Map<string, string>([
    [TONAL_MANIFEST_PATH, manifestText],
    ...(await Promise.all(
      paths.map(
        async (path: string) => [path, await readFile(new URL(path, directory), 'utf8')] as const
      )
    ))
  ]);
  // Checked-in TS modules and diagnostics were formatted after export. Recover the original
  // serialization in memory, proving it against the recorded hashes, without repairing history.
  for (const entry of manifest.assets) {
    const asset = JSON.parse(files.get(entry.path)!);
    if (asset.classification)
      asset.classification = classifyTonalReference(asset.functionalReferences.light.vivid.hex);
    const payload = projectPresetAsset(asset);
    if (Number(asset.generator.version.split('.')[1]) < 19) delete payload.classification;
    const text = [
      "import type { StaticPrimitiveTonalColorAsset } from '@kiskadee/core';",
      '',
      `// Generated from colors/${asset.id}.json by ${asset.generator.package}@${asset.generator.version}.`,
      `export default ${JSON.stringify(payload, null, 2)} as const satisfies StaticPrimitiveTonalColorAsset;`,
      ''
    ].join('\n');
    expect(await sha256Hex(text)).toBe(entry.preset.sha256);
    files.set(entry.preset.path, text);
  }
  files.set(
    TONAL_DIAGNOSTICS_PATH,
    formatCanonicalJsonFile(JSON.parse(files.get(TONAL_DIAGNOSTICS_PATH)!))
  );
  return files;
}

describe('Historical artifact compatibility', () => {
  it('replays an original Yellow bundle whose Orange support now measures as Brown', async () => {
    const fixture = await readFile(
      new URL('./fixtures/yellow-material-support-0.19.0.json.gz', import.meta.url)
    );
    const files = new Map<string, string>(JSON.parse(gunzipSync(fixture).toString('utf8')));
    const before = [...files];
    expect(JSON.parse(files.get('colors/yr.orange.v2.json')!).appearance).toBe('orange');
    const result = await verifyTonalArtifactBundle(files);
    expect(result.valid, JSON.stringify(result.issues)).toBe(true);
    expect([...files]).toEqual(before);
    if (result.valid) {
      const current = result.assets.find((asset) => asset.id === 'y.yellow.v1.c');
      expect(current?.appearance).toBe('brown');
      expect(current?.classification).toEqual(
        expect.objectContaining({
          sector: 'yellow-red',
          referenceHex: '#683c00'
        })
      );
    }
  }, 120000);

  it('rejects altered historical identity even when its manifest hash is rebuilt', async () => {
    const fixture = await readFile(
      new URL('./fixtures/yellow-material-support-0.19.0.json.gz', import.meta.url)
    );
    const files = new Map<string, string>(JSON.parse(gunzipSync(fixture).toString('utf8')));
    const path = 'colors/yr.orange.v2.json';
    const asset = JSON.parse(files.get(path)!);
    asset.appearance = 'brown';
    const text = formatCanonicalJsonFile(asset);
    files.set(path, text);
    const manifest = JSON.parse(files.get(TONAL_MANIFEST_PATH)!);
    manifest.assets.find((entry: { path: string }) => entry.path === path).sha256 =
      await sha256Hex(text);
    files.set(TONAL_MANIFEST_PATH, formatCanonicalJsonFile(manifest));
    const result = await verifyTonalArtifactBundle(files);
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'CONTENT_MISMATCH', path })
    );
  }, 120000);

  it.each([
    'fluent-2-microsoft',
    'material-design-3-google'
  ])('replays recorded %s JSON and original preset bytes without rewriting history', async (preset) => {
    const files = await readHistoricalBundle(preset);
    const before = [...files];
    const result = await verifyTonalArtifactBundle(files);
    expect(result.valid, JSON.stringify(result.issues)).toBe(true);
    expect([...files]).toEqual(before);
    if (result.valid) {
      expect(result.source.formatVersion).toBe(8);
      expect(result.manifest.generator.version).toBe('0.20.1');
      if (preset === 'material-design-3-google') {
        expect(result.source.catalog?.complementaryColors?.map((color) => color.id)).toEqual([
          'b.blue.v1.c',
          'pb.indigo.v2.c'
        ]);
      }
    }
  }, 120000);

  it('rejects tampered historical colors even when their manifest hash is rebuilt', async () => {
    const files = await readHistoricalBundle('fluent-2-microsoft');
    const path = 'colors/b.blue.v1.json';
    const asset = JSON.parse(files.get(path)!);
    asset.scales.light[18] = '#123456';
    const text = formatCanonicalJsonFile(asset);
    files.set(path, text);
    const manifest = JSON.parse(files.get(TONAL_MANIFEST_PATH)!);
    manifest.assets.find((entry: { path: string }) => entry.path === path).sha256 =
      await sha256Hex(text);
    files.set(TONAL_MANIFEST_PATH, formatCanonicalJsonFile(manifest));
    const result = await verifyTonalArtifactBundle(files);
    expect(result.valid).toBe(false);
    expect(result.issues).toContainEqual(
      expect.objectContaining({ code: 'CONTENT_MISMATCH', path })
    );
  }, 120000);
});
