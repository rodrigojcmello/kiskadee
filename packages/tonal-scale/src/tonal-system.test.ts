import { createHash } from 'node:crypto';

import { describe, expect, it } from 'vitest';

import { contrastRatio, deltaEOk, hexToOklch, maxSrgbChroma, oklchToSrgbHex } from './color-math';
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
  DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS,
  generateKiskadeeTonalSystem,
  type KiskadeeTonalSystemResult,
  MUNSELL_HARMONY_V1_PARAMETERS,
  type ResolvedKiskadeeTonalSystem,
  resolveTonalFunctionalReference,
  SURFACE_TRACK_CHROMA_ALIGNMENT_V1_PARAMETERS,
  TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS
} from './tonal-system';
import {
  DEFAULT_TONAL_SYSTEM_RECIPE,
  parseTonalFamilyId,
  TONAL_CORE_FAMILY_IDS,
  type TonalFamilyId,
  type TonalSystemRecipeV5
} from './tonal-system-contract';

function createRecipe(seedHex = '#0f6cbd'): TonalSystemRecipeV5 {
  const recipe = structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE) as TonalSystemRecipeV5;
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

function circularHueDistanceForTest(left: number, right: number): number {
  const distance = Math.abs(left - right) % 360;
  return Math.min(distance, 360 - distance);
}

function createFluentAlignmentRecipe(): TonalSystemRecipeV5 {
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
      id: 'n.black.v2',
      seedHex: '#21242d',
      policies: { light: 'source-exact', dark: 'source-exact' }
    }
  ];
  return recipe;
}

type FluentRedDarkPolicy = 'adaptive' | 'harmonized' | 'source-exact';

function createFluentAlignmentRecipeWithRedDarkPolicy(
  darkPolicy: FluentRedDarkPolicy
): TonalSystemRecipeV5 {
  const recipe = createFluentAlignmentRecipe();
  const red = recipe.overrides.find((override) => override.id === 'r.red.v1');
  if (!red) throw new Error('Expected the Fluent Red override.');
  red.policies.dark = darkPolicy;
  return recipe;
}

function hashHexBytes(value: unknown): string {
  return createHash('sha256').update(JSON.stringify(value)).digest('hex');
}

function resolveChromaAtPhysicalLightnessForTest(
  scale: KiskadeeScaleResult,
  lightness: number
): number {
  const colors = [...scale.colors].sort((left, right) => left.oklch.l - right.oklch.l);
  const first = colors[0];
  const last = colors.at(-1);
  if (!first || !last) throw new Error('Expected a populated scale.');
  if (lightness <= first.oklch.l) return first.oklch.c;
  if (lightness >= last.oklch.l) return last.oklch.c;

  for (let index = 1; index < colors.length; index += 1) {
    const lower = colors[index - 1];
    const upper = colors[index];
    if (!lower || !upper || lightness > upper.oklch.l) continue;
    const span = upper.oklch.l - lower.oklch.l;
    if (span <= Number.EPSILON) return Math.max(lower.oklch.c, upper.oklch.c);
    const progress = (lightness - lower.oklch.l) / span;
    return lower.oklch.c + (upper.oklch.c - lower.oklch.c) * progress;
  }

  return last.oklch.c;
}

function expectCanonicalScaleInvariants(scale: KiskadeeScaleResult): void {
  expect(scale.colors.map((color) => color.tone)).toEqual(KISKADEE_TONES);
  expect(scale.diagnostics.valid).toBe(true);
  expect(scale.diagnostics.monotonic).toBe(true);
  expect(scale.diagnostics.duplicateTones).toEqual([]);
  expect(scale.diagnostics.contrastFailures).toEqual([]);
  expect(scale.colors[0]?.hex).toBe('#000000');
  expect(scale.colors.at(-1)?.hex).toBe('#ffffff');
  for (const color of scale.colors) {
    expect(oklchToSrgbHex(color.oklch).hex, `${color.tone} sRGB round-trip`).toBe(color.hex);
  }
}

