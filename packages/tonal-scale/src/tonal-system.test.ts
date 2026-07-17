import { describe, expect, it } from 'vitest';

import { maxSrgbChroma, oklchToSrgbHex } from './color-math';
import {
  generateKiskadeeScale,
  KISKADEE_TONES,
  type KiskadeeScaleResult,
  type KiskadeeTheme,
  type KiskadeeTonalProfile,
  type KiskadeeTone
} from './kiskadee-tonal-scale';
import { classifyMunsellHex } from './munsell-oklch';
import {
  generateKiskadeeTonalSystem,
  type KiskadeeTonalSystemResult,
  MUNSELL_HARMONY_V1_PARAMETERS,
  type ResolvedKiskadeeTonalSystem,
  SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS
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

function resolveScaleTone(scale: KiskadeeScaleResult, tone: KiskadeeTone) {
  const color = scale.colors.find((candidate) => candidate.tone === tone);
  if (!color) throw new Error(`Tone ${tone} was not resolved.`);
  return color;
}

function createFluentAlignmentRecipe(): TonalSystemRecipeV3 {
  const recipe = createRecipe('#0064b4');
  recipe.tonalProfile = 'muted-darks';
  recipe.primary.policies.dark = 'adaptive';
  recipe.overrides = [
    {
      id: 'r.red.v1',
      seedHex: '#c50f1f',
      policies: { light: 'source-exact', dark: 'adaptive' }
    },
    {
      id: 'yr.orange.v1',
      seedHex: '#f7630c',
      policies: { light: 'source-exact', dark: 'adaptive' }
    },
    {
      id: 'y.yellow.v1',
      seedHex: '#eaa300',
      policies: { light: 'source-exact', dark: 'adaptive' }
    },
    {
      id: 'g.green.v1',
      seedHex: '#107c10',
      policies: { light: 'source-exact', dark: 'adaptive' }
    },
    {
      id: 'p.purple.v1',
      seedHex: '#c239b3',
      policies: { light: 'source-exact', dark: 'adaptive' }
    },
    {
      id: 'n.black.v1',
      seedHex: '#21242d',
      policies: { light: 'source-exact', dark: 'source-exact' }
    }
  ];
  return recipe;
}

function expectSupportAlignmentContract(result: ResolvedKiskadeeTonalSystem): void {
  const primary = resolveFamily(result, result.primaryReference.familyId);

  for (const family of result.families) {
    for (const theme of THEMES) {
      const resolution = family.themes[theme];
      const baseline = generateKiskadeeScale({
        seedHex: resolution.effectiveSeedHex,
        theme,
        profile: result.source.tonalProfile
      });

      if (family.id === primary.id || family.colorKind === 'achromatic') {
        expect(resolution.surfaceTrackAlignment, `${family.id} ${theme}`).toBeNull();
        expect(resolution.scale, `${family.id} ${theme}`).toEqual(baseline);
        continue;
      }

      expect(resolution.surfaceTrackAlignment, `${family.id} ${theme}`).not.toBeNull();
      const protectedIndices = [resolution.scale.anchorTone, resolution.restTone]
        .filter((tone): tone is KiskadeeTone => tone !== null)
        .map((tone) => KISKADEE_TONES.indexOf(tone));
      const relaxed = result.issues.some(
        (issue) =>
          issue.code === 'SURFACE_TRACK_ALIGNMENT_RELAXED' &&
          issue.familyId === family.id &&
          issue.theme === theme
      );

      for (let index = 0; index < resolution.scale.colors.length; index += 1) {
        const color = resolution.scale.colors[index];
        const baselineColor = baseline.colors[index];
        const primaryColor = primary.themes[theme].scale.colors[index];
        if (!color || !baselineColor || !primaryColor) continue;

        expect(
          color.oklch.c,
          `${family.id} ${theme} ${color.tone} one-sided chroma`
        ).toBeLessThanOrEqual(
          baselineColor.oklch.c + SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.quantizationTolerance
        );

        if (
          primaryColor.oklch.l <= SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.startLightness ||
          color.flags.isCap ||
          color.tone === resolution.scale.anchorTone ||
          color.tone === resolution.restTone
        ) {
          expect(color.hex, `${family.id} ${theme} ${color.tone} protected byte`).toBe(
            baselineColor.hex
          );
          continue;
        }

        const outsideProtectionWindow = protectedIndices.every(
          (protectedIndex) =>
            Math.abs(index - protectedIndex) >=
            SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.protectionRadius
        );
        if (
          !relaxed &&
          outsideProtectionWindow &&
          primaryColor.oklch.l >= SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.fullLightness
        ) {
          const cap =
            primaryColor.oklch.c +
            Math.max(
              SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.minimumChromaTolerance,
              primaryColor.oklch.c *
                SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.chromaToleranceRatio
            );
          expect(color.oklch.c, `${family.id} ${theme} ${color.tone} cap`).toBeLessThanOrEqual(
            cap + SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.quantizationTolerance
          );
        }
      }

      expect(resolution.scale.diagnostics.valid, `${family.id} ${theme} valid`).toBe(true);
      expect(resolution.scale.diagnostics.monotonic, `${family.id} ${theme} monotonic`).toBe(true);
      expect(resolution.scale.diagnostics.duplicateTones, `${family.id} ${theme} unique`).toEqual(
        []
      );
    }
  }
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

const PRIMARY_IDENTITY_REGRESSION_SEEDS = [
  '#0f6cbd',
  '#0064b4',
  '#b2dfdb',
  '#ffeb3b',
  '#00c300'
] as const;

const TONAL_PROFILES = [
  'balanced',
  'muted-darks'
] as const satisfies readonly KiskadeeTonalProfile[];

const PRIMARY_IDENTITY_REGRESSION_CASES = TONAL_PROFILES.flatMap((tonalProfile) =>
  PRIMARY_IDENTITY_REGRESSION_SEEDS.map((seedHex) => [seedHex, tonalProfile] as const)
);

const THEMES = ['light', 'dark'] as const satisfies readonly KiskadeeTheme[];

describe('generateKiskadeeTonalSystem v3', () => {
  it.each(
    PRIMARY_IDENTITY_REGRESSION_CASES
  )('keeps %s %s primary scales byte-for-byte equal to the canonical low-level generator', (seedHex, tonalProfile) => {
    const result = generateKiskadeeTonalSystem({
      ...createRecipe(seedHex),
      tonalProfile
    });
    expectResolved(result);
    const primary = resolveFamily(result, result.primaryReference.familyId);

    for (const theme of THEMES) {
      expect(primary.themes[theme].scale, `${seedHex} ${tonalProfile} ${theme}`).toEqual(
        generateKiskadeeScale({ seedHex, theme, profile: tonalProfile })
      );
    }
    expectSupportAlignmentContract(result);
  });

  it('aligns Fluent support colors on physical light tracks without mutating canonical or protected colors', () => {
    const result = generateKiskadeeTonalSystem(createFluentAlignmentRecipe());
    expectResolved(result);
    expect(result.rest).toEqual({ light: 50, dark: 40, source: 'auto-proposal' });

    const primary = resolveFamily(result, 'b.blue.v1');
    const green = resolveFamily(result, 'g.green.v1');
    const red = resolveFamily(result, 'r.red.v1');
    const black = resolveFamily(result, 'n.black.v1');

    for (const theme of THEMES) {
      expect(primary.themes[theme].scale, `Primary ${theme}`).toEqual(
        generateKiskadeeScale({ seedHex: '#0064b4', theme, profile: 'muted-darks' })
      );
      expect(black.themes[theme].scale, `Black ${theme}`).toEqual(
        generateKiskadeeScale({ seedHex: '#21242d', theme, profile: 'muted-darks' })
      );
      expect(primary.themes[theme].surfaceTrackAlignment).toBeNull();
      expect(black.themes[theme].surfaceTrackAlignment).toBeNull();
    }

    expect(resolveScaleTone(primary.themes.light.scale, 4).hex).toBe('#e1efff');
    expect(resolveScaleTone(red.themes.light.scale, 4).hex).toBe('#ffe7e4');

    for (const [theme, tone] of [
      ['light', 4],
      ['dark', 95]
    ] as const) {
      const primaryColor = resolveScaleTone(primary.themes[theme].scale, tone);
      const greenColor = resolveScaleTone(green.themes[theme].scale, tone);
      const fullCap =
        primaryColor.oklch.c +
        Math.max(
          SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.minimumChromaTolerance,
          primaryColor.oklch.c * SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.chromaToleranceRatio
        );

      expect(greenColor.oklch.c, `${theme} ${tone}`).toBeLessThanOrEqual(fullCap + 0.000_5);
    }

    expect(resolveScaleTone(green.themes.light.scale, 4).hex).not.toBe('#d3facf');

    for (const [theme, tone] of [
      ['light', 16],
      ['dark', 80]
    ] as const) {
      const primaryColor = resolveScaleTone(primary.themes[theme].scale, tone);
      const baseline = generateKiskadeeScale({
        seedHex: green.themes[theme].effectiveSeedHex,
        theme,
        profile: 'muted-darks'
      });

      expect(primaryColor.oklch.l).toBeLessThanOrEqual(
        SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.startLightness
      );
      expect(resolveScaleTone(green.themes[theme].scale, tone).hex).toBe(
        resolveScaleTone(baseline, tone).hex
      );
    }

    expect(resolveScaleTone(green.themes.light.scale, 45).hex).toBe('#107c10');
    expect(green.themes.light.restColor).toMatchObject({ tone: 50, hex: '#09760a' });
    expect(resolveScaleTone(green.themes.dark.scale, 40).hex).toBe('#087209');
    expect(green.themes.dark.restColor).toMatchObject({ tone: 40, hex: '#087209' });

    for (const theme of THEMES) {
      const diagnostics = green.themes[theme].surfaceTrackAlignment;
      expect(diagnostics).toMatchObject({
        contract: SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.contract,
        referenceFamilyId: 'b.blue.v1'
      });
      expect(diagnostics?.adjustedToneCount).toBe(diagnostics?.adjustedTones.length);
      expect(diagnostics?.protectedTones).toEqual(expect.arrayContaining([0, 100]));
      expect(diagnostics?.maxRemainingExcess).toBeLessThanOrEqual(
        SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.quantizationTolerance
      );
    }
  });

  it('reports the measurable excess retained by an exact protected support anchor', () => {
    const result = generateKiskadeeTonalSystem(createRecipe('#fff0d6'));
    expectResolved(result);

    const protectedIssue = result.issues.find(
      (issue) => issue.code === 'SURFACE_TRACK_ALIGNMENT_PROTECTED'
    );
    if (!protectedIssue?.familyId || !protectedIssue.theme) {
      throw new Error('Expected an exact protected surface-track anchor review.');
    }

    const family = resolveFamily(result, protectedIssue.familyId);
    const resolution = family.themes[protectedIssue.theme];
    const anchorTone = resolution.scale.anchorTone;
    if (anchorTone === null) throw new Error('Expected a generated support anchor.');

    const baseline = generateKiskadeeScale({
      seedHex: resolution.effectiveSeedHex,
      theme: protectedIssue.theme,
      profile: result.source.tonalProfile
    });

    expect(resolveScaleTone(resolution.scale, anchorTone).hex).toBe(
      resolveScaleTone(baseline, anchorTone).hex
    );
    expect(resolution.surfaceTrackAlignment?.protectedTones).toContain(anchorTone);
    expect(resolution.surfaceTrackAlignment?.maxRemainingExcess).toBeGreaterThan(
      SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS.quantizationTolerance
    );
  });

  it('restores only the conflicting light-surface positions', () => {
    const recipe = createRecipe('#ffeb3b');
    recipe.tonalProfile = 'muted-darks';
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);

    const lime = resolveFamily(result, 'gy.lime.v1').themes.dark;
    const baseline = generateKiskadeeScale({
      seedHex: lime.effectiveSeedHex,
      theme: 'dark',
      profile: 'muted-darks'
    });

    expect(resolveScaleTone(lime.scale, 85).hex).not.toBe(resolveScaleTone(baseline, 85).hex);
    expect(resolveScaleTone(lime.scale, 90).hex).toBe(resolveScaleTone(baseline, 90).hex);
    expect(lime.surfaceTrackAlignment).toMatchObject({
      adjustedTones: [85],
      restorationCount: 1
    });
    expect(lime.scale.diagnostics.valid).toBe(true);
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
  )('generates the complete canonical system from a representative %s primary in both profiles', (sector, seedHex) => {
    for (const tonalProfile of TONAL_PROFILES) {
      const result = generateKiskadeeTonalSystem({
        ...createRecipe(seedHex),
        tonalProfile
      });
      expectResolved(result);

      expect(classifyMunsellHex(seedHex).sector).toBe(sector);
      expect(parseTonalFamilyId(result.primaryReference.familyId)?.sector).toBe(sector);
      expect(result.families).toHaveLength(TONAL_CORE_FAMILY_IDS.length);
      expect(result.families.map((family) => family.id).sort()).toEqual(
        [...TONAL_CORE_FAMILY_IDS].sort()
      );

      const primary = resolveFamily(result, result.primaryReference.familyId);
      for (const theme of THEMES) {
        expect(primary.themes[theme].scale, `${sector} ${tonalProfile} ${theme}`).toEqual(
          generateKiskadeeScale({ seedHex, theme, profile: tonalProfile })
        );
      }
      expectSupportAlignmentContract(result);
    }
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
