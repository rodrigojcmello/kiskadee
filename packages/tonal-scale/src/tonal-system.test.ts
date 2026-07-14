import { describe, expect, it } from 'vitest';

import { maxSrgbChroma, oklchToSrgbHex } from './color-math';
import { generateKiskadeeScale, KISKADEE_TONES } from './kiskadee-tonal-scale';
import { classifyMunsellHex } from './munsell-oklch';
import {
  generateKiskadeeTonalSystem,
  type KiskadeeTonalSystemResult,
  MUNSELL_HARMONY_V1_PARAMETERS,
  type ResolvedKiskadeeTonalSystem
} from './tonal-system';
import {
  DEFAULT_TONAL_SYSTEM_RECIPE,
  parseTonalFamilyId,
  TONAL_CORE_FAMILY_IDS,
  type TonalFamilyId,
  type TonalSystemRecipeV3
} from './tonal-system-contract';

function createRecipe(seedHex = '#0f6cbd'): TonalSystemRecipeV3 {
  const recipe = structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE) as TonalSystemRecipeV3;
  recipe.primary.seedHex = seedHex;
  return recipe;
}

function expectResolved(
  result: KiskadeeTonalSystemResult
): asserts result is ResolvedKiskadeeTonalSystem {
  expect(result.valid, JSON.stringify(result.issues, null, 2)).toBe(true);
}

function resolveFamily(result: ResolvedKiskadeeTonalSystem, id: TonalFamilyId) {
  const family = result.families.find((candidate) => candidate.id === id);
  if (!family) throw new Error(`${id} was not resolved.`);
  return family;
}

const REPRESENTATIVE_MUNSELL_PRIMARIES = [
  ['red', '#b94739'],
  ['yellow-red', '#a26000'],
  ['yellow', '#b8941a'],
  ['green-yellow', '#6e7a00'],
  ['green', '#278733'],
  ['blue-green', '#008285'],
  ['blue', '#0f74c5'],
  ['purple-blue', '#5468c8'],
  ['purple', '#994fa5'],
  ['red-purple', '#af457c']
] as const;

