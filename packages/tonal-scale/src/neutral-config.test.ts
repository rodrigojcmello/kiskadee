import { describe, expect, it } from 'vitest';
import { hexToOklch } from './color-math';
import { createTonalArtifactBundle, verifyTonalArtifactBundle } from './export/tonal-artifacts';
import { generateKiskadeeTonalSystem, resolveTonalFunctionalReference } from './tonal-system';
import {
  DEFAULT_TONAL_SYSTEM_RECIPE,
  resolveNeutralOverride,
  type TonalSystemRecipeV5,
  validateTonalSystemRecipe
} from './tonal-system-contract';

const config = {
  mode: 'derived-from-primary',
  seedHex: '#21242d',
  derivation: 'primary-neutral-v1'
} as const;
function recipe(): TonalSystemRecipeV5 {
  return structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE);
}

describe('neutral configuration', () => {
  it('preserves the default result when no customized neutral is requested', () => {
    const before = generateKiskadeeTonalSystem(recipe());
    const after = generateKiskadeeTonalSystem({
      ...recipe(),
      neutral: { ...config, mode: 'existing', seedHex: '#000000' }
    });
    expect(after.valid).toBe(true);
    expect(after.families).toEqual(before.families);
  });

  it('preserves a legacy authored neutral when moved into the unified configuration', () => {
    const input = recipe();
    input.overrides = [
      {
        id: 'n.black.v2',
        seedHex: '#21242d',
        policies: { light: 'source-exact', dark: 'source-exact' }
      }
    ];
    const before = generateKiskadeeTonalSystem(input);
    const after = generateKiskadeeTonalSystem({
      ...input,
      overrides: [],
      neutral: { ...config, mode: 'existing' }
    });
    expect(after.valid).toBe(true);
    expect(after.families).toEqual(before.families);
  });

  it.each([
    '#0064b4',
    '#c50f1f',
    '#107c10'
  ])('derives a low-chroma neutral and preserves pure grayscale for %s', (seedHex) => {
    const input = { ...recipe(), primary: { ...recipe().primary, seedHex }, neutral: config };
    const result = generateKiskadeeTonalSystem(input);
    expect(result.valid).toBe(true);
    const neutral = result.families.find((f) => f.id === 'n.black.v2');
    expect(neutral).toBeDefined();
    expect(hexToOklch(neutral!.sourceSeedHex).c).toBeLessThan(0.012);
    expect(neutral!.sourceSeedHex).toBe(resolveNeutralOverride(config, seedHex)!.seedHex);
    const baseline = generateKiskadeeTonalSystem({ ...input, neutral: undefined });
    expect(result.families.filter((f) => f.id !== 'n.black.v2')).toEqual(baseline.families);
  });

  it('does not invent a tint for achromatic primary inputs', () => {
    expect(resolveNeutralOverride(config, '#808080')).toBeNull();
    expect(resolveNeutralOverride(config, '#000000')).toBeNull();
    expect(resolveNeutralOverride(config, '#ffffff')).toBeNull();
  });

  it('rejects collisions and unknown derivation versions', () => {
    const input = {
      ...recipe(),
      neutral: config,
      overrides: [
        {
          id: 'n.black.v2' as const,
          seedHex: '#21242d',
          policies: { light: 'source-exact' as const, dark: 'source-exact' as const }
        }
      ]
    };
    expect(
      validateTonalSystemRecipe(input).issues.some((i) => i.code === 'NEUTRAL_OVERRIDE_CONFLICT')
    ).toBe(true);
    expect(
      validateTonalSystemRecipe({ ...recipe(), neutral: { ...config, derivation: 'future' } }).valid
    ).toBe(false);
  });

  it('shares explicit reference rules without recoloring either neutral', async () => {
    const input = { ...recipe(), neutral: config };
    const baseline = generateKiskadeeTonalSystem(input);
    const result = generateKiskadeeTonalSystem({
      ...input,
      neutral: {
        ...config,
        references: {
          light: { vivid: { mode: 'locked', tone: 85 }, subtle: { mode: 'auto' } },
          dark: { vivid: { mode: 'locked', tone: 90 }, subtle: { mode: 'auto' } }
        }
      }
    });
    expect(result.valid).toBe(true);
    if (!result.valid) throw new Error('Invalid shared references');
    for (const id of ['n.black.v1', 'n.black.v2'] as const) {
      expect(resolveTonalFunctionalReference(result, id, 'light', 'vivid').tone).toBe(85);
      expect(resolveTonalFunctionalReference(result, id, 'dark', 'vivid').tone).toBe(90);
      for (const theme of ['light', 'dark'] as const)
        expect(result.families.find((f) => f.id === id)!.themes[theme].scale.colors).toEqual(
          baseline.families.find((f) => f.id === id)!.themes[theme].scale.colors
        );
    }
    const bundle = await createTonalArtifactBundle(result);
    const replay = await verifyTonalArtifactBundle(bundle.files);
    expect(replay.valid, JSON.stringify(replay.issues)).toBe(true);
    expect(bundle.source.neutral).toEqual(result.source.neutral);
  }, 15000);
});

