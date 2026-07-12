import { describe, expect, it } from 'vitest';

import {
  createTonalFamilyId,
  DEFAULT_TONAL_SYSTEM_RECIPE,
  lockTonalSystemRecipe,
  parseTonalFamilyId,
  resolveTonalFamilyKind,
  TONAL_GRID_CONTRACT,
  TONAL_HARMONY_CONTRACT,
  TONAL_SYSTEM_FORMAT_VERSION,
  type TonalFamilyId,
  type TonalSystemRecipeV1,
  validateTonalSystemRecipe
} from './tonal-system-contract';

function createRecipe(): TonalSystemRecipeV1 {
  return structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE) as TonalSystemRecipeV1;
}

function issueCodes(input: unknown, options?: { allowAutoRest?: boolean }): string[] {
  const result = validateTonalSystemRecipe(input, options);
  return result.valid ? [] : result.issues.map((issue) => issue.code);
}

describe('tonal-system contract', () => {
  it('normalizes seeds, policies, and family order without changing primitive identities', () => {
    const recipe = createRecipe();
    recipe.families = [
      { id: 'yellow.v2', seedHex: 'FFB900', policies: { light: 'harmonized', dark: 'adaptive' } },
      {
        id: 'blue.v1',
        seedHex: '#0F6CBD',
        policies: { light: 'source-exact', dark: 'source-exact' }
      },
      { id: 'red.v1', seedHex: '#D13438', policies: { light: 'harmonized', dark: 'harmonized' } }
    ];

    const result = validateTonalSystemRecipe(recipe);

    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.value.families.map(({ id, seedHex }) => ({ id, seedHex }))).toEqual([
      { id: 'blue.v1', seedHex: '#0f6cbd' },
      { id: 'red.v1', seedHex: '#d13438' },
      { id: 'yellow.v2', seedHex: '#ffb900' }
    ]);
    expect(createTonalFamilyId('black', 'v2')).toBe('black.v2');
    expect(parseTonalFamilyId('black.v2')).toEqual({ hue: 'black', variant: 'v2' });
    expect(resolveTonalFamilyKind('black.v2')).toBe('neutral');
    expect(resolveTonalFamilyKind('blue.v1')).toBe('chromatic');
  });

  it.each([
    ['formatVersion', 2, 'UNSUPPORTED_FORMAT'],
    ['gridContract', 'legacy-grid', 'UNSUPPORTED_GRID'],
    ['harmonyContract', 'legacy-harmony', 'UNSUPPORTED_HARMONY'],
    ['tonalProfile', 'unknown-profile', 'UNSUPPORTED_PROFILE']
  ])('rejects unsupported %s', (property, value, expectedCode) => {
    const recipe = createRecipe() as unknown as Record<string, unknown>;
    recipe[property] = value;
    expect(issueCodes(recipe)).toContain(expectedCode);
  });

  it('strictly rejects unknown properties at every contract layer', () => {
    const recipe = createRecipe() as TonalSystemRecipeV1 & Record<string, unknown>;
    recipe.extra = true;
    (recipe.tonalAnchors as unknown as Record<string, unknown>).extra = true;
    (recipe.tonalAnchors.rest as unknown as Record<string, unknown>).extra = true;
    (recipe.families[0] as unknown as Record<string, unknown>).extra = true;
    (recipe.families[0].policies as unknown as Record<string, unknown>).extra = true;

    const result = validateTonalSystemRecipe(recipe);

    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.issues.filter((issue) => issue.code === 'UNKNOWN_PROPERTY')).toHaveLength(5);
  });

  it('requires explicit supported policies for each family and theme', () => {
    const missing = createRecipe();
    delete (missing.families[0] as Partial<(typeof missing.families)[number]>).policies;
    expect(issueCodes(missing)).toContain('INVALID_FAMILY_POLICIES');

    const unsupported = createRecipe();
    unsupported.families[1].policies.dark = 'unknown' as 'adaptive';
    expect(issueCodes(unsupported)).toContain('UNSUPPORTED_THEME_POLICY');
  });

  it('keeps black as author-defined neutral intent but not as a chromatic primary', () => {
    const neutral = createRecipe();
    neutral.primaryReference = 'black.v1';
    expect(issueCodes(neutral)).toContain('NEUTRAL_PRIMARY_UNSUPPORTED');

    const harmonized = createRecipe();
    const black = harmonized.families.find((family) => family.id === 'black.v1');
    if (!black) throw new Error('Default neutral family is required.');
    black.policies.dark = 'harmonized';
    expect(issueCodes(harmonized)).toContain('NEUTRAL_HARMONIZATION_UNSUPPORTED');
  });

  it('restricts primary Light to source-exact and primary Dark to source-exact or adaptive', () => {
    const light = createRecipe();
    light.families.find((family) => family.id === light.primaryReference)!.policies.light =
      'adaptive';
    expect(issueCodes(light)).toContain('UNSUPPORTED_PRIMARY_LIGHT_POLICY');

    const dark = createRecipe();
    dark.families.find((family) => family.id === dark.primaryReference)!.policies.dark =
      'harmonized';
    expect(issueCodes(dark)).toContain('UNSUPPORTED_PRIMARY_DARK_POLICY');
  });

  it('rejects duplicate ids and missing primary references', () => {
    const duplicate = createRecipe();
    duplicate.families.push(structuredClone(duplicate.families[0]));
    expect(issueCodes(duplicate)).toContain('DUPLICATE_FAMILY_ID');

    const missing = createRecipe();
    missing.primaryReference = 'cyan.v4' as TonalFamilyId;
    expect(issueCodes(missing)).toContain('PRIMARY_NOT_FOUND');
  });

  it('allows auto rest for generation but requires locked positions for export', () => {
    const recipe = createRecipe();
    expect(validateTonalSystemRecipe(recipe).valid).toBe(true);
    expect(issueCodes(recipe, { allowAutoRest: false })).toContain('AUTO_REST_NOT_EXPORTABLE');

    const locked = lockTonalSystemRecipe(recipe, { light: 45, dark: 45 });
    expect(validateTonalSystemRecipe(locked, { allowAutoRest: false }).valid).toBe(true);
  });

  it('accepts every non-cap public rest position and preserves versioned contracts', () => {
    const recipe = createRecipe();
    recipe.tonalAnchors.rest = { mode: 'locked', light: 1, dark: 99 };
    const result = validateTonalSystemRecipe(recipe, { allowAutoRest: false });
    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.value).toMatchObject({
      formatVersion: TONAL_SYSTEM_FORMAT_VERSION,
      gridContract: TONAL_GRID_CONTRACT,
      harmonyContract: TONAL_HARMONY_CONTRACT
    });
  });

  it.each([0, 100])('rejects absolute cap K%s as a shared rest position', (tone) => {
    const recipe = createRecipe();
    recipe.tonalAnchors.rest = {
      mode: 'locked',
      light: tone,
      dark: 45
    } as TonalSystemRecipeV1['tonalAnchors']['rest'];

    expect(issueCodes(recipe)).toContain('INVALID_REST_TONE');
  });
});
