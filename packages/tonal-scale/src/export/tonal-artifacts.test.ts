import { beforeAll, describe, expect, it } from 'vitest';

import { KISKADEE_TONES } from '../kiskadee-tonal-scale';
import {
  DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS,
  generateKiskadeeTonalSystem,
  type ResolvedKiskadeeTonalSystem,
  SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS,
  TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS
} from '../tonal-system';
import {
  DEFAULT_TONAL_SYSTEM_RECIPE,
  TONAL_CORE_FAMILY_IDS,
  type TonalSystemRecipeV5
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

function createRecipe(): TonalSystemRecipeV5 {
  return structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE) as TonalSystemRecipeV5;
}

describe('tonal artifact bundle v5', () => {
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
    expect(bundle.manifest.generator.version).toBe('0.7.0');
    expect(bundle.diagnostics.referenceSet).toBe('kiskadee-munsell-reference-v2');
    expect(bundle.manifest.primaryReference).toBe('b.blue.v1');
    for (const contents of bundle.files.values()) {
      expect(contents).toBe(formatCanonicalJsonFile(JSON.parse(contents)));
    }
  });

  it('keeps consumer assets concise while recording V5 identity, origin, and functional references', () => {
    for (const asset of bundle.assets) {
      expect(asset.formatVersion).toBe(5);
      expect(asset.generator).toEqual(TONAL_ARTIFACT_GENERATOR);
      expect(asset).not.toHaveProperty('diagnostics');
      expect(asset).not.toHaveProperty('dependencies');
      expect(asset).not.toHaveProperty('integrity');
      expect(asset).not.toHaveProperty('hue');
      expect(asset).not.toHaveProperty('familyKind');
      expect(asset).not.toHaveProperty('sourceSeedHex');
      expect(asset).not.toHaveProperty('classification');
      expect(asset).not.toHaveProperty('surfaceTrackAlignment');
      expect(asset).not.toHaveProperty('darkSupportChromaModeration');
      expect(asset).not.toHaveProperty('stateReferences');
      expect(Object.keys(asset.scales.light).map(Number)).toEqual(KISKADEE_TONES);
      expect(Object.keys(asset.scales.dark).map(Number)).toEqual(KISKADEE_TONES);
      expect(asset.scales.light['0']).toBe('#ffffff');
      expect(asset.scales.light['100']).toBe('#000000');
      expect(asset.scales.dark['0']).toBe('#000000');
      expect(asset.scales.dark['100']).toBe('#ffffff');
    }

    expect(bundle.assets.find((asset) => asset.id === 'b.blue.v1')).toMatchObject({
      munsellSector: 'B',
      appearance: 'blue',
      colorKind: 'chromatic',
      seedOrigin: 'primary',
      seedHex: '#0f6cbd'
    });
    expect(bundle.assets.find((asset) => asset.id === 'n.black.v1')).toMatchObject({
      munsellSector: 'N',
      appearance: 'black',
      colorKind: 'achromatic',
      seedOrigin: 'canonical',
      seedHex: '#000000',
      functionalReferences: {
        light: {
          vivid: { source: 'generated-anchor' },
          subtle: { source: 'surface-relative' }
        },
        dark: {
          vivid: { source: 'contrast-mirror' },
          subtle: { source: 'surface-relative' }
        }
      }
    });
    expect(bundle.assets.find((asset) => asset.id === 'yr.brown.v1')).toMatchObject({
      munsellSector: 'YR',
      appearance: 'brown',
      seedOrigin: 'reference'
    });
    expect(JSON.stringify(bundle.source)).not.toContain('darkSupportChromaModeration');
    expect(JSON.stringify(bundle.manifest)).not.toContain('darkSupportChromaModeration');
    expect(JSON.stringify(bundle.assets)).not.toContain('darkSupportChromaModeration');
  });

  it('keeps Munsell classification and projection details only in diagnostics', () => {
    const blue = bundle.diagnostics.families.find((family) => family.familyId === 'b.blue.v1');
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

    const black = bundle.diagnostics.families.find((family) => family.familyId === 'n.black.v1');
    expect(black?.classification).toBeNull();
    expect(black?.themes.light.classification).toBeNull();
    expect(black?.themes.dark.classification).toBeNull();

    expect(blue?.themes.light.surfaceTrackAlignment).toBeNull();
    expect(blue?.themes.dark.surfaceTrackAlignment).toBeNull();
    expect(blue?.themes.light.darkSupportChromaModeration).toBeNull();
    expect(blue?.themes.dark.darkSupportChromaModeration).toBeNull();
    expect(black?.themes.light.surfaceTrackAlignment).toBeNull();
    expect(black?.themes.dark.surfaceTrackAlignment).toBeNull();
    expect(black?.themes.light.darkSupportChromaModeration).toBeNull();
    expect(black?.themes.dark.darkSupportChromaModeration).toBeNull();

    for (const family of bundle.diagnostics.families) {
      expect(family.themes.light.darkSupportChromaModeration).toBeNull();
    }

    for (const family of bundle.diagnostics.families) {
      for (const theme of ['light', 'dark'] as const) {
        for (const kind of ['vivid', 'subtle'] as const) {
          const reference = family.themes[theme].functionalReferences[kind];
          expect(Number.isFinite(reference.surfaceContrast)).toBe(true);
          expect(Number.isFinite(reference.surfaceDeltaE)).toBe(true);
          if (kind === 'subtle') {
            expect(Number.isFinite(reference.surfaceContrastError ?? Number.NaN)).toBe(true);
            expect(Number.isFinite(reference.surfaceDeltaEError ?? Number.NaN)).toBe(true);
          } else {
            expect(reference).not.toHaveProperty('surfaceContrastError');
            expect(reference).not.toHaveProperty('surfaceDeltaEError');
          }
        }
      }
    }

    const green = bundle.diagnostics.families.find((family) => family.familyId === 'g.green.v1');
    for (const theme of ['light', 'dark'] as const) {
      const alignment = green?.themes[theme].surfaceTrackAlignment;
      expect(alignment).toMatchObject({
        contract: SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.contract,
        referenceFamilyId: 'b.blue.v1'
      });
      expect(alignment?.adjustedToneCount).toBe(alignment?.adjustedTones.length);
      expect(alignment?.protectedTones).toEqual(expect.arrayContaining([0, 100]));
      expect(alignment?.maxChromaReduction).toBeGreaterThanOrEqual(0);
      expect(alignment?.maxRemainingExcess).toBeGreaterThanOrEqual(0);
      expect(alignment?.restorationCount).toBeGreaterThanOrEqual(0);
    }

    expect(green?.themes.dark.darkSupportChromaModeration).toMatchObject({
      contract: DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.contract,
      referenceFamilyId: 'b.blue.v1',
      adjustedToneCount: expect.any(Number),
      baselineMaxExcess: expect.any(Number),
      finalMaxExcess: expect.any(Number),
      maxChromaReduction: expect.any(Number),
      maxChromaIncrease: expect.any(Number),
      sourceSeedChanged: expect.any(Boolean)
    });
    expect(green?.themes.dark.darkSupportChromaModeration?.adjustedToneCount).toBe(
      green?.themes.dark.darkSupportChromaModeration?.adjustedTones.length
    );
    expect(green?.themes.dark.darkSupportChromaModeration?.evaluatedTones).toEqual(
      KISKADEE_TONES.filter(
        (tone) =>
          tone >= DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.startTone &&
          tone <= DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.endTone
      )
    );
    expect(green?.themes.dark.darkSupportChromaModeration?.maxChromaIncrease).toBeLessThanOrEqual(
      DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.quantizationTolerance
    );
  });

  it('keeps Dark source-exact support families outside moderation diagnostics', async () => {
    const recipe = createRecipe();
    recipe.overrides.push({
      id: 'r.red.v1',
      seedHex: '#d13438',
      policies: { light: 'source-exact', dark: 'source-exact' }
    });
    const result = generateKiskadeeTonalSystem(recipe);
    expect(result.valid, JSON.stringify(result.issues, null, 2)).toBe(true);
    if (!result.valid) return;

    const sourceExactBundle = await createTonalArtifactBundle(result);
    const redDiagnostics = sourceExactBundle.diagnostics.families.find(
      (family) => family.familyId === 'r.red.v1'
    );
    expect(redDiagnostics?.themes.dark.policy).toBe('source-exact');
    expect(redDiagnostics?.themes.dark.darkSupportChromaModeration).toBeNull();
    expect(sourceExactBundle.assets.find((asset) => asset.id === 'r.red.v1')).not.toHaveProperty(
      'darkSupportChromaModeration'
    );
  });

  it('keeps tinted-neutral generation details in diagnostics only', async () => {
    const recipe = createRecipe();
    recipe.overrides.push({
      id: 'n.black.v2',
      seedHex: '#21242d',
      policies: { light: 'source-exact', dark: 'source-exact' }
    });
    const result = generateKiskadeeTonalSystem(recipe);
    expect(result.valid, JSON.stringify(result.issues, null, 2)).toBe(true);
    if (!result.valid) return;

    const tintedBundle = await createTonalArtifactBundle(result);
    const asset = tintedBundle.assets.find((candidate) => candidate.id === 'n.black.v2');
    const diagnostics = tintedBundle.diagnostics.families.find(
      (family) => family.familyId === 'n.black.v2'
    );

    expect(asset).toMatchObject({
      colorKind: 'achromatic',
      seedHex: '#21242d',
      seedOrigin: 'override'
    });
    expect(asset).not.toHaveProperty('tintedAchromaticChroma');
    for (const theme of ['light', 'dark'] as const) {
      expect(diagnostics?.themes[theme].tintedAchromaticChroma).toMatchObject({
        contract: TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS.contract,
        seedChroma: expect.any(Number),
        adjustedTones: expect.any(Array),
        restoredTones: expect.any(Array)
      });
    }
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

  it('locks complete functional references and preserves scale bytes for a reference-matched subtle color', async () => {
    const recipe = createRecipe();
    recipe.functionalReferences = [
      {
        id: 'b.blue.v1',
        light: {
          vivid: { mode: 'auto' },
          subtle: { mode: 'reference-match', referenceHex: '#d9f1ff' }
        },
        dark: {
          vivid: { mode: 'auto' },
          subtle: { mode: 'auto' }
        }
      }
    ];
    const result = generateKiskadeeTonalSystem(recipe);
    expect(result.valid, JSON.stringify(result.issues, null, 2)).toBe(true);
    if (!result.valid) return;

    const configuredBundle = await createTonalArtifactBundle(result);
    expect(configuredBundle.source.functionalReferences).toHaveLength(TONAL_CORE_FAMILY_IDS.length);
    expect(configuredBundle.source.functionalReferences.map((references) => references.id)).toEqual(
      [...TONAL_CORE_FAMILY_IDS].sort()
    );

    const primary = configuredBundle.assets.find((asset) => asset.id === 'b.blue.v1');
    const sourcePrimary = configuredBundle.source.functionalReferences.find(
      (references) => references.id === 'b.blue.v1'
    );
    expect(primary).toBeDefined();
    expect(sourcePrimary).toBeDefined();
    if (!primary || !sourcePrimary) return;
    expect(sourcePrimary.light.subtle).toMatchObject({
      source: 'reference-match',
      referenceHex: '#d9f1ff'
    });
    expect(primary.functionalReferences.light.subtle).toEqual({
      tone: sourcePrimary.light.subtle.tone,
      hex: primary.scales.light[`${sourcePrimary.light.subtle.tone}`],
      source: 'reference-match'
    });
    const primaryDiagnostics = configuredBundle.diagnostics.families.find(
      (family) => family.familyId === 'b.blue.v1'
    );
    expect(primaryDiagnostics?.themes.light.functionalReferences.subtle).toMatchObject({
      tone: sourcePrimary.light.subtle.tone,
      source: 'reference-match',
      referenceHex: '#d9f1ff',
      surfaceContrast: expect.any(Number),
      surfaceDeltaE: expect.any(Number),
      deltaE: expect.any(Number)
    });

    for (const configuredAsset of configuredBundle.assets) {
      const baselineAsset = bundle.assets.find((asset) => asset.id === configuredAsset.id);
      expect(configuredAsset.scales, configuredAsset.id).toEqual(baselineAsset?.scales);
    }

    const verification = await verifyTonalArtifactBundle(new Map(configuredBundle.files));
    expect(verification.valid, JSON.stringify(verification.issues, null, 2)).toBe(true);
    if (!verification.valid) return;
    expect(verification.source.functionalReferences).toEqual(
      configuredBundle.source.functionalReferences
    );
    expect(verification.assets).toEqual(configuredBundle.assets);
  });

  it('rejects resolved functional references that differ from their locked source', async () => {
    const result = generateKiskadeeTonalSystem(createRecipe());
    expect(result.valid, JSON.stringify(result.issues, null, 2)).toBe(true);
    if (!result.valid) return;

    const blue = result.functionalReferences.find((family) => family.id === 'b.blue.v1');
    expect(blue).toBeDefined();
    if (!blue) return;
    blue.light.subtle.source = 'locked';

    await expect(createTonalArtifactBundle(result)).rejects.toThrow(
      'b.blue.v1 light subtle reference does not match the locked source.'
    );
  });

  it('rejects tampered, missing, and extra files atomically', async () => {
    const files = new Map<string, string>(bundle.files);
    files.delete(TONAL_DIAGNOSTICS_PATH);
    const greenPath = 'colors/g.green.v1.json';
    const green = JSON.parse(files.get(greenPath) ?? '{}') as {
      functionalReferences: { light: { subtle: { hex: string } } };
    };
    green.functionalReferences.light.subtle.hex = '#123456';
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
      id: 'b.blue.v2',
      seedHex: '#0057b8',
      policies: { light: 'source-exact', dark: 'source-exact' }
    });
    const result = generateKiskadeeTonalSystem(recipe);
    expect(result.valid, JSON.stringify(result.issues, null, 2)).toBe(true);
    if (!result.valid) return;
    const extraBundle = await createTonalArtifactBundle(result);
    expect(extraBundle.files.has('colors/b.blue.v2.json')).toBe(true);
    expect(extraBundle.files.size).toBe(16);
    expect(extraBundle.source.functionalReferences).toHaveLength(TONAL_CORE_FAMILY_IDS.length + 1);
  });
});