describe('neutral derivation strategy', () => {
  it('preserves the default derivation and ignores intensity for explicit seeds', () => {
    expect(resolveNeutralOverride(config, '#0b57d0')?.seedHex).toBe('#1f2227');
    expect(resolveNeutralOverride({ ...config, intensity: 'subtle' }, '#0b57d0')).toEqual(
      resolveNeutralOverride(config, '#0b57d0')
    );
    expect(
      resolveNeutralOverride({ ...config, mode: 'existing', intensity: 'chromatic' }, '#0b57d0')
        ?.seedHex
    ).toBe(config.seedHex);
  });

  it.each([
    '#0b57d0',
    '#6750a4',
    '#b3261e',
    '#146c2e'
  ])('increases neutral chroma for %s without recoloring other families', async (seedHex) => {
    const input = { ...recipe(), primary: { ...recipe().primary, seedHex }, neutral: config };
    const subtle = generateKiskadeeTonalSystem(input);
    const chromatic = generateKiskadeeTonalSystem({
      ...input,
      neutral: { ...config, intensity: 'chromatic' }
    });
    expect(chromatic.valid).toBe(subtle.valid);
    expect(chromatic.issues.filter((issue) => issue.severity === 'error')).toEqual(
      subtle.issues.filter((issue) => issue.severity === 'error')
    );
    const neutral = (system: typeof subtle) => system.families.find((f) => f.id === 'n.black.v2')!;
    const primaryHue = hexToOklch(seedHex).h;
    const hue = hexToOklch(neutral(chromatic).sourceSeedHex).h;
    const offsetError = Math.abs(((hue - primaryHue + 14 + 540) % 360) - 180);
    expect(offsetError).toBeLessThan(3);
    const primary = chromatic.families.find((f) => f.role === 'primary')!;
    for (const tone of [4, 8, 12]) {
      expect(
        neutral(chromatic).themes.light.scale.colors.find((c) => c.tone === tone)?.hex
      ).not.toBe(primary.themes.light.scale.colors.find((c) => c.tone === tone)?.hex);
    }
    expect(hexToOklch(neutral(chromatic).sourceSeedHex).c).toBeGreaterThan(
      hexToOklch(neutral(subtle).sourceSeedHex).c
    );
    expect(chromatic.families.filter((f) => f.id !== 'n.black.v2')).toEqual(
      subtle.families.filter((f) => f.id !== 'n.black.v2')
    );
    // Existing cross-family harmony failures are independent of neutral derivation.
    if (!chromatic.valid || seedHex !== '#0b57d0') return;
    const bundle = await createTonalArtifactBundle(chromatic);
    expect((await verifyTonalArtifactBundle(bundle.files)).valid).toBe(true);
    const source = JSON.parse(bundle.files.get('tonal-system.source.json')!);
    expect(source.neutral.intensity).toBe('chromatic');
    const asset = JSON.parse(bundle.files.get('colors/n.black.v2.json')!);
    expect(asset.neutralOrigin.intensity).toBe('chromatic');
  });

  it('rejects unknown intensity and preserves achromatic primary behavior', () => {
    const result = validateTonalSystemRecipe({
      ...recipe(),
      neutral: { ...config, intensity: 'extreme' }
    });
    expect(result.valid).toBe(false);
    expect(resolveNeutralOverride({ ...config, intensity: 'chromatic' }, '#808080')).toBeNull();
  });
});
