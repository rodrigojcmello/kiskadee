import { describe, expect, it } from 'vitest';

import {
  createTonalFamilyId,
  DEFAULT_TONAL_SYSTEM_RECIPE,
  type LockedTonalSystemSourceV3,
  lockTonalSystemRecipe,
  MUNSELL_SECTORS,
  parseTonalFamilyId,
  resolveTonalFamilyColorKind,
  TONAL_CORE_FAMILY_IDS,
  TONAL_GRID_CONTRACT,
  TONAL_HARMONY_CONTRACT,
  TONAL_SYSTEM_FORMAT_VERSION,
  type TonalSystemRecipeV3,
  validateLockedTonalSystemSource,
  validateTonalSystemRecipe
} from './tonal-system-contract';

function createRecipe(): TonalSystemRecipeV3 {
  return structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE) as TonalSystemRecipeV3;
}

function issueCodes(
  input: unknown,
  validator:
    | typeof validateTonalSystemRecipe
    | typeof validateLockedTonalSystemSource = validateTonalSystemRecipe
): string[] {
  const result = validator(input);
  return result.valid ? [] : result.issues.map((issue) => issue.code);
}

describe('tonal-system contract v3', () => {
  it('defines the complete Munsell taxonomy and twelve mandatory generated ids', () => {
    expect(TONAL_SYSTEM_FORMAT_VERSION).toBe(3);
    expect(TONAL_HARMONY_CONTRACT).toBe('kiskadee-munsell-rest-v1');
    expect(MUNSELL_SECTORS).toEqual([
      'red',
      'yellow-red',
      'yellow',
      'green-yellow',
      'green',
      'blue-green',
      'blue',
      'purple-blue',
      'purple',
      'red-purple'
    ]);
    expect(TONAL_CORE_FAMILY_IDS).toEqual([
      'r.red.v1',
      'yr.orange.v1',
      'yr.brown.v1',
      'y.yellow.v1',
      'gy.lime.v1',
      'g.green.v1',
      'bg.teal.v1',
      'b.blue.v1',
      'pb.indigo.v1',
      'p.purple.v1',
      'rp.magenta.v1',
      'n.black.v1'
    ]);
  });

  it('parses sector, appearance, variant, and achromatic black without ambiguity', () => {
    expect(createTonalFamilyId('yr.brown', 'v2')).toBe('yr.brown.v2');
    expect(parseTonalFamilyId('yr.brown.v2')).toEqual({
      stem: 'yr.brown',
      appearance: 'brown',
      sector: 'yellow-red',
      sectorCode: 'yr',
      munsellSector: 'YR',
      colorKind: 'chromatic',
      variant: 'v2'
    });
    expect(parseTonalFamilyId('n.black.v4')).toEqual({
      stem: 'n.black',
      appearance: 'black',
      sector: null,
      sectorCode: 'n',
      munsellSector: 'N',
      colorKind: 'achromatic',
      variant: 'v4'
    });
    expect(parseTonalFamilyId('orange.v1')).toBeNull();
    expect(parseTonalFamilyId('b.blue.v5')).toBeNull();
    expect(resolveTonalFamilyColorKind('n.black.v2')).toBe('achromatic');
    expect(resolveTonalFamilyColorKind('pb.indigo.v3')).toBe('chromatic');
  });

  it('normalizes primary and override seeds and orders overrides deterministically', () => {
    const recipe = createRecipe();
    recipe.primary.seedHex = '0F6CBD';
    recipe.primary.variant = 'v1';
    recipe.overrides = [
      {
        id: 'yr.brown.v1',
        seedHex: '8E562E',
        policies: { light: 'harmonized', dark: 'adaptive' }
      },
      {
        id: 'n.black.v2',
        seedHex: '#334455',
        policies: { light: 'source-exact', dark: 'adaptive' }
      },
      {
        id: 'rp.magenta.v4',
        seedHex: '#E3008C',
        policies: { light: 'harmonized', dark: 'harmonized' }
      }
    ];

    const result = validateTonalSystemRecipe(recipe);

    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.value.primary).toMatchObject({ seedHex: '#0f6cbd', variant: 'v1' });
    expect(result.value.overrides.map(({ id, seedHex }) => ({ id, seedHex }))).toEqual([
      { id: 'n.black.v2', seedHex: '#334455' },
      { id: 'rp.magenta.v4', seedHex: '#e3008c' },
      { id: 'yr.brown.v1', seedHex: '#8e562e' }
    ]);
  });

  it('normalizes sparse family state anchors and removes redundant auto rules', () => {
    const recipe = createRecipe();
    recipe.tonalAnchors.states = [
      {
        id: 'yr.orange.v1',
        light: { mode: 'locked', tone: 24 },
        dark: { mode: 'harmony-rest' }
      },
      {
        id: 'g.green.v1',
        light: { mode: 'auto' },
        dark: { mode: 'auto' }
      },
      {
        id: 'b.blue.v1',
        light: { mode: 'generated-anchor' },
        dark: { mode: 'auto' }
      }
    ];

    const result = validateTonalSystemRecipe(recipe);

    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.value.tonalAnchors.states).toEqual([
      {
        id: 'b.blue.v1',
        light: { mode: 'generated-anchor' },
        dark: { mode: 'auto' }
      },
      {
        id: 'yr.orange.v1',
        light: { mode: 'locked', tone: 24 },
        dark: { mode: 'harmony-rest' }
      }
    ]);

    const recipeWithoutStates = createRecipe();
    delete recipeWithoutStates.tonalAnchors.states;
    const absentResult = validateTonalSystemRecipe(recipeWithoutStates);
    expect(absentResult.valid).toBe(true);
    if (!absentResult.valid) return;
    expect(absentResult.value.tonalAnchors.states).toEqual([]);
  });

  it('rejects format 1 recipes explicitly instead of migrating old families', () => {
    const legacy = {
      formatVersion: 1,
      gridContract: TONAL_GRID_CONTRACT,
      harmonyContract: 'kiskadee-rest-v1',
      tonalProfile: 'balanced',
      primaryReference: 'blue.v1',
      tonalAnchors: { rest: { mode: 'auto' } },
      families: [
        {
          id: 'blue.v1',
          seedHex: '#0f6cbd',
          policies: { light: 'source-exact', dark: 'source-exact' }
        }
      ]
    };

    const result = validateTonalSystemRecipe(legacy);

    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.value).toBeNull();
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'UNSUPPORTED_FORMAT', path: '/formatVersion' }),
        expect.objectContaining({ code: 'UNKNOWN_PROPERTY', path: '/families' }),
        expect.objectContaining({ code: 'UNKNOWN_PROPERTY', path: '/primaryReference' })
      ])
    );
    expect(result.issues.find((issue) => issue.code === 'UNSUPPORTED_FORMAT')?.message).toContain(
      'not migrated automatically'
    );
  });

  it.each([
    ['formatVersion', 4, 'UNSUPPORTED_FORMAT'],
    ['gridContract', 'legacy-grid', 'UNSUPPORTED_GRID'],
    ['harmonyContract', 'legacy-harmony', 'UNSUPPORTED_HARMONY'],
    ['tonalProfile', 'unknown-profile', 'UNSUPPORTED_PROFILE']
  ])('rejects unsupported %s', (property, value, expectedCode) => {
    const recipe = createRecipe() as unknown as Record<string, unknown>;
    recipe[property] = value;
    expect(issueCodes(recipe)).toContain(expectedCode);
  });

  it('strictly rejects unknown properties at every draft contract layer', () => {
    const recipe = createRecipe() as TonalSystemRecipeV3 & Record<string, unknown>;
    recipe.extra = true;
    (recipe.primary as unknown as Record<string, unknown>).extra = true;
    (recipe.primary.policies as unknown as Record<string, unknown>).extra = true;
    (recipe.tonalAnchors as unknown as Record<string, unknown>).extra = true;
    (recipe.tonalAnchors.rest as unknown as Record<string, unknown>).extra = true;
    recipe.overrides.push({
      id: 'r.red.v1',
      seedHex: '#d13438',
      policies: { light: 'harmonized', dark: 'harmonized' }
    });
    (recipe.overrides[0] as unknown as Record<string, unknown>).extra = true;
    (recipe.overrides[0].policies as unknown as Record<string, unknown>).extra = true;

    const result = validateTonalSystemRecipe(recipe);

    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.issues.filter((issue) => issue.code === 'UNKNOWN_PROPERTY')).toHaveLength(7);
  });

  it('strictly validates state anchor entries, rules, duplicates, and locked tones', () => {
    const recipe = createRecipe() as unknown as Record<string, unknown>;
    const tonalAnchors = recipe.tonalAnchors as Record<string, unknown>;
    tonalAnchors.states = [
      {
        id: 'b.blue.v1',
        light: { mode: 'generated-anchor', tone: 45 },
        dark: { mode: 'locked', tone: 11, extra: true }
      },
      {
        id: 'b.blue.v1',
        light: null,
        dark: { mode: 'source-exact' }
      },
      {
        id: 'g.green.v1',
        light: { mode: 'auto' },
        dark: { mode: 'auto' },
        extra: true
      }
    ];

    const result = validateTonalSystemRecipe(recipe);

    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'UNKNOWN_PROPERTY',
          path: '/tonalAnchors/states/0/light/tone'
        }),
        expect.objectContaining({
          code: 'UNKNOWN_PROPERTY',
          path: '/tonalAnchors/states/0/dark/extra'
        }),
        expect.objectContaining({
          code: 'INVALID_STATE_ANCHOR_TONE',
          path: '/tonalAnchors/states/0/dark/tone'
        }),
        expect.objectContaining({
          code: 'DUPLICATE_STATE_ANCHOR_ID',
          path: '/tonalAnchors/states/1/id'
        }),
        expect.objectContaining({
          code: 'INVALID_STATE_ANCHOR_RULE',
          path: '/tonalAnchors/states/1/light'
        }),
        expect.objectContaining({
          code: 'INVALID_STATE_ANCHOR_MODE',
          path: '/tonalAnchors/states/1/dark/mode'
        }),
        expect.objectContaining({
          code: 'UNKNOWN_PROPERTY',
          path: '/tonalAnchors/states/2/extra'
        })
      ])
    );

    for (const tone of [0, 100] as const) {
      const invalidTone = createRecipe();
      invalidTone.tonalAnchors.states = [
        {
          id: 'r.red.v1',
          light: { mode: 'locked', tone } as never,
          dark: { mode: 'auto' }
        }
      ];
      expect(issueCodes(invalidTone)).toContain('INVALID_STATE_ANCHOR_TONE');
    }

    const invalidCollection = createRecipe() as unknown as Record<string, unknown>;
    (invalidCollection.tonalAnchors as Record<string, unknown>).states = {};
    expect(issueCodes(invalidCollection)).toContain('INVALID_STATE_ANCHORS');
  });

  it('restricts primary policies, appearances, and variants', () => {
    const light = createRecipe();
    light.primary.policies.light = 'adaptive' as 'source-exact';
    expect(issueCodes(light)).toContain('UNSUPPORTED_PRIMARY_LIGHT_POLICY');

    const dark = createRecipe();
    dark.primary.policies.dark = 'harmonized' as 'adaptive';
    expect(issueCodes(dark)).toContain('UNSUPPORTED_PRIMARY_DARK_POLICY');

    const variant = createRecipe();
    variant.primary.variant = 'v5' as 'v1';
    expect(issueCodes(variant)).toContain('INVALID_PRIMARY_VARIANT');

    const appearance = createRecipe();
    appearance.primary.appearance = 'cyan' as 'auto';
    expect(issueCodes(appearance)).toContain('INVALID_PRIMARY_APPEARANCE');
  });

  it('rejects duplicate overrides, legacy ids, and chromatic harmonization for black', () => {
    const duplicate = createRecipe();
    duplicate.overrides = [
      {
        id: 'bg.teal.v1',
        seedHex: '#008899',
        policies: { light: 'adaptive', dark: 'adaptive' }
      },
      {
        id: 'bg.teal.v1',
        seedHex: '#0099aa',
        policies: { light: 'adaptive', dark: 'adaptive' }
      }
    ];
    expect(issueCodes(duplicate)).toContain('DUPLICATE_OVERRIDE_ID');

    const legacy = createRecipe();
    legacy.overrides = [
      {
        id: 'cyan.v1' as 'bg.teal.v1',
        seedHex: '#00bcd4',
        policies: { light: 'adaptive', dark: 'adaptive' }
      }
    ];
    expect(issueCodes(legacy)).toContain('INVALID_FAMILY_ID');

    const black = createRecipe();
    black.overrides = [
      {
        id: 'n.black.v1',
        seedHex: '#20252b',
        policies: { light: 'source-exact', dark: 'harmonized' }
      }
    ];
    expect(issueCodes(black)).toContain('ACHROMATIC_HARMONIZATION_UNSUPPORTED');
  });

  it('locks the resolved primary id and rest positions for export', () => {
    const recipe = createRecipe();
    recipe.primary.seedHex = '#1da1f2';
    recipe.tonalAnchors.states = [
      {
        id: 'b.blue.v1',
        light: { mode: 'locked', tone: 24 },
        dark: { mode: 'generated-anchor' }
      }
    ];
    const locked = lockTonalSystemRecipe(recipe, 'b.blue.v1', { light: 24, dark: 70 });

    expect(locked).toMatchObject({
      primary: {
        id: 'b.blue.v1',
        seedHex: '#1da1f2',
        policies: { light: 'source-exact', dark: 'source-exact' }
      },
      tonalAnchors: {
        rest: { mode: 'locked', light: 24, dark: 70 },
        states: [
          {
            id: 'b.blue.v1',
            light: { mode: 'locked', tone: 24 },
            dark: { mode: 'generated-anchor' }
          }
        ]
      }
    });
    recipe.tonalAnchors.states[0].light = { mode: 'auto' };
    expect(locked.tonalAnchors.states?.[0].light).toEqual({ mode: 'locked', tone: 24 });
    expect(validateLockedTonalSystemSource(locked).valid).toBe(true);
    expect(issueCodes(recipe, validateLockedTonalSystemSource)).toContain(
      'AUTO_REST_NOT_EXPORTABLE'
    );
  });

  it('rejects achromatic primary locks, variant drift, and primary override conflicts', () => {
    const recipe = createRecipe();
    expect(() => lockTonalSystemRecipe(recipe, 'n.black.v1', { light: 45, dark: 45 })).toThrow(
      'chromatic Munsell family'
    );

    recipe.primary.variant = 'v2';
    expect(() => lockTonalSystemRecipe(recipe, 'b.blue.v1', { light: 45, dark: 45 })).toThrow(
      'explicit primary variant'
    );

    recipe.primary.variant = 'v1';
    recipe.overrides = [
      {
        id: 'b.blue.v1',
        seedHex: '#0066aa',
        policies: { light: 'harmonized', dark: 'harmonized' }
      }
    ];
    expect(() => lockTonalSystemRecipe(recipe, 'b.blue.v1', { light: 45, dark: 45 })).toThrow(
      'PRIMARY_OVERRIDE_CONFLICT'
    );

    recipe.overrides = [];
    const locked = lockTonalSystemRecipe(recipe, 'b.blue.v1', { light: 45, dark: 45 });
    locked.overrides.push({
      id: 'b.blue.v1',
      seedHex: '#0066aa',
      policies: { light: 'harmonized', dark: 'harmonized' }
    });
    expect(issueCodes(locked, validateLockedTonalSystemSource)).toContain(
      'PRIMARY_OVERRIDE_CONFLICT'
    );

    const blackPrimary = structuredClone(locked) as LockedTonalSystemSourceV3;
    blackPrimary.primary.id = 'n.black.v1';
    expect(issueCodes(blackPrimary, validateLockedTonalSystemSource)).toContain(
      'ACHROMATIC_PRIMARY_UNSUPPORTED'
    );
  });

  it('accepts locked rest positions from 1 through 99 and rejects absolute caps', () => {
    const recipe = createRecipe();
    recipe.tonalAnchors.rest = { mode: 'locked', light: 1, dark: 99 };
    expect(validateTonalSystemRecipe(recipe).valid).toBe(true);

    for (const tone of [0, 100] as const) {
      const invalid = createRecipe();
      invalid.tonalAnchors.rest = {
        mode: 'locked',
        light: tone,
        dark: 45
      } as TonalSystemRecipeV3['tonalAnchors']['rest'];
      expect(issueCodes(invalid)).toContain('INVALID_REST_TONE');
    }
  });
});
