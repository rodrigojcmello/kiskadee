import { describe, expect, it } from 'vitest';

import { generateKiskadeeScale, KISKADEE_TONES } from './kiskadee-tonal-scale';
import {
  generateKiskadeeTonalSystem,
  type KiskadeeTonalSystemResult,
  type ResolvedKiskadeeTonalSystem
} from './tonal-system';
import {
  DEFAULT_TONAL_SYSTEM_RECIPE,
  type TonalFamilyId,
  type TonalFamilySourceV1,
  type TonalSystemRecipeV1
} from './tonal-system-contract';

function family(
  id: TonalFamilyId,
  seedHex: string,
  policies: TonalFamilySourceV1['policies'] = { light: 'harmonized', dark: 'harmonized' }
): TonalFamilySourceV1 {
  return { id, seedHex, policies };
}

function primary(id: TonalFamilyId = 'blue.v1', seedHex = '#0f6cbd'): TonalFamilySourceV1 {
  return family(id, seedHex, { light: 'source-exact', dark: 'source-exact' });
}

function createRecipe(): TonalSystemRecipeV1 {
  return structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE) as TonalSystemRecipeV1;
}

function primaryOnly(profile: TonalSystemRecipeV1['tonalProfile'] = 'balanced') {
  const recipe = createRecipe();
  recipe.tonalProfile = profile;
  recipe.families = [primary()];
  return recipe;
}

function expectResolved(
  result: KiskadeeTonalSystemResult
): asserts result is ResolvedKiskadeeTonalSystem {
  expect(result.valid, JSON.stringify(result.issues, null, 2)).toBe(true);
}

function resolveFamily(result: ResolvedKiskadeeTonalSystem, id: TonalFamilyId) {
  const resolved = result.families.find((candidate) => candidate.id === id);
  if (!resolved) throw new Error(`${id} was not resolved.`);
  return resolved;
}

