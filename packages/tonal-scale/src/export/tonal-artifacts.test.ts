import { beforeAll, describe, expect, it } from 'vitest';

import { KISKADEE_TONES } from '../kiskadee-tonal-scale';
import { generateKiskadeeTonalSystem, type ResolvedKiskadeeTonalSystem } from '../tonal-system';
import { DEFAULT_TONAL_SYSTEM_RECIPE, type TonalSystemRecipeV1 } from '../tonal-system-contract';
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

function createRecipe(): TonalSystemRecipeV1 {
  const recipe = structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE) as TonalSystemRecipeV1;
  recipe.families = [
    {
      id: 'blue.v1',
      seedHex: '#0f6cbd',
      policies: { light: 'source-exact', dark: 'source-exact' }
    },
    { id: 'green.v1', seedHex: '#107c10', policies: { light: 'harmonized', dark: 'harmonized' } },
    {
      id: 'black.v1',
      seedHex: '#20252b',
      policies: { light: 'source-exact', dark: 'source-exact' }
    }
  ];
  return recipe;
}

describe('tonal artifact bundle', () => {
  let system: ResolvedKiskadeeTonalSystem;
  let bundle: TonalArtifactBundle;

  beforeAll(async () => {
    const result = generateKiskadeeTonalSystem(createRecipe());
    expect(result.valid, JSON.stringify(result.issues, null, 2)).toBe(true);
    if (!result.valid) throw new Error('Artifact fixture must resolve.');
    system = result;
    bundle = await createTonalArtifactBundle(system);
  }, 120_000);

  it('serializes a deterministic minimal tree with diagnostics separated', async () => {
    const second = await createTonalArtifactBundle(system);
    expect([...second.files]).toEqual([...bundle.files]);
    expect([...bundle.files.keys()]).toEqual([
      TONAL_SOURCE_PATH,
      TONAL_MANIFEST_PATH,
      TONAL_DIAGNOSTICS_PATH,
      'colors/black.v1.json',
      'colors/blue.v1.json',
      'colors/green.v1.json'
    ]);
    expect(bundle.manifest.generator).toEqual(TONAL_ARTIFACT_GENERATOR);
    expect(bundle.manifest.diagnostics.path).toBe(TONAL_DIAGNOSTICS_PATH);
    expect(bundle.diagnostics.primaryReference.familyId).toBe('blue.v1');
    for (const contents of bundle.files.values()) {
      expect(contents).toBe(formatCanonicalJsonFile(JSON.parse(contents)));
    }
  });

  it('keeps consumer color files limited to provenance, policies, anchors, and scales', () => {
    for (const asset of bundle.assets) {
      expect(asset.generator).toEqual(TONAL_ARTIFACT_GENERATOR);
      expect(asset).not.toHaveProperty('diagnostics');
      expect(asset).not.toHaveProperty('dependencies');
      expect(asset).not.toHaveProperty('integrity');
      expect(Object.keys(asset.scales.light).map(Number)).toEqual(KISKADEE_TONES);
      expect(Object.keys(asset.scales.dark).map(Number)).toEqual(KISKADEE_TONES);
      expect(asset.scales.light['0']).toBe('#ffffff');
      expect(asset.scales.light['100']).toBe('#000000');
      expect(asset.scales.dark['0']).toBe('#000000');
      expect(asset.scales.dark['100']).toBe('#ffffff');
    }
    expect(bundle.assets.find((asset) => asset.id === 'black.v1')).toMatchObject({
      familyKind: 'neutral',
      policies: { light: 'source-exact', dark: 'source-exact' }
    });
  });

  it('keeps hashes centralized in the manifest', () => {
    expect(bundle.manifest.source.sha256).toMatch(/^[0-9a-f]{64}$/);
    for (const entry of bundle.manifest.assets) expect(entry.sha256).toMatch(/^[0-9a-f]{64}$/);
    expect(JSON.stringify(bundle.assets)).not.toContain('sha256');
  });

  it('round-trips the complete canonical bundle through verification', async () => {
    const verification = await verifyTonalArtifactBundle(new Map(bundle.files));
    expect(verification.valid, JSON.stringify(verification.issues, null, 2)).toBe(true);
    if (!verification.valid) return;
    expect(verification.manifest).toEqual(bundle.manifest);
    expect(verification.diagnostics).toEqual(bundle.diagnostics);
    expect(verification.assets).toEqual(bundle.assets);
  }, 120_000);

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
  }, 120_000);

  it('rejects an authoring source whose rest positions remain automatic', async () => {
    const files = new Map<string, string>(bundle.files);
    const draft = createRecipe();
    draft.tonalAnchors.rest = { mode: 'auto' };
    files.set(TONAL_SOURCE_PATH, formatCanonicalJsonFile(draft));
    const verification = await verifyTonalArtifactBundle(files);
    expect(verification.valid).toBe(false);
    expect(verification.issues).toContainEqual(
      expect.objectContaining({
        code: 'INVALID_SOURCE',
        path: `${TONAL_SOURCE_PATH}/tonalAnchors/rest/mode`
      })
    );
  });
});
