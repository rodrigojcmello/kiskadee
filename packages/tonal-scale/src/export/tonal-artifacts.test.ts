import { beforeAll, describe, expect, it } from 'vitest';

import { KISKADEE_TONES } from '../kiskadee-tonal-scale';
import { generateKiskadeeTonalSystem, type ResolvedKiskadeeTonalSystem } from '../tonal-system';
import {
  DEFAULT_TONAL_SYSTEM_RECIPE,
  TONAL_CORE_FAMILY_IDS,
  type TonalSystemRecipeV2
} from '../tonal-system-contract';
import { formatCanonicalJsonFile } from './canonical-json';
import {
  createTonalArtifactBundle,
  TONAL_ARTIFACT_GENERATOR,
  TONAL_DIAGNOSTICS_PATH,
  TONAL_MANIFEST_PATH,
  TONAL_SOURCE_PATH,
  type TonalArtifactBundle,
  verifyTonalArtifactBundle
} from './tonal-artifacts';

function createRecipe(): TonalSystemRecipeV2 {
  return structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE) as TonalSystemRecipeV2;
}

describe('tonal artifact bundle v2', () => {
  let system: ResolvedKiskadeeTonalSystem;
  let bundle: TonalArtifactBundle;

  beforeAll(async () => {
    const result = generateKiskadeeTonalSystem(createRecipe());
    expect(result.valid, JSON.stringify(result.issues, null, 2)).toBe(true);
    if (!result.valid) throw new Error('Artifact fixture must resolve.');
    system = result;
    bundle = await createTonalArtifactBundle(system);
  });

  it('serializes the deterministic 15-file core tree', async () => {
    const second = await createTonalArtifactBundle(system);
    expect([...second.files]).toEqual([...bundle.files]);
    expect(bundle.files.size).toBe(15);
    expect([...bundle.files.keys()]).toEqual([
      TONAL_SOURCE_PATH,
      TONAL_MANIFEST_PATH,
      TONAL_DIAGNOSTICS_PATH,
      ...[...TONAL_CORE_FAMILY_IDS].sort().map((id) => `colors/${id}.json` as const)
    ]);
    expect(bundle.manifest.generator).toEqual(TONAL_ARTIFACT_GENERATOR);
    expect(bundle.manifest.generator.version).toBe('0.2.0');
    expect(bundle.manifest.primaryReference).toBe('blue.v1');
    for (const contents of bundle.files.values()) {
      expect(contents).toBe(formatCanonicalJsonFile(JSON.parse(contents)));
    }
  });

  it('keeps consumer assets concise while recording V2 identity and origin', () => {
    for (const asset of bundle.assets) {
      expect(asset.formatVersion).toBe(2);
      expect(asset.generator).toEqual(TONAL_ARTIFACT_GENERATOR);
      expect(asset).not.toHaveProperty('diagnostics');
      expect(asset).not.toHaveProperty('dependencies');
      expect(asset).not.toHaveProperty('integrity');
      expect(asset).not.toHaveProperty('hue');
      expect(asset).not.toHaveProperty('familyKind');
      expect(asset).not.toHaveProperty('sourceSeedHex');
      expect(asset).not.toHaveProperty('classification');
      expect(Object.keys(asset.scales.light).map(Number)).toEqual(KISKADEE_TONES);
      expect(Object.keys(asset.scales.dark).map(Number)).toEqual(KISKADEE_TONES);
      expect(asset.scales.light['0']).toBe('#ffffff');
      expect(asset.scales.light['100']).toBe('#000000');
      expect(asset.scales.dark['0']).toBe('#000000');
      expect(asset.scales.dark['100']).toBe('#ffffff');
    }

    expect(bundle.assets.find((asset) => asset.id === 'blue.v1')).toMatchObject({
      sector: 'blue',
      colorKind: 'chromatic',
      seedOrigin: 'primary',
      seedHex: '#0f6cbd'
    });
    expect(bundle.assets.find((asset) => asset.id === 'black.v1')).toMatchObject({
      sector: null,
      colorKind: 'achromatic',
      seedOrigin: 'canonical',
      seedHex: '#20252b'
    });
    expect(bundle.assets.find((asset) => asset.id === 'yellow-red.v2')).toMatchObject({
      sector: 'yellow-red',
      seedOrigin: 'derived'
    });
  });

  it('keeps Munsell classification and projection details only in diagnostics', () => {
    const blue = bundle.diagnostics.families.find((family) => family.familyId === 'blue.v1');
    expect(blue).toMatchObject({
      seedOrigin: 'primary',
      classification: {
        projection: 'munsell-oklch-v1',
        sector: 'blue',
        isInSafeCore: true
      },
      themes: {
        light: {
          classification: {
            projection: 'munsell-oklch-v1',
            sector: 'blue',
            isInSafeCore: true
          }
        },
        dark: {
          classification: {
            projection: 'munsell-oklch-v1',
            sector: 'blue',
            isInSafeCore: true
          }
        }
      }
    });

    const black = bundle.diagnostics.families.find((family) => family.familyId === 'black.v1');
    expect(black?.classification).toBeNull();
    expect(black?.themes.light.classification).toBeNull();
    expect(black?.themes.dark.classification).toBeNull();
  });

  it('keeps hashes centralized in the manifest', () => {
    expect(bundle.manifest.source.sha256).toMatch(/^[0-9a-f]{64}$/);
    for (const entry of bundle.manifest.assets) expect(entry.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(bundle.assets)).not.toContain('sha256');
  });

  it('round-trips the complete canonical bundle through locked-source verification', async () => {
    const verification = await verifyTonalArtifactBundle(new Map(bundle.files));
    expect(verification.valid, JSON.stringify(verification.issues, null, 2)).toBe(true);
    if (!verification.valid) return;
    expect(verification.manifest).toEqual(bundle.manifest);
    expect(verification.diagnostics).toEqual(bundle.diagnostics);
    expect(verification.assets).toEqual(bundle.assets);
  });

  it('rejects tampered, missing, and extra files atomically', async () => {
    const files = new Map<string, string>(bundle.files);
    files.delete(TONAL_DIAGNOSTICS_PATH);
    const greenPath = 'colors/green.v1.json';
    const green = JSON.parse(files.get(greenPath) ?? '{}') as {
      scales: { light: Record<string, string> };
    };
    green.scales.light['45'] = '#123456';
    files.set(greenPath, formatCanonicalJsonFile(green));
    files.set('colors/not-a-family.json', formatCanonicalJsonFile({ extra: true }));

    const verification = await verifyTonalArtifactBundle(files);
    expect(verification.valid).toBe(false);
    expect(verification.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'MISSING_FILE', path: TONAL_DIAGNOSTICS_PATH }),
        expect.objectContaining({ code: 'CONTENT_MISMATCH', path: greenPath }),
        expect.objectContaining({ code: 'EXTRA_FILE', path: 'colors/not-a-family.json' })
      ])
    );
  });

  it('rejects a draft source whose primary id and rest are not locked', async () => {
    const files = new Map<string, string>(bundle.files);
    files.set(TONAL_SOURCE_PATH, formatCanonicalJsonFile(createRecipe()));
    const verification = await verifyTonalArtifactBundle(files);
    expect(verification.valid).toBe(false);
    expect(verification.issues.map((issue) => issue.code)).toContain('INVALID_SOURCE');
  });

  it('includes explicit extra variants in the atomic tree', async () => {
    const recipe = createRecipe();
    recipe.overrides.push({
      id: 'blue.v2',
      seedHex: '#0057b8',
      policies: { light: 'source-exact', dark: 'source-exact' }
    });
    const result = generateKiskadeeTonalSystem(recipe);
    expect(result.valid, JSON.stringify(result.issues, null, 2)).toBe(true);
    if (!result.valid) return;
    const extraBundle = await createTonalArtifactBundle(result);
    expect(extraBundle.files.has('colors/blue.v2.json')).toBe(true);
    expect(extraBundle.files.size).toBe(16);
  });
});