function expectDarkSupportChromaModerationContract(
  result: ResolvedKiskadeeTonalSystem,
  familyId: TonalFamilyId
): void {
  const primary = resolveFamily(result, result.primaryReference.familyId).themes.dark;
  const support = resolveFamily(result, familyId).themes.dark;
  const diagnostics = support.darkSupportChromaModeration;
  expect(diagnostics).toMatchObject({
    contract: DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.contract,
    referenceFamilyId: result.primaryReference.familyId
  });
  expect(diagnostics?.finalMaxExcess).toBeLessThanOrEqual(
    DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.quantizationTolerance
  );
  expect(diagnostics?.maxChromaIncrease).toBe(0);

  for (const color of support.scale.colors) {
    if (
      color.tone < DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.startTone ||
      color.tone > DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.endTone
    ) {
      continue;
    }
    const primaryChroma = resolveChromaAtPhysicalLightnessForTest(primary.scale, color.oklch.l);
    const cap =
      primaryChroma +
      Math.max(
        DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.minimumChromaTolerance,
        primaryChroma * DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.chromaToleranceRatio
      );
    expect(color.oklch.c, `${familyId} D${color.tone}`).toBeLessThanOrEqual(
      cap + DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.quantizationTolerance
    );
  }

  expectCanonicalScaleInvariants(support.scale);
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

describe('generateKiskadeeTonalSystem v5', () => {
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

  it.each([
    'adaptive',
    'harmonized',
    'source-exact'
  ] as const)('freezes every Fluent Light family and both Primary scales when Red Dark is %s', (darkPolicy) => {
    const result = generateKiskadeeTonalSystem(
      createFluentAlignmentRecipeWithRedDarkPolicy(darkPolicy)
    );
    expectResolved(result);
    const primary = resolveFamily(result, 'b.blue.v1');

    expect(
      hashHexBytes(
        result.families.map((family) => [
          family.id,
          family.themes.light.scale.colors.map((color) => color.hex)
        ])
      )
    ).toBe('886f2ac6c9086f4ace1b510d8d455eccfeafca895bbf5579096aacdf05ae3316');
    expect(hashHexBytes(primary.themes.light.scale.colors.map((color) => color.hex))).toBe(
      'd97e74586e1cbcb736ba8aa6ee956e770f5b1d1677cddc6ec0c402c90782c7cc'
    );
    expect(hashHexBytes(primary.themes.dark.scale.colors.map((color) => color.hex))).toBe(
      '2adec8bf51a9c2d1949ffe1f2fbabede2108baff1ccfc37beb607220ca63a318'
    );
    expect(primary.themes.light.darkSupportChromaModeration).toBeNull();
    expect(primary.themes.dark.darkSupportChromaModeration).toBeNull();
  });

  it.each([
    'adaptive',
    'harmonized'
  ] as const)('moderates Fluent Red Dark %s against Primary without changing its Munsell identity', (darkPolicy) => {
    const recipe = createFluentAlignmentRecipeWithRedDarkPolicy(darkPolicy);
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);
    const red = resolveFamily(result, 'r.red.v1').themes.dark;
    const anchorTone = red.scale.anchorTone;
    if (anchorTone === null) throw new Error('Expected a moderated Red Dark anchor.');

    expect(red.policy).toBe(darkPolicy);
    expect(red.sourceSeedPreserved).toBe(false);
    expect(red.effectiveSeedHex).toBe(resolveScaleTone(red.scale, anchorTone).hex);
    expect(red.restColor).toEqual(resolveScaleTone(red.scale, red.restTone));
    expect(red.effectiveSeedHex).not.toBe('#c50f1f');
    expect(red.darkSupportChromaModeration?.adjustedToneCount).toBeGreaterThan(0);
    expect(red.darkSupportChromaModeration?.baselineMaxExcess).toBeGreaterThan(
      red.darkSupportChromaModeration?.finalMaxExcess ?? Number.POSITIVE_INFINITY
    );
    expectDarkSupportChromaModerationContract(result, 'r.red.v1');
    expect(
      result.issues.some(
        (issue) =>
          issue.code === 'DARK_SUPPORT_CHROMA_MODERATION_RELAXED' && issue.familyId === 'r.red.v1'
      )
    ).toBe(false);

    expect(generateKiskadeeTonalSystem(recipe)).toEqual(result);
  });

  it('leaves Dark source-exact and already compliant Fluent support scales byte-identical', () => {
    const sourceExactResult = generateKiskadeeTonalSystem(
      createFluentAlignmentRecipeWithRedDarkPolicy('source-exact')
    );
    expectResolved(sourceExactResult);
    const sourceExactRed = resolveFamily(sourceExactResult, 'r.red.v1').themes.dark;
    expect(sourceExactRed).toMatchObject({
      policy: 'source-exact',
      sourceSeedPreserved: true,
      effectiveSeedHex: '#c50f1f',
      darkSupportChromaModeration: null
    });
    expect(sourceExactRed.scale.anchorTone).toBe(40);
    expect(hashHexBytes(sourceExactRed.scale.colors.map((color) => color.hex))).toBe(
      'ceaf7dcbcc13430e2f1b6a84cd0ecf78d2010deffdc83ea7e01686673ee31c6b'
    );

    const adaptiveResult = generateKiskadeeTonalSystem(createFluentAlignmentRecipe());
    expectResolved(adaptiveResult);
    for (const [familyId, expectedHash] of [
      ['yr.orange.v1', '0afb1c167109a62dfce7ca92776836cd3dbc8e19a5af7767d6b335a9886c5f57'],
      ['g.green.v1', 'e428b42b23d57e2c7fe77be1ff50f68a3eb9409da364f69b5d864000e08a1f04']
    ] as const) {
      const resolution = resolveFamily(adaptiveResult, familyId).themes.dark;
      expect(hashHexBytes(resolution.scale.colors.map((color) => color.hex))).toBe(expectedHash);
      expect(resolution.darkSupportChromaModeration?.adjustedToneCount).toBe(0);
      expect(resolution.darkSupportChromaModeration?.maxChromaIncrease).toBe(0);
      expectDarkSupportChromaModerationContract(adaptiveResult, familyId);
    }
  });

  it('aligns Fluent support colors on physical light tracks without mutating canonical or protected colors', () => {
    const result = generateKiskadeeTonalSystem(createFluentAlignmentRecipe());
    expectResolved(result);
    expect(result.rest).toEqual({ light: 50, dark: 40, source: 'auto-proposal' });

    const primary = resolveFamily(result, 'b.blue.v1');
    const green = resolveFamily(result, 'g.green.v1');
    const red = resolveFamily(result, 'r.red.v1');
    const black = resolveFamily(result, 'n.black.v1');
    const tintedNeutral = resolveFamily(result, 'n.black.v2');

    for (const theme of THEMES) {
      expect(primary.themes[theme].scale, `Primary ${theme}`).toEqual(
        generateKiskadeeScale({ seedHex: '#0064b4', theme, profile: 'muted-darks' })
      );
      expect(primary.themes[theme].surfaceTrackAlignment).toBeNull();
      expect(black.themes[theme].surfaceTrackAlignment).toBeNull();
      expect(black.themes[theme].scale).toEqual(
        generateKiskadeeScale({ seedHex: '#000000', theme, profile: 'muted-darks' })
      );
      const blackAnchorTone = black.themes[theme].scale.anchorTone;
      if (blackAnchorTone === null) throw new Error(`Expected a Black ${theme} anchor.`);
      expect(resolveScaleTone(black.themes[theme].scale, blackAnchorTone).hex).toBe('#000000');
      expect(black.themes[theme].tintedAchromaticChroma).toBeNull();
      expect(tintedNeutral.themes[theme].tintedAchromaticChroma).toMatchObject({
        contract: TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS.contract,
        seedChroma: hexToOklch('#21242d').c
      });
    }

    expect(black.themes.light.restColor).toMatchObject({ tone: 50, hex: '#616161' });
    expect(black.themes.dark.restColor).toMatchObject({ tone: 40, hex: '#626262' });
    expect(tintedNeutral.themes.light.restColor).toMatchObject({ tone: 50, hex: '#5d616b' });
    expect(tintedNeutral.themes.dark.restColor).toMatchObject({ tone: 40, hex: '#5d616c' });

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
    const recipe = createRecipe('#0f6cbd');
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
      adjustedTones: [85, 99],
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

  it('resolves the automatic Primary subtle reference at L4 and mirrors it against Dark surface', () => {
    const result = generateKiskadeeTonalSystem(createRecipe());
    expectResolved(result);

    const primary = resolveFamily(result, result.primaryReference.familyId);
    const lightVivid = resolveTonalFunctionalReference(result, primary.id, 'light', 'vivid');
    const darkVivid = resolveTonalFunctionalReference(result, primary.id, 'dark', 'vivid');
    const lightSubtle = resolveTonalFunctionalReference(result, primary.id, 'light', 'subtle');
    const darkSubtle = resolveTonalFunctionalReference(result, primary.id, 'dark', 'subtle');

    expect(primary.functionalReferenceRules).toEqual({
      light: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } },
      dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
    });
    expect(lightVivid).toMatchObject({
      tone: primary.themes.light.scale.anchorTone,
      source: 'generated-anchor'
    });
    expect(darkVivid).toMatchObject({
      tone: primary.themes.dark.scale.anchorTone,
      source: 'generated-anchor'
    });
    expect(lightSubtle).toMatchObject({
      tone: 4,
      hex: resolveScaleTone(primary.themes.light.scale, 4).hex,
      source: 'surface-relative'
    });
    expect(darkSubtle.source).toBe('surface-relative');

    const darkVividIndex = KISKADEE_TONES.indexOf(darkVivid.tone);
    const selectedError = Math.abs(
      Math.log(darkSubtle.surfaceContrast / lightSubtle.surfaceContrast)
    );
    for (const color of primary.themes.dark.scale.colors.filter(
      (candidate) =>
        candidate.tone > 0 &&
        candidate.tone < 100 &&
        KISKADEE_TONES.indexOf(candidate.tone) < darkVividIndex
    )) {
      const candidateError = Math.abs(
        Math.log(contrastRatio(color.hex, '#000000') / lightSubtle.surfaceContrast)
      );
      expect(selectedError).toBeLessThanOrEqual(candidateError + 1e-12);
    }
  });

  it('matches a Primary subtle reference HEX without changing any generated scale bytes', () => {
    const baseline = generateKiskadeeTonalSystem(createRecipe('#0064b4'));
    expectResolved(baseline);

    const recipe = createRecipe('#0064b4');
    recipe.functionalReferences = [
      {
        id: 'b.blue.v1',
        light: {
          vivid: { mode: 'auto' },
          subtle: { mode: 'reference-match', referenceHex: '#d9f1ff' }
        },
        dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
      }
    ];
    const configured = generateKiskadeeTonalSystem(recipe);
    expectResolved(configured);

    expect(
      configured.families.map((family) => ({
        id: family.id,
        light: family.themes.light.scale,
        dark: family.themes.dark.scale
      }))
    ).toEqual(
      baseline.families.map((family) => ({
        id: family.id,
        light: family.themes.light.scale,
        dark: family.themes.dark.scale
      }))
    );

    const matched = resolveTonalFunctionalReference(configured, 'b.blue.v1', 'light', 'subtle');
    expect(matched).toMatchObject({
      tone: 4,
      hex: '#e1efff',
      source: 'reference-match',
      referenceHex: '#d9f1ff'
    });
    expect(matched.deltaE).toBeCloseTo(0.010_751_892, 8);
  });

  it('resolves support subtle references relative to the Primary surface relationship', () => {
    const result = generateKiskadeeTonalSystem(createRecipe());
    expectResolved(result);

    for (const theme of THEMES) {
      const primarySubtle = resolveTonalFunctionalReference(
        result,
        result.primaryReference.familyId,
        theme,
        'subtle'
      );
      const surface = hexToOklch(theme === 'light' ? '#ffffff' : '#000000');

      for (const family of result.families.filter(
        (candidate) => candidate.id !== result.primaryReference.familyId
      )) {
        const vivid = resolveTonalFunctionalReference(result, family.id, theme, 'vivid');
        const subtle = resolveTonalFunctionalReference(result, family.id, theme, 'subtle');
        const vividIndex = KISKADEE_TONES.indexOf(vivid.tone);
        const selectedError = Math.abs(subtle.surfaceDeltaE - primarySubtle.surfaceDeltaE);

        expect(subtle.source, `${family.id} ${theme}`).toBe('surface-relative');
        expect(subtle.hex, `${family.id} ${theme}`).toBe(
          resolveScaleTone(family.themes[theme].scale, subtle.tone).hex
        );
        expect(KISKADEE_TONES.indexOf(subtle.tone)).toBeLessThan(vividIndex);

        for (const color of family.themes[theme].scale.colors.filter(
          (candidate) =>
            candidate.tone > 0 &&
            candidate.tone < 100 &&
            KISKADEE_TONES.indexOf(candidate.tone) < vividIndex
        )) {
          const candidateError = Math.abs(
            deltaEOk(color.oklch, surface) - primarySubtle.surfaceDeltaE
          );
          expect(selectedError, `${family.id} ${theme} ${color.tone}`).toBeLessThanOrEqual(
            candidateError + 1e-12
          );
        }
      }
    }
  });

  it('keeps Yellow and Black subtle references family-specific', () => {
    const result = generateKiskadeeTonalSystem(createRecipe('#ffeb3b'));
    expectResolved(result);

    const yellowLight = resolveTonalFunctionalReference(result, 'y.yellow.v1', 'light', 'subtle');
    const yellowDark = resolveTonalFunctionalReference(result, 'y.yellow.v1', 'dark', 'subtle');
    const blackLight = resolveTonalFunctionalReference(result, 'n.black.v1', 'light', 'subtle');
    const blackDark = resolveTonalFunctionalReference(result, 'n.black.v1', 'dark', 'subtle');

    expect(yellowLight).toMatchObject({ tone: 4, source: 'surface-relative' });
    expect(yellowDark).toMatchObject({ tone: 3, source: 'surface-relative' });
    expect(blackLight).toMatchObject({ tone: 10, source: 'surface-relative' });
    expect(blackDark).toMatchObject({ tone: 3, source: 'surface-relative' });
    expect(blackLight.tone).not.toBe(yellowLight.tone);
    expect(blackLight.hex).not.toBe(yellowLight.hex);
  });

  it('resolves explicit vivid and subtle rules without changing tonal scale bytes', () => {
    const baseline = generateKiskadeeTonalSystem(createRecipe());
    expectResolved(baseline);

    const recipe = createRecipe();
    recipe.functionalReferences = [
      {
        id: 'b.blue.v1',
        light: {
          vivid: { mode: 'harmony-rest' },
          subtle: { mode: 'locked', tone: 4 }
        },
        dark: {
          vivid: { mode: 'locked', tone: 70 },
          subtle: { mode: 'locked', tone: 3 }
        }
      },
      {
        id: 'n.black.v1',
        light: {
          vivid: { mode: 'locked', tone: 85 },
          subtle: { mode: 'locked', tone: 10 }
        },
        dark: {
          vivid: { mode: 'locked', tone: 85 },
          subtle: { mode: 'locked', tone: 4 }
        }
      },
      {
        id: 'y.yellow.v1',
        light: { vivid: { mode: 'generated-anchor' }, subtle: { mode: 'auto' } },
        dark: { vivid: { mode: 'harmony-rest' }, subtle: { mode: 'auto' } }
      }
    ];
    const configured = generateKiskadeeTonalSystem(recipe);
    expectResolved(configured);

    expect(
      configured.families.map((family) => ({
        id: family.id,
        light: family.themes.light.scale,
        dark: family.themes.dark.scale
      }))
    ).toEqual(
      baseline.families.map((family) => ({
        id: family.id,
        light: family.themes.light.scale,
        dark: family.themes.dark.scale
      }))
    );

    expect(
      resolveTonalFunctionalReference(configured, 'b.blue.v1', 'light', 'vivid')
    ).toMatchObject({
      tone: resolveFamily(configured, 'b.blue.v1').themes.light.restTone,
      source: 'harmony-rest'
    });
    expect(resolveTonalFunctionalReference(configured, 'b.blue.v1', 'dark', 'vivid')).toMatchObject(
      {
        tone: 70,
        source: 'locked'
      }
    );
    expect(
      resolveTonalFunctionalReference(configured, 'b.blue.v1', 'dark', 'subtle')
    ).toMatchObject({ tone: 3, source: 'locked' });
    expect(
      resolveTonalFunctionalReference(configured, 'n.black.v1', 'dark', 'vivid')
    ).toMatchObject({
      tone: 85,
      source: 'locked'
    });
    expect(
      resolveTonalFunctionalReference(configured, 'y.yellow.v1', 'dark', 'vivid')
    ).toMatchObject({
      tone: resolveFamily(configured, 'y.yellow.v1').themes.dark.restTone,
      source: 'harmony-rest'
    });
  });

  it('reports the known fallback when vivid occupies the first public tone', () => {
    const result = generateKiskadeeTonalSystem(createRecipe('#120000'));
    expectResolved(result);

    expect(resolveTonalFunctionalReference(result, 'r.red.v1', 'dark', 'vivid')).toMatchObject({
      tone: 1,
      source: 'generated-anchor'
    });
    expect(resolveTonalFunctionalReference(result, 'r.red.v1', 'dark', 'subtle')).toMatchObject({
      tone: 1,
      source: 'surface-relative'
    });
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          severity: 'review',
          code: 'SUBTLE_REFERENCE_SURFACE_EDGE_FALLBACK',
          familyId: 'r.red.v1',
          theme: 'dark'
        })
      ])
    );
    const red = resolveFamily(result, 'r.red.v1');
    expect(red.status).toBe('review');
    expect(red.themes.dark.status).toBe('review');
  });

  it('locks and replays every functional reference with exact provenance', () => {
    const recipe = createRecipe('#0064b4');
    recipe.functionalReferences = [
      {
        id: 'b.blue.v1',
        light: {
          vivid: { mode: 'generated-anchor' },
          subtle: { mode: 'reference-match', referenceHex: '#d9f1ff' }
        },
        dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
      },
      {
        id: 'n.black.v1',
        light: {
          vivid: { mode: 'locked', tone: 85 },
          subtle: { mode: 'locked', tone: 4 }
        },
        dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
      }
    ];
    const generated = generateKiskadeeTonalSystem(recipe);
    expectResolved(generated);
    const replay = generateKiskadeeTonalSystem(generated.source);
    expectResolved(replay);

    expect(replay.source).toEqual(generated.source);
    expect(replay.functionalReferences).toEqual(generated.functionalReferences);
    expect(
      replay.families.map((family) => ({
        id: family.id,
        light: family.themes.light.scale,
        dark: family.themes.dark.scale
      }))
    ).toEqual(
      generated.families.map((family) => ({
        id: family.id,
        light: family.themes.light.scale,
        dark: family.themes.dark.scale
      }))
    );
    expect(
      generated.source.functionalReferences.find((family) => family.id === 'b.blue.v1')?.light
        .subtle
    ).toEqual({ tone: 4, source: 'reference-match', referenceHex: '#d9f1ff' });
    expect(
      generated.source.functionalReferences.find((family) => family.id === 'n.black.v1')?.light
        .vivid
    ).toEqual({ tone: 85, source: 'locked' });
  });

  it('rejects functional references for families that are not materialized', () => {
    const recipe = createRecipe();
    recipe.functionalReferences = [
      {
        id: 'n.black.v2',
        light: {
          vivid: { mode: 'locked', tone: 85 },
          subtle: { mode: 'locked', tone: 4 }
        },
        dark: {
          vivid: { mode: 'locked', tone: 90 },
          subtle: { mode: 'locked', tone: 4 }
        }
      }
    ];

    const result = generateKiskadeeTonalSystem(recipe);
    expect(result.valid).toBe(false);
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'FUNCTIONAL_REFERENCE_FAMILY_NOT_FOUND',
          familyId: 'n.black.v2'
        })
      ])
    );
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
        id: 'n.black.v2',
        seedHex: '#40464d',
        policies: { light: 'source-exact', dark: 'adaptive' }
      }
    ];
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);
    const dark = resolveFamily(result, 'n.black.v2').themes.dark;

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
      for (const family of result.families) {
        if (family.role === 'support' && family.colorKind === 'chromatic') {
          const diagnostics = family.themes.dark.darkSupportChromaModeration;
          expect(diagnostics?.contract).toBe(DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.contract);
          const relaxed =
            (diagnostics?.finalMaxExcess ?? 0) >
              DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.quantizationTolerance ||
            (diagnostics?.maxChromaIncrease ?? 0) >
              DARK_SUPPORT_CHROMA_MODERATION_V1_PARAMETERS.quantizationTolerance;
          expect(
            result.issues.some(
              (issue) =>
                issue.code === 'DARK_SUPPORT_CHROMA_MODERATION_RELAXED' &&
                issue.familyId === family.id &&
                issue.theme === 'dark'
            ),
            `${sector} ${tonalProfile} ${family.id}`
          ).toBe(relaxed);
        }
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

        if (theme === 'dark' && family.role === 'support') {
          expect(utilization, `${family.id} ${theme}`).toBeGreaterThanOrEqual(0.85);
          expectDarkSupportChromaModerationContract(result, family.id);
        } else {
          expect(utilization, `${family.id} ${theme}`).toBeGreaterThanOrEqual(0.9);
        }
      }
    }

    expect(resolveFamily(result, 'r.red.v1').themes.light.restColor.hex).toBe('#ff6d68');
    expect(resolveFamily(result, 'yr.orange.v1').themes.light.restColor.hex).toBe('#f97740');
    expect(resolveFamily(result, 'rp.magenta.v1').themes.light.restColor.hex).toBe('#fb63ad');
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
      expectedStatus: 'review',
      expectedIssue: 'HARMONY_REVIEW'
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
    for (const theme of THEMES) {
      const brownPeak = brown.themes[theme].harmony?.vividPeakGlobalChromaUtilization;
      const orangePeak = orange.themes[theme].harmony?.vividPeakGlobalChromaUtilization;
      if (brownPeak === undefined || orangePeak === undefined) {
        throw new Error(`Expected ${theme} vivid-peak harmony diagnostics.`);
      }
      expect(brownPeak / orangePeak).toBeCloseTo(MUNSELL_HARMONY_V1_PARAMETERS.brownChromaRatio, 2);
    }
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

  it('accepts Apple Brown as the authored yr.brown.v1 family', () => {
    const recipe = createRecipe();
    recipe.overrides = [
      {
        id: 'yr.brown.v1',
        seedHex: '#ac7f5e',
        policies: { light: 'source-exact', dark: 'adaptive' }
      }
    ];

    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);

    expect(resolveFamily(result, 'yr.brown.v1')).toMatchObject({
      sourceSeedHex: '#ac7f5e',
      seedOrigin: 'override'
    });
    expect(result.families.some(({ id }) => id === 'yr.orange.v2')).toBe(false);
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
      sourceSeedHex: '#000000',
      seedOrigin: 'canonical',
      colorKind: 'achromatic',
      status: 'pass',
      themes: {
        light: { tintedAchromaticChroma: null },
        dark: { tintedAchromaticChroma: null }
      }
    });
    expect(
      resolveTonalFunctionalReference(canonical, 'n.black.v1', 'light', 'vivid')
    ).toMatchObject({
      tone: 99,
      source: 'generated-anchor'
    });
    expect(resolveTonalFunctionalReference(canonical, 'n.black.v1', 'dark', 'vivid')).toMatchObject(
      {
        tone: 99,
        source: 'contrast-mirror'
      }
    );
    expect(canonical.issues.filter((issue) => issue.familyId === 'n.black.v1')).toEqual([]);

    const immutable = createRecipe();
    immutable.overrides = [
      {
        id: 'n.black.v1',
        seedHex: '#21242d',
        policies: { light: 'source-exact', dark: 'source-exact' }
      }
    ];
    const immutableResult = generateKiskadeeTonalSystem(immutable);
    expect(immutableResult.valid).toBe(false);
    expect(immutableResult.issues.map((issue) => issue.code)).toContain(
      'CANONICAL_BLACK_OVERRIDE_UNSUPPORTED'
    );

    const tinted = createRecipe();
    tinted.overrides = [
      {
        id: 'n.black.v2',
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
          familyId: 'n.black.v2'
        })
      ])
    );

    const invalid = createRecipe();
    invalid.overrides = [
      {
        id: 'n.black.v2',
        seedHex: '#0f6cbd',
        policies: { light: 'source-exact', dark: 'source-exact' }
      }
    ];
    const failed = generateKiskadeeTonalSystem(invalid);
    expect(failed.valid).toBe(false);
    expect(failed.issues.map((issue) => issue.code)).toContain('ACHROMATIC_CHROMA_TOO_HIGH');
  }, 15_000);

  it('keeps canonical pure Black byte-identical to the low-level achromatic scale', () => {
    const recipe = createRecipe();
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);
    const black = resolveFamily(result, 'n.black.v1');

    for (const theme of THEMES) {
      expect(black.themes[theme].scale).toEqual(
        generateKiskadeeScale({ seedHex: '#000000', theme, profile: recipe.tonalProfile })
      );
      for (const color of black.themes[theme].scale.colors) {
        expect(color.hsl.s, `${theme} ${color.tone} saturation`).toBeLessThanOrEqual(1e-7);
        expect(color.oklch.c, `${theme} ${color.tone} chroma`).toBeLessThanOrEqual(1e-7);
      }
    }
  });

  it.each([
    'balanced',
    'muted-darks'
  ] as const)('preserves the Fluent tinted-neutral chroma track with the %s profile', (tonalProfile) => {
    const recipe = createRecipe();
    recipe.tonalProfile = tonalProfile;
    recipe.overrides = [
      {
        id: 'n.black.v2',
        seedHex: '#21242d',
        policies: { light: 'source-exact', dark: 'source-exact' }
      }
    ];
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);
    const neutral = resolveFamily(result, 'n.black.v2');
    const seed = hexToOklch('#21242d');

    for (const theme of THEMES) {
      const resolution = neutral.themes[theme];
      const baseline = generateKiskadeeScale({
        seedHex: '#21242d',
        theme,
        profile: tonalProfile
      });
      const surfaceTone = theme === 'light' ? 4 : 95;
      const surface = resolveScaleTone(resolution.scale, surfaceTone);
      const baselineSurface = resolveScaleTone(baseline, surfaceTone);
      const anchorTone = resolution.scale.anchorTone;

      expect(anchorTone).not.toBeNull();
      expect(resolveScaleTone(resolution.scale, anchorTone!).hex).toBe('#21242d');
      expect(resolution.scale.colors.map((color) => color.targetLightness)).toEqual(
        baseline.colors.map((color) => color.targetLightness)
      );
      expect(resolution.scale.colors.map((color) => color.nominalLightness)).toEqual(
        baseline.colors.map((color) => color.nominalLightness)
      );
      expect(resolution.scale.diagnostics.valid).toBe(true);
      expect(resolution.scale.diagnostics.monotonic).toBe(true);
      expect(resolution.scale.diagnostics.duplicateTones).toEqual([]);
      expect(resolveScaleTone(resolution.scale, 0).hex).toBe(
        theme === 'light' ? '#ffffff' : '#000000'
      );
      expect(resolveScaleTone(resolution.scale, 100).hex).toBe(
        theme === 'light' ? '#000000' : '#ffffff'
      );
      expect(surface.oklch.c).toBeGreaterThanOrEqual(seed.c * 0.85);
      expect(surface.oklch.c).toBeGreaterThan(baselineSurface.oklch.c + 0.005);
      expect(resolution.tintedAchromaticChroma).toMatchObject({
        contract: TINTED_ACHROMATIC_CHROMA_V1_PARAMETERS.contract,
        seedHue: seed.h,
        seedChroma: seed.c
      });
      expect(resolution.tintedAchromaticChroma?.adjustedToneCount).toBeGreaterThan(0);
      expect(resolution.tintedAchromaticChroma?.maxHueDrift).toBeLessThan(8);
      expect(resolution.restColor.hex).toBe(
        resolveScaleTone(resolution.scale, resolution.restTone).hex
      );
    }
  }, 15_000);

  it('keeps independent Material-like tinted-neutral plateaus for v2 and v3', () => {
    const recipe = createRecipe();
    recipe.overrides = [
      {
        id: 'n.black.v2',
        seedHex: '#27252b',
        policies: { light: 'source-exact', dark: 'source-exact' }
      },
      {
        id: 'n.black.v3',
        seedHex: '#27252d',
        policies: { light: 'source-exact', dark: 'source-exact' }
      }
    ];
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);

    for (const [familyId, seedHex] of [
      ['n.black.v2', '#27252b'],
      ['n.black.v3', '#27252d']
    ] as const) {
      const family = resolveFamily(result, familyId);
      const seed = hexToOklch(seedHex);

      for (const theme of THEMES) {
        const resolution = family.themes[theme];
        const surfaceTone = theme === 'light' ? 4 : 95;
        const surface = resolveScaleTone(resolution.scale, surfaceTone);

        expect(surface.oklch.c).toBeCloseTo(seed.c, 2);
        expect(circularHueDistanceForTest(surface.oklch.h, seed.h)).toBeLessThan(12);
        expect(resolution.scale.diagnostics.valid).toBe(true);
        expect(resolution.scale.diagnostics.monotonic).toBe(true);
        expect(resolution.scale.diagnostics.duplicateTones).toEqual([]);
        expect(resolution.tintedAchromaticChroma?.seedChroma).toBe(seed.c);
      }
    }
  }, 15_000);

  it('derives adaptive tinted-neutral trajectories from each effective theme seed', () => {
    const recipe = createRecipe();
    recipe.overrides = [
      {
        id: 'n.black.v4',
        seedHex: '#26313d',
        policies: { light: 'adaptive', dark: 'adaptive' }
      }
    ];
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);
    const neutral = resolveFamily(result, 'n.black.v4');

    for (const theme of THEMES) {
      const resolution = neutral.themes[theme];
      const effectiveSeed = hexToOklch(resolution.effectiveSeedHex);
      const anchorTone = resolution.scale.anchorTone;

      expect(anchorTone).not.toBeNull();
      expect(resolveScaleTone(resolution.scale, anchorTone!).hex).toBe(resolution.effectiveSeedHex);
      expect(resolution.tintedAchromaticChroma).toMatchObject({
        seedHue: effectiveSeed.h,
        seedChroma: effectiveSeed.c
      });
      expect(resolution.scale.diagnostics.valid).toBe(true);
    }
  }, 15_000);

  it('does not change canonical Black or any chromatic family when a tinted neutral is added', () => {
    const baseline = generateKiskadeeTonalSystem(createRecipe());
    expectResolved(baseline);
    const recipe = createRecipe();
    recipe.overrides = [
      {
        id: 'n.black.v2',
        seedHex: '#21242d',
        policies: { light: 'source-exact', dark: 'source-exact' }
      }
    ];
    const extended = generateKiskadeeTonalSystem(recipe);
    expectResolved(extended);

    expect(
      extended.families
        .filter((family) => family.id !== 'n.black.v2')
        .map((family) => ({
          id: family.id,
          light: family.themes.light.scale,
          dark: family.themes.dark.scale
        }))
    ).toEqual(
      baseline.families.map((family) => ({
        id: family.id,
        light: family.themes.light.scale,
        dark: family.themes.dark.scale
      }))
    );
    expect(resolveFamily(extended, 'n.black.v1').themes.light.tintedAchromaticChroma).toBeNull();
    expect(resolveFamily(extended, 'n.black.v1').themes.dark.tintedAchromaticChroma).toBeNull();
  }, 15_000);

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