describe('generateKiskadeeTonalSystem', () => {
  it.each([
    'balanced',
    'muted-darks'
  ] as const)('keeps the canonical primary-only %s scales byte-for-byte unchanged', (tonalProfile) => {
    const result = generateKiskadeeTonalSystem(primaryOnly(tonalProfile));
    expectResolved(result);
    const resolved = resolveFamily(result, 'blue.v1');
    expect(resolved.themes.light.scale).toEqual(
      generateKiskadeeScale({ seedHex: '#0f6cbd', theme: 'light', profile: tonalProfile })
    );
    expect(resolved.themes.dark.scale).toEqual(
      generateKiskadeeScale({ seedHex: '#0f6cbd', theme: 'dark', profile: tonalProfile })
    );
    expect(resolved.themes.light.policy).toBe('source-exact');
    expect(resolved.themes.dark.policy).toBe('source-exact');
  });

  it('keeps the Fluent reference at L45 and D45', () => {
    const result = generateKiskadeeTonalSystem(primaryOnly());
    expectResolved(result);
    expect(result.rest).toEqual({ light: 45, dark: 45, source: 'auto-proposal' });
    expect(result.primaryReference.light).toMatchObject({ tone: 45, hex: '#0f6cbd' });
    expect(result.primaryReference.dark).toMatchObject({ tone: 45, hex: '#0f6cbd' });
  });

  it('lets an adaptive primary Dark choose and honor a shared rest position', () => {
    const recipe = primaryOnly();
    recipe.families[0] = primary('blue.v1', '#004080');
    recipe.families[0].policies.dark = 'adaptive';
    const automatic = generateKiskadeeTonalSystem(recipe);
    expectResolved(automatic);
    expect(automatic.rest).toEqual({ light: 70, dark: 22, source: 'auto-proposal' });

    recipe.families[0] = primary();
    recipe.families[0].policies.dark = 'adaptive';
    recipe.tonalAnchors.rest = { mode: 'locked', light: 45, dark: 50 };
    const locked = generateKiskadeeTonalSystem(recipe);
    expectResolved(locked);
    const dark = resolveFamily(locked, 'blue.v1').themes.dark;
    expect(dark).toMatchObject({ policy: 'adaptive', restTone: 50, sourceSeedPreserved: false });
    expect(dark.scale.anchorTone).toBe(50);
  });

  it('harmonizes chromatic supports against the same Light and Dark rest positions', () => {
    const recipe = primaryOnly();
    recipe.families.push(
      family('green.v1', '#107c10'),
      family('yellow.v1', '#ffb900'),
      family('red.v1', '#d13438'),
      family('purple.v1', '#8764b8'),
      family('cyan.v1', '#00b7c3')
    );
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);

    for (const resolved of result.families.filter((candidate) => candidate.role === 'support')) {
      expect(resolved.kind).toBe('chromatic');
      for (const theme of ['light', 'dark'] as const) {
        const output = resolved.themes[theme];
        expect(output.policy).toBe('harmonized');
        expect(output.restTone).toBe(result.rest[theme]);
        expect(output.scale.anchorTone).toBe(output.restTone);
        expect(output.scale.colors.map((color) => color.tone)).toEqual(KISKADEE_TONES);
        expect(output.scale.diagnostics.valid).toBe(true);
        expect(output.scale.diagnostics.adjacentDuplicates).toEqual([]);
      }
    }
  }, 120_000);

  it('allows each chromatic support theme to choose source-exact independently', () => {
    const recipe = primaryOnly();
    recipe.families.push(
      family('yellow.v1', '#ffb900', { light: 'harmonized', dark: 'source-exact' })
    );
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);
    const yellow = resolveFamily(result, 'yellow.v1');
    expect(yellow.themes.light.policy).toBe('harmonized');
    expect(yellow.themes.dark.policy).toBe('source-exact');
    expect(yellow.themes.dark.sourceSeedPreserved).toBe(true);
    expect(
      yellow.themes.dark.scale.colors.find(
        (color) => color.tone === yellow.themes.dark.scale.anchorTone
      )?.hex
    ).toBe('#ffb900');
    expect(yellow.themes.dark.restTone).toBe(result.rest.dark);
  }, 60_000);

  it('supports tinted neutral families without treating them as chromatic harmony references', () => {
    const recipe = primaryOnly();
    recipe.families.push(
      family('black.v1', '#20252b', { light: 'source-exact', dark: 'source-exact' }),
      family('black.v2', '#26313d', { light: 'source-exact', dark: 'source-exact' })
    );
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);

    for (const id of ['black.v1', 'black.v2'] as const) {
      const neutral = resolveFamily(result, id);
      expect(neutral.kind).toBe('neutral');
      for (const theme of ['light', 'dark'] as const) {
        expect(neutral.themes[theme].sourceSeedPreserved).toBe(true);
        expect(neutral.themes[theme].harmony).toBeNull();
      }
    }
  });

  it('supports adaptive policy for a neutral family when the projection is feasible', () => {
    const recipe = primaryOnly();
    recipe.families.push(
      family('black.v1', '#40464d', { light: 'source-exact', dark: 'adaptive' })
    );
    const result = generateKiskadeeTonalSystem(recipe);
    expectResolved(result);
    const dark = resolveFamily(result, 'black.v1').themes.dark;
    expect(dark.policy).toBe('adaptive');
    expect(dark.restTone).toBe(result.rest.dark);
    expect(dark.scale.anchorTone).toBe(result.rest.dark);
  });

  it('rejects unreliable chromatic harmony seeds and excessively chromatic neutral intent', () => {
    const chromatic = primaryOnly();
    chromatic.families.push(family('brown.v1', '#808080'));
    const chromaticResult = generateKiskadeeTonalSystem(chromatic);
    expect(chromaticResult.valid).toBe(false);
    expect(chromaticResult.issues.map((issue) => issue.code)).toContain('HUE_UNRELIABLE');

    const neutral = primaryOnly();
    neutral.families.push(
      family('black.v1', '#0f6cbd', { light: 'source-exact', dark: 'source-exact' })
    );
    const neutralResult = generateKiskadeeTonalSystem(neutral);
    expect(neutralResult.valid).toBe(false);
    expect(neutralResult.issues.map((issue) => issue.code)).toContain('NEUTRAL_CHROMA_TOO_HIGH');
  });

  it('is deterministic for mixed per-theme policies', () => {
    const recipe = primaryOnly();
    recipe.families.push(
      family('cyan.v1', '#00b7c3', { light: 'adaptive', dark: 'harmonized' }),
      family('black.v1', '#20252b', { light: 'source-exact', dark: 'source-exact' })
    );
    const first = generateKiskadeeTonalSystem(recipe);
    const second = generateKiskadeeTonalSystem(structuredClone(recipe));
    expectResolved(first);
    expectResolved(second);
    expect(second).toEqual(first);
  }, 90_000);

  it('accepts the Twitter blue as the exact primary rest at L24 and D70', () => {
    const recipe = createRecipe();
    const blue = recipe.families.find((candidate) => candidate.id === 'blue.v1');
    if (!blue) throw new Error('Default blue family is required.');
    blue.seedHex = '#1DA1F2';

    const result = generateKiskadeeTonalSystem(recipe);

    expectResolved(result);
    expect(result.rest).toEqual({ light: 24, dark: 70, source: 'auto-proposal' });
    expect(result.primaryReference.light).toMatchObject({ tone: 24, hex: '#1da1f2' });
    expect(result.primaryReference.dark).toMatchObject({ tone: 70, hex: '#1da1f2' });
    expect(result.families).toHaveLength(recipe.families.length);
    for (const resolved of result.families) {
      expect(resolved.themes.light.restTone).toBe(24);
      expect(resolved.themes.dark.restTone).toBe(70);
      expect(resolved.themes.light.scale.diagnostics.valid).toBe(true);
      expect(resolved.themes.dark.scale.diagnostics.valid).toBe(true);
    }
  }, 120_000);
});