describe('generateKiskadeeTonalSystem v3', () => {
  it.each([
    'balanced',
    'muted-darks'
  ] as const)('keeps the exact primary %s scales byte-for-byte equal to the canonical low-level generator', (tonalProfile) => {
    const recipe = createRecipe();
    recipe.tonalProfile = tonalProfile;
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);
    const primary = resolveFamily(result, 'b.blue.v1');

    expect(primary.themes.light.scale).toEqual(
      generateKiskadeeScale({ seedHex: '#0f6cbd', theme: 'light', profile: tonalProfile })
    );
    expect(primary.themes.dark.scale).toEqual(
      generateKiskadeeScale({ seedHex: '#0f6cbd', theme: 'dark', profile: tonalProfile })
    );
  });

  it('lets an adaptive primary Dark choose or honor the shared rest position', () => {
    const automaticRecipe = createRecipe('#004080');
    automaticRecipe.primary.policies.dark = 'adaptive';
    const automatic = generateKiskadeeTonalSystem(automaticRecipe);
    expectResolved(automatic);
    expect(automatic.rest).toEqual({ light: 70, dark: 22, source: 'auto-proposal' });

    const lockedRecipe = createRecipe();
    lockedRecipe.primary.policies.dark = 'adaptive';
    lockedRecipe.tonalAnchors.rest = { mode: 'locked', light: 45, dark: 50 };
    const locked = generateKiskadeeTonalSystem(lockedRecipe);
    expectResolved(locked);
    const dark = resolveFamily(locked, 'b.blue.v1').themes.dark;
    expect(dark).toMatchObject({ policy: 'adaptive', restTone: 50, sourceSeedPreserved: false });
    expect(dark.scale.anchorTone).toBe(50);
  });

  it('lets each chromatic override choose Light and Dark policies independently', () => {
    const recipe = createRecipe();
    recipe.overrides = [
      {
        id: 'y.yellow.v1',
        seedHex: '#82670e',
        policies: { light: 'harmonized', dark: 'source-exact' }
      }
    ];
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);
    const yellow = resolveFamily(result, 'y.yellow.v1');

    expect(yellow.themes.light.policy).toBe('harmonized');
    expect(yellow.themes.dark.policy).toBe('source-exact');
    expect(yellow.themes.dark.sourceSeedPreserved).toBe(true);
    expect(yellow.themes.dark.scale.anchorTone).not.toBeNull();
    expect(yellow.themes.dark.restTone).toBe(result.rest.dark);
  });

  it('supports adaptive Dark for an authored black family', () => {
    const recipe = createRecipe();
    recipe.overrides = [
      {
        id: 'n.black.v1',
        seedHex: '#40464d',
        policies: { light: 'source-exact', dark: 'adaptive' }
      }
    ];
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);
    const dark = resolveFamily(result, 'n.black.v1').themes.dark;

    expect(dark.policy).toBe('adaptive');
    expect(dark.restTone).toBe(result.rest.dark);
    expect(dark.scale.anchorTone).toBe(result.rest.dark);
  });

  it('materializes the complete canonical family set from only one primary', () => {
    const result = generateKiskadeeTonalSystem(createRecipe());
    expectResolved(result);

    expect(result.primaryReference.familyId).toBe('b.blue.v1');
    expect(result.rest).toEqual({ light: 45, dark: 45, source: 'auto-proposal' });
    expect(result.families.map((family) => family.id).sort()).toEqual(
      [...TONAL_CORE_FAMILY_IDS].sort()
    );
    expect(result.families).toHaveLength(12);

    for (const family of result.families) {
      expect(family.themes.light.restTone).toBe(45);
      expect(family.themes.dark.restTone).toBe(45);
      expect(family.themes.light.scale.colors.map((color) => color.tone)).toEqual(KISKADEE_TONES);
      expect(family.themes.dark.scale.colors.map((color) => color.tone)).toEqual(KISKADEE_TONES);
      expect(family.themes.light.scale.diagnostics.valid).toBe(true);
      expect(family.themes.dark.scale.diagnostics.valid).toBe(true);
    }
  });

  it.each(
    REPRESENTATIVE_MUNSELL_PRIMARIES
  )('generates the complete canonical system from a representative %s primary', (sector, seedHex) => {
    const result = generateKiskadeeTonalSystem(createRecipe(seedHex));
    expectResolved(result);

    expect(classifyMunsellHex(seedHex).sector).toBe(sector);
    expect(parseTonalFamilyId(result.primaryReference.familyId)?.sector).toBe(sector);
    expect(result.families).toHaveLength(TONAL_CORE_FAMILY_IDS.length);
    expect(result.families.map((family) => family.id).sort()).toEqual(
      [...TONAL_CORE_FAMILY_IDS].sort()
    );
  });

  it('preserves every tonal invariant across all twelve canonical families and both themes', () => {
    const result = generateKiskadeeTonalSystem(createRecipe());
    expectResolved(result);

    for (const family of result.families) {
      expect(family.themes.light.restTone).toBe(result.rest.light);
      expect(family.themes.dark.restTone).toBe(result.rest.dark);

      if (family.colorKind === 'chromatic') {
        expect(family.identity?.sector).toBe(family.sector);
        expect(classifyMunsellHex(family.themes.light.restColor.hex).sector).toBe(family.sector);
        expect(classifyMunsellHex(family.themes.dark.restColor.hex).sector).toBe(family.sector);
      }

      for (const [theme, scale] of [
        ['light', family.themes.light.scale],
        ['dark', family.themes.dark.scale]
      ] as const) {
        expect(scale.colors.map((color) => color.tone)).toEqual(KISKADEE_TONES);
        expect(scale.colors).toHaveLength(KISKADEE_TONES.length);
        expect(new Set(scale.colors.map((color) => color.hex)).size).toBe(KISKADEE_TONES.length);
        expect(scale.diagnostics).toMatchObject({
          valid: true,
          monotonic: true,
          duplicateTones: [],
          adjacentDuplicates: [],
          contrastFailures: []
        });

        const first = scale.colors[0];
        const last = scale.colors.at(-1);
        expect(first.hex).toBe(theme === 'light' ? '#ffffff' : '#000000');
        expect(last?.hex).toBe(theme === 'light' ? '#000000' : '#ffffff');

        for (const color of scale.colors) {
          expect(color.hex).toMatch(/^#[0-9a-f]{6}$/);
          expect(color.gamutChromaLoss).toBeGreaterThanOrEqual(0);
          const roundTrip = oklchToSrgbHex(color.oklch);
          expect(roundTrip.hex).toBe(color.hex);
          expect(roundTrip.chromaLoss).toBeLessThan(0.000_001);
        }
      }
    }
  });

  it('keeps Twitter Blue exact at L24 and D70 while generating all companions', () => {
    const result = generateKiskadeeTonalSystem(createRecipe('#1DA1F2'));
    expectResolved(result);

    expect(result.primaryReference.familyId).toBe('b.blue.v1');
    expect(result.rest).toEqual({ light: 24, dark: 70, source: 'auto-proposal' });
    expect(result.primaryReference.light).toMatchObject({ tone: 24, hex: '#1da1f2' });
    expect(result.primaryReference.dark).toMatchObject({ tone: 70, hex: '#1da1f2' });
    expect(result.families).toHaveLength(12);
  });

  it('keeps saturated electric blue exact without promoting a local chroma cusp to an error', () => {
    const result = generateKiskadeeTonalSystem(createRecipe('#0061FF'));
    expectResolved(result);

    expect(result.primaryReference.familyId).toBe('b.blue.v1');
    expect(result.rest).toEqual({ light: 40, dark: 50, source: 'auto-proposal' });
    expect(result.primaryReference.light).toMatchObject({ tone: 40, hex: '#0061ff' });
    expect(result.primaryReference.dark).toMatchObject({ tone: 50, hex: '#0061ff' });
    expect(result.issues.map((issue) => issue.code)).not.toContain('PRIMARY_SCALE_CONTINUITY');
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'review',
          code: 'SOURCE_EXACT_SCALE_REVIEW',
          familyId: 'b.blue.v1'
        })
      ])
    );
  });

  it('searches beyond soft-ranked candidates to resolve a saturated red-purple system', () => {
    const result = generateKiskadeeTonalSystem(createRecipe('#FF0084'));
    expectResolved(result);

    expect(result.primaryReference.familyId).toBe('rp.magenta.v1');
    expect(result.rest).toEqual({ light: 28, dark: 65, source: 'auto-proposal' });
    expect(result.primaryReference.light).toMatchObject({ tone: 28, hex: '#ff0084' });
    expect(result.primaryReference.dark).toMatchObject({ tone: 65, hex: '#ff0084' });

    const green = resolveFamily(result, 'g.green.v1');
    expect(green.themes.light).toMatchObject({ restTone: 28, status: 'review' });
    expect(green.themes.light.scale.diagnostics).toMatchObject({
      valid: true,
      contrastFailures: [],
      chromaContinuityRelaxed: false
    });
    expect(result.issues.map((issue) => issue.code)).not.toContain('HARMONY_TARGET_UNREACHABLE');
  });

  it('preserves chromatic character when a saturated green primary has unusually high luminance', () => {
    const result = generateKiskadeeTonalSystem(createRecipe('#00c300'));
    expectResolved(result);

    expect(result.primaryReference.familyId).toBe('g.green.v1');
    expect(result.rest).toEqual({ light: 22, dark: 75, source: 'auto-proposal' });

    for (const family of result.families.filter(
      (candidate) =>
        candidate.colorKind === 'chromatic' &&
        candidate.variant === 'v1' &&
        candidate.appearance !== 'brown'
    )) {
      for (const theme of ['light', 'dark'] as const) {
        const rest = family.themes[theme].restColor.oklch;
        const utilization = rest.c / maxSrgbChroma(rest.l, rest.h);

        expect(utilization, `${family.id} ${theme}`).toBeGreaterThanOrEqual(0.9);
      }
    }

    expect(resolveFamily(result, 'r.red.v1').themes.light.restColor.hex).toBe('#fb7977');
    expect(resolveFamily(result, 'yr.orange.v1').themes.light.restColor.hex).toBe('#f0891f');
    expect(resolveFamily(result, 'rp.magenta.v1').themes.light.restColor.hex).toBe('#f96db7');
  });

  it.each([
    {
      label: 'very light',
      seedHex: '#fff0d6',
      expectedRest: { light: 3, dark: 95 },
      expectedStatus: 'review',
      expectedIssue: 'HARMONY_REVIEW'
    },
    {
      label: 'very dark',
      seedHex: '#120000',
      expectedRest: { light: 99, dark: 1 },
      expectedStatus: 'pass',
      expectedIssue: null
    }
  ])('resolves a $label primary exactly and exposes its expected diagnostics', ({
    seedHex,
    expectedRest,
    expectedStatus,
    expectedIssue
  }) => {
    const result = generateKiskadeeTonalSystem(createRecipe(seedHex));
    expectResolved(result);

    expect(result.rest).toMatchObject(expectedRest);
    expect(result.status).toBe(expectedStatus);
    expect(result.primaryReference.light.hex).toBe(seedHex);
    expect(result.primaryReference.dark.hex).toBe(seedHex);
    if (expectedIssue) {
      expect(result.issues.map((issue) => issue.code)).toContain(expectedIssue);
    } else {
      expect(result.issues).toEqual([]);
    }
  });

  it('resolves an extreme-gamut primary after exhausting hard-feasible candidates', () => {
    const result = generateKiskadeeTonalSystem(createRecipe('#ff0000'));
    expectResolved(result);

    expect(result.status).toBe('review');
    expect(result.primaryReference.familyId).toBe('r.red.v1');
    expect(result.rest).toEqual({ light: 28, dark: 60, source: 'auto-proposal' });
    expect(result.primaryReference.light).toMatchObject({ tone: 28, hex: '#ff0000' });
    expect(result.primaryReference.dark).toMatchObject({ tone: 60, hex: '#ff0000' });
    expect(result.issues.every((issue) => issue.severity !== 'error')).toBe(true);
    expect(result.issues.map((issue) => issue.code)).not.toContain('HARMONY_TARGET_UNREACHABLE');
    expect(result.issues.map((issue) => issue.code)).not.toContain('PRIMARY_SCALE_CONTINUITY');
  });

  it('keeps every derived seed inside the safe core after sRGB quantization and harmony', () => {
    const result = generateKiskadeeTonalSystem(createRecipe('#ca5010'));
    expectResolved(result);

    for (const family of result.families.filter(
      (candidate) => candidate.seedOrigin === 'derived'
    )) {
      expect(family.identity?.isInSafeCore).toBe(true);
      expect(classifyMunsellHex(family.themes.light.effectiveSeedHex).isInSafeCore).toBe(true);
      expect(classifyMunsellHex(family.themes.dark.effectiveSeedHex).isInSafeCore).toBe(true);
    }
  });

  it('produces distinct companions for distinct blue brand primaries without crossing sectors', () => {
    const seeds = ['#0f6cbd', '#1da1f2', '#0057b8'];
    const systems = seeds.map((seed) => {
      const system = generateKiskadeeTonalSystem(createRecipe(seed));
      expectResolved(system);
      return system;
    });

    for (const id of ['r.red.v1', 'y.yellow.v1', 'g.green.v1'] as const) {
      const colors = systems.map((system) => resolveFamily(system, id).themes.light.restColor.hex);
      expect(new Set(colors).size).toBe(3);
      for (const color of colors) {
        expect(classifyMunsellHex(color).sector).toBe(parseTonalFamilyId(id)?.sector);
      }
    }
  });

  it('keeps Brown in yellow-red with reduced chroma utilization and shared rest', () => {
    const result = generateKiskadeeTonalSystem(createRecipe());
    expectResolved(result);
    const orange = resolveFamily(result, 'yr.orange.v1');
    const brown = resolveFamily(result, 'yr.brown.v1');

    expect(brown.themes.light.restTone).toBe(orange.themes.light.restTone);
    expect(brown.themes.dark.restTone).toBe(orange.themes.dark.restTone);
    expect(brown.themes.light.restColor.oklch.c).toBeLessThan(
      orange.themes.light.restColor.oklch.c
    );
    expect(
      brown.themes.light.restColor.oklch.c / orange.themes.light.restColor.oklch.c
    ).toBeCloseTo(MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio, 1);
  });

  it('auto-selects yr.brown.v1 for the Brown prototype and can lock that classification', () => {
    const result = generateKiskadeeTonalSystem(createRecipe('#8e562e'));
    expectResolved(result);
    expect(result.primaryReference.familyId).toBe('yr.brown.v1');

    const replay = generateKiskadeeTonalSystem(result.source);
    expectResolved(replay);
    expect(replay.source).toEqual(result.source);
    expect(replay.families).toEqual(result.families);
  });

  it('supports core overrides and explicit extra variants', () => {
    const recipe = createRecipe();
    recipe.overrides = [
      {
        id: 'g.green.v1',
        seedHex: '#107c10',
        policies: { light: 'harmonized', dark: 'adaptive' }
      },
      {
        id: 'b.blue.v2',
        seedHex: '#0057b8',
        policies: { light: 'source-exact', dark: 'source-exact' }
      }
    ];
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);

    expect(result.families).toHaveLength(13);
    expect(resolveFamily(result, 'g.green.v1').seedOrigin).toBe('override');
    expect(resolveFamily(result, 'b.blue.v2').seedOrigin).toBe('override');
    expect(resolveFamily(result, 'b.blue.v2').themes.light.sourceSeedPreserved).toBe(true);
  });

  it('uses canonical black and enforces achromatic override guards', () => {
    const canonical = generateKiskadeeTonalSystem(createRecipe());
    expectResolved(canonical);
    expect(resolveFamily(canonical, 'n.black.v1')).toMatchObject({
      sourceSeedHex: '#20252b',
      seedOrigin: 'canonical',
      colorKind: 'achromatic'
    });

    const tinted = createRecipe();
    tinted.overrides = [
      {
        id: 'n.black.v1',
        seedHex: '#3a425f',
        policies: { light: 'source-exact', dark: 'source-exact' }
      }
    ];
    const reviewed = generateKiskadeeTonalSystem(tinted);
    expectResolved(reviewed);
    expect(reviewed.status).toBe('review');
    expect(reviewed.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'review',
          code: 'ACHROMATIC_TINT_REVIEW',
          familyId: 'n.black.v1'
        })
      ])
    );

    const invalid = createRecipe();
    invalid.overrides = [
      {
        id: 'n.black.v1',
        seedHex: '#0f6cbd',
        policies: { light: 'source-exact', dark: 'source-exact' }
      }
    ];
    const failed = generateKiskadeeTonalSystem(invalid);
    expect(failed.valid).toBe(false);
    expect(failed.issues.map((issue) => issue.code)).toContain('ACHROMATIC_CHROMA_TOO_HIGH');
  });

  it('rejects overrides whose seed belongs to another Munsell sector', () => {
    const recipe = createRecipe();
    recipe.overrides = [
      {
        id: 'g.green.v1',
        seedHex: '#d13438',
        policies: { light: 'harmonized', dark: 'harmonized' }
      }
    ];
    const result = generateKiskadeeTonalSystem(recipe);
    expect(result.valid).toBe(false);
    expect(result.issues.map((issue) => issue.code)).toContain('OVERRIDE_SECTOR_MISMATCH');
    expect(result.issues.filter((issue) => issue.code === 'OVERRIDE_SECTOR_MISMATCH')).toHaveLength(
      1
    );
  });

  it('is deterministic for repeated generation and input ordering', () => {
    const recipe = createRecipe();
    recipe.overrides = [
      {
        id: 'p.purple.v2',
        seedHex: '#8764b8',
        policies: { light: 'harmonized', dark: 'harmonized' }
      },
      {
        id: 'n.black.v2',
        seedHex: '#26313d',
        policies: { light: 'source-exact', dark: 'adaptive' }
      }
    ];
    const reversed = structuredClone(recipe);
    reversed.overrides.reverse();

    const first = generateKiskadeeTonalSystem(recipe);
    const second = generateKiskadeeTonalSystem(reversed);
    expectResolved(first);
    expectResolved(second);
    expect(second).toEqual(first);
  });
});
