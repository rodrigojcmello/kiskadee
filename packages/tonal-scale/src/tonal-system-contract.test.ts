import { describe, expect, it } from 'vitest';

import {
  createTonalFamilyId,
  DEFAULT_TONAL_SYSTEM_RECIPE,
  type LockedTonalFamilyFunctionalReferencesV5,
  type LockedTonalSystemSourceV5,
  lockTonalSystemRecipe,
  MUNSELL_SECTORS,
  parseTonalFamilyId,
  resolveTonalFamilyColorKind,
  TONAL_CORE_FAMILY_IDS,
  TONAL_GRID_CONTRACT,
  TONAL_HARMONY_CONTRACT,
  TONAL_SYSTEM_FORMAT_VERSION,
  type TonalFamilyId,
  type TonalSystemRecipeV5,
  validateLockedTonalSystemSource,
  validateTonalSystemRecipe
} from './tonal-system-contract';

function createRecipe(): TonalSystemRecipeV5 {
  return structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE) as TonalSystemRecipeV5;
}

function createLockedReferences(
  additionalIds: readonly TonalFamilyId[] = []
): LockedTonalFamilyFunctionalReferencesV5[] {
  return [...new Set<TonalFamilyId>([...TONAL_CORE_FAMILY_IDS, ...additionalIds])]
    .sort((left, right) => left.localeCompare(right))
    .map((id) => ({
      id,
      light: {
        vivid: { tone: 45, source: 'generated-anchor' },
        subtle: { tone: 4, source: 'surface-relative' }
      },
      dark: {
        vivid: { tone: 45, source: 'generated-anchor' },
        subtle: { tone: 4, source: 'surface-relative' }
      }
    }));
}

function createLockedSource(): LockedTonalSystemSourceV5 {
  return lockTonalSystemRecipe(
    createRecipe(),
    'b.blue.v1',
    { light: 45, dark: 45 },
    createLockedReferences()
  );
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

describe('tonal-system contract v5', () => {
  it('defines format 5 with the complete Munsell taxonomy and core family set', () => {
    expect(TONAL_SYSTEM_FORMAT_VERSION).toBe(5);
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

  it('validates the default and normalizes sparse functional-reference authoring', () => {
    const defaultResult = validateTonalSystemRecipe(createRecipe());
    expect(defaultResult.valid).toBe(true);
    if (!defaultResult.valid) return;
    expect(defaultResult.value.functionalReferences).toEqual([]);
    expect(defaultResult.value.tonalAnchors).toEqual({ rest: { mode: 'auto' } });

    const recipe = createRecipe();
    recipe.functionalReferences = [
      {
        id: 'yr.orange.v1',
        light: {
          vivid: { mode: 'generated-anchor' },
          subtle: { mode: 'reference-match', referenceHex: 'D9F1FF' }
        },
        dark: {
          vivid: { mode: 'harmony-rest' },
          subtle: { mode: 'locked', tone: 4 }
        }
      },
      {
        id: 'g.green.v1',
        light: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } },
        dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
      },
      {
        id: 'b.blue.v1',
        light: { vivid: { mode: 'locked', tone: 45 }, subtle: { mode: 'auto' } },
        dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
      }
    ];

    const result = validateTonalSystemRecipe(recipe);
    expect(result.valid).toBe(true);
    if (!result.valid) return;
    expect(result.value.functionalReferences).toEqual([
      {
        id: 'b.blue.v1',
        light: { vivid: { mode: 'locked', tone: 45 }, subtle: { mode: 'auto' } },
        dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
      },
      {
        id: 'yr.orange.v1',
        light: {
          vivid: { mode: 'generated-anchor' },
          subtle: { mode: 'reference-match', referenceHex: '#d9f1ff' }
        },
        dark: {
          vivid: { mode: 'harmony-rest' },
          subtle: { mode: 'locked', tone: 4 }
        }
      }
    ]);
  });

  it('normalizes seeds, reference targets, and collection ordering deterministically', () => {
    const recipe = createRecipe();
    recipe.primary.seedHex = '0F6CBD';
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
    expect(result.value.primary.seedHex).toBe('#0f6cbd');
    expect(result.value.overrides.map(({ id, seedHex }) => ({ id, seedHex }))).toEqual([
      { id: 'n.black.v2', seedHex: '#334455' },
      { id: 'rp.magenta.v4', seedHex: '#e3008c' },
      { id: 'yr.brown.v1', seedHex: '#8e562e' }
    ]);
  });

  it('rejects format 3 explicitly instead of interpreting state anchors', () => {
    const legacy = {
      formatVersion: 3,
      gridContract: TONAL_GRID_CONTRACT,
      harmonyContract: TONAL_HARMONY_CONTRACT,
      tonalProfile: 'balanced',
      primary: {
        seedHex: '#0f6cbd',
        appearance: 'auto',
        variant: 'v1',
        policies: { light: 'source-exact', dark: 'source-exact' }
      },
      tonalAnchors: { rest: { mode: 'auto' }, states: [] },
      overrides: []
    };

    const result = validateTonalSystemRecipe(legacy);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'UNSUPPORTED_FORMAT', path: '/formatVersion' }),
        expect.objectContaining({ code: 'UNKNOWN_PROPERTY', path: '/tonalAnchors/states' }),
        expect.objectContaining({
          code: 'INVALID_FUNCTIONAL_REFERENCES',
          path: '/functionalReferences'
        })
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
    const recipe = createRecipe() as TonalSystemRecipeV5 & Record<string, unknown>;
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
    recipe.functionalReferences.push({
      id: 'b.blue.v1',
      light: {
        vivid: { mode: 'generated-anchor' },
        subtle: { mode: 'reference-match', referenceHex: '#d9f1ff' }
      },
      dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
    });
    const family = recipe.functionalReferences[0] as unknown as Record<string, unknown>;
    family.extra = true;
    const light = family.light as Record<string, unknown>;
    light.extra = true;
    (light.vivid as Record<string, unknown>).extra = true;
    (light.subtle as Record<string, unknown>).extra = true;

    const result = validateTonalSystemRecipe(recipe);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'UNKNOWN_PROPERTY', path: '/extra' }),
        expect.objectContaining({
          code: 'UNKNOWN_PROPERTY',
          path: '/functionalReferences/0/extra'
        }),
        expect.objectContaining({
          code: 'UNKNOWN_PROPERTY',
          path: '/functionalReferences/0/light/extra'
        }),
        expect.objectContaining({
          code: 'UNKNOWN_PROPERTY',
          path: '/functionalReferences/0/light/vivid/extra'
        }),
        expect.objectContaining({
          code: 'UNKNOWN_PROPERTY',
          path: '/functionalReferences/0/light/subtle/extra'
        })
      ])
    );
  });

  it('strictly validates functional-reference modes, keys, targets, tones, and duplicates', () => {
    const recipe = createRecipe() as unknown as Record<string, unknown>;
    recipe.functionalReferences = [
      {
        id: 'b.blue.v1',
        light: {
          vivid: { mode: 'generated-anchor', tone: 45 },
          subtle: { mode: 'reference-match', referenceHex: '#11223344' }
        },
        dark: {
          vivid: { mode: 'locked', tone: 11, extra: true },
          subtle: { mode: 'harmony-rest' }
        }
      },
      {
        id: 'b.blue.v1',
        light: { vivid: null, subtle: { mode: 'auto' } },
        dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
      },
      {
        id: 'g.green.v1',
        light: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } },
        dark: { vivid: { mode: 'source-exact' }, subtle: { mode: 'auto' } },
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
          path: '/functionalReferences/0/light/vivid/tone'
        }),
        expect.objectContaining({
          code: 'INVALID_FUNCTIONAL_REFERENCE_HEX',
          path: '/functionalReferences/0/light/subtle/referenceHex'
        }),
        expect.objectContaining({
          code: 'INVALID_FUNCTIONAL_REFERENCE_TONE',
          path: '/functionalReferences/0/dark/vivid/tone'
        }),
        expect.objectContaining({
          code: 'UNKNOWN_PROPERTY',
          path: '/functionalReferences/0/dark/vivid/extra'
        }),
        expect.objectContaining({
          code: 'INVALID_SUBTLE_REFERENCE_MODE',
          path: '/functionalReferences/0/dark/subtle/mode'
        }),
        expect.objectContaining({
          code: 'DUPLICATE_FUNCTIONAL_REFERENCE_ID',
          path: '/functionalReferences/1/id'
        }),
        expect.objectContaining({
          code: 'INVALID_VIVID_REFERENCE_RULE',
          path: '/functionalReferences/1/light/vivid'
        }),
        expect.objectContaining({
          code: 'UNKNOWN_PROPERTY',
          path: '/functionalReferences/2/extra'
        }),
        expect.objectContaining({
          code: 'INVALID_VIVID_REFERENCE_MODE',
          path: '/functionalReferences/2/dark/vivid/mode'
        })
      ])
    );

    const invalidCollection = createRecipe() as unknown as Record<string, unknown>;
    invalidCollection.functionalReferences = {};
    expect(issueCodes(invalidCollection)).toContain('INVALID_FUNCTIONAL_REFERENCES');

    for (const tone of [0, 100] as const) {
      const invalidTone = createRecipe();
      invalidTone.functionalReferences = [
        {
          id: 'r.red.v1',
          light: {
            vivid: { mode: 'locked', tone } as never,
            subtle: { mode: 'auto' }
          },
          dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
        }
      ];
      expect(issueCodes(invalidTone)).toContain('INVALID_FUNCTIONAL_REFERENCE_TONE');
    }
  });

  it('restricts primary and override policies, ids, appearances, and variants', () => {
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
    expect(issueCodes(black)).toEqual(
      expect.arrayContaining([
        'CANONICAL_BLACK_OVERRIDE_UNSUPPORTED',
        'ACHROMATIC_HARMONIZATION_UNSUPPORTED'
      ])
    );

    const tintedNeutral = createRecipe();
    tintedNeutral.overrides = [
      {
        id: 'n.black.v2',
        seedHex: '#20252b',
        policies: { light: 'source-exact', dark: 'adaptive' }
      }
    ];
    expect(issueCodes(tintedNeutral)).toEqual([]);
  });

  it('locks complete resolved functional references and round-trips them deterministically', () => {
    const recipe = createRecipe();
    recipe.primary.seedHex = '#1da1f2';
    recipe.functionalReferences = [
      {
        id: 'b.blue.v1',
        light: {
          vivid: { mode: 'generated-anchor' },
          subtle: { mode: 'reference-match', referenceHex: '#d9f1ff' }
        },
        dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
      }
    ];
    const references = createLockedReferences();
    const blue = references.find((entry) => entry.id === 'b.blue.v1');
    if (!blue) throw new Error('Missing Blue fixture.');
    blue.light.subtle = { tone: 4, source: 'reference-match', referenceHex: 'D9F1FF' };

    const locked = lockTonalSystemRecipe(recipe, 'b.blue.v1', { light: 24, dark: 70 }, references);

    expect(locked).toMatchObject({
      formatVersion: 5,
      primary: {
        id: 'b.blue.v1',
        seedHex: '#1da1f2',
        policies: { light: 'source-exact', dark: 'source-exact' }
      },
      tonalAnchors: { rest: { mode: 'locked', light: 24, dark: 70 } }
    });
    expect(locked.functionalReferences).toHaveLength(TONAL_CORE_FAMILY_IDS.length);
    expect(locked.functionalReferences.map((entry) => entry.id)).toEqual(
      [...TONAL_CORE_FAMILY_IDS].sort()
    );
    expect(
      locked.functionalReferences.find((entry) => entry.id === 'b.blue.v1')?.light.subtle
    ).toEqual({ tone: 4, source: 'reference-match', referenceHex: '#d9f1ff' });

    blue.light.subtle = { tone: 3, source: 'surface-relative' };
    recipe.functionalReferences[0].light.subtle = { mode: 'auto' };
    expect(
      locked.functionalReferences.find((entry) => entry.id === 'b.blue.v1')?.light.subtle
    ).toEqual({ tone: 4, source: 'reference-match', referenceHex: '#d9f1ff' });

    const validation = validateLockedTonalSystemSource(structuredClone(locked));
    expect(validation.valid).toBe(true);
    if (!validation.valid) return;
    expect(validation.value).toEqual(locked);
  });

  it('requires locked references for every materialized core and extra family', () => {
    const missing = createLockedSource();
    missing.functionalReferences.pop();
    expect(issueCodes(missing, validateLockedTonalSystemSource)).toContain(
      'MISSING_LOCKED_FUNCTIONAL_REFERENCE'
    );

    const extra = createLockedSource();
    extra.functionalReferences.push(
      createLockedReferences(['b.blue.v2']).find((entry) => entry.id === 'b.blue.v2')!
    );
    expect(issueCodes(extra, validateLockedTonalSystemSource)).toContain(
      'UNKNOWN_LOCKED_FUNCTIONAL_REFERENCE_FAMILY'
    );

    const duplicate = createLockedSource();
    duplicate.functionalReferences.push(structuredClone(duplicate.functionalReferences[0]));
    expect(issueCodes(duplicate, validateLockedTonalSystemSource)).toContain(
      'DUPLICATE_FUNCTIONAL_REFERENCE_ID'
    );

    const recipeWithExtra = createRecipe();
    recipeWithExtra.overrides.push({
      id: 'b.blue.v2',
      seedHex: '#0057b8',
      policies: { light: 'source-exact', dark: 'source-exact' }
    });
    const withExtra = lockTonalSystemRecipe(
      recipeWithExtra,
      'b.blue.v1',
      { light: 45, dark: 45 },
      createLockedReferences(['b.blue.v2'])
    );
    expect(validateLockedTonalSystemSource(withExtra).valid).toBe(true);

    const extraPrimaryRecipe = createRecipe();
    extraPrimaryRecipe.primary.variant = 'v2';
    const extraPrimary = lockTonalSystemRecipe(
      extraPrimaryRecipe,
      'b.blue.v2',
      { light: 45, dark: 45 },
      createLockedReferences(['b.blue.v2'])
    );
    expect(validateLockedTonalSystemSource(extraPrimary).valid).toBe(true);
  });

  it('enforces subtle before vivid while preserving the tone-1 physical fallback', () => {
    const equality = createLockedSource();
    const blueEquality = equality.functionalReferences.find((entry) => entry.id === 'b.blue.v1')!;
    blueEquality.light.subtle = { tone: 45, source: 'surface-relative' };
    expect(issueCodes(equality, validateLockedTonalSystemSource)).toContain(
      'INVALID_FUNCTIONAL_REFERENCE_ORDER'
    );

    const inversion = createLockedSource();
    const blueInversion = inversion.functionalReferences.find((entry) => entry.id === 'b.blue.v1')!;
    blueInversion.dark.subtle = { tone: 50, source: 'surface-relative' };
    expect(issueCodes(inversion, validateLockedTonalSystemSource)).toContain(
      'INVALID_FUNCTIONAL_REFERENCE_ORDER'
    );

    const edge = createLockedSource();
    const blueEdge = edge.functionalReferences.find((entry) => entry.id === 'b.blue.v1')!;
    blueEdge.dark.vivid = { tone: 1, source: 'generated-anchor' };
    blueEdge.dark.subtle = { tone: 1, source: 'surface-relative' };
    expect(validateLockedTonalSystemSource(edge).valid).toBe(true);

    const manualLocked = createLockedSource();
    const manualLockedBlue = manualLocked.functionalReferences.find(
      (entry) => entry.id === 'b.blue.v1'
    )!;
    manualLockedBlue.light.vivid = { tone: 1, source: 'locked' };
    manualLockedBlue.light.subtle = { tone: 1, source: 'locked' };
    expect(issueCodes(manualLocked, validateLockedTonalSystemSource)).toContain(
      'INVALID_FUNCTIONAL_REFERENCE_ORDER'
    );

    const manualDraft = createRecipe();
    manualDraft.functionalReferences = [
      {
        id: 'b.blue.v1',
        light: {
          vivid: { mode: 'locked', tone: 1 },
          subtle: { mode: 'locked', tone: 1 }
        },
        dark: { vivid: { mode: 'auto' }, subtle: { mode: 'auto' } }
      }
    ];
    expect(issueCodes(manualDraft)).toContain('INVALID_FUNCTIONAL_REFERENCE_ORDER');
  });

  it('strictly validates locked provenance and reference-match payloads', () => {
    const invalid = createLockedSource() as unknown as Record<string, unknown>;
    const references = invalid.functionalReferences as Array<Record<string, unknown>>;
    const blue = references.find((entry) => entry.id === 'b.blue.v1')!;
    const black = references.find((entry) => entry.id === 'n.black.v1')!;
    const blueLight = blue.light as Record<string, unknown>;
    const blueDark = blue.dark as Record<string, unknown>;
    const blackLight = black.light as Record<string, unknown>;

    blueLight.vivid = { tone: 45, source: 'surface-relative' };
    blueLight.subtle = { tone: 4, source: 'reference-match' };
    blueDark.subtle = { tone: 4, source: 'generated-anchor', referenceHex: '#d9f1ff' };
    blackLight.vivid = { tone: 45, source: 'contrast-mirror' };

    const result = validateLockedTonalSystemSource(invalid);
    expect(result.valid).toBe(false);
    if (result.valid) return;
    expect(result.issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: 'INVALID_LOCKED_FUNCTIONAL_REFERENCE_SOURCE',
          path: '/functionalReferences/0/light/vivid/source'
        }),
        expect.objectContaining({ code: 'INVALID_FUNCTIONAL_REFERENCE_HEX' }),
        expect.objectContaining({ code: 'UNKNOWN_PROPERTY' }),
        expect.objectContaining({ code: 'INVALID_CONTRAST_MIRROR_REFERENCE' })
      ])
    );
  });

  it('rejects support-family reference matching in locked sources', () => {
    const locked = createLockedSource();
    const green = locked.functionalReferences.find((entry) => entry.id === 'g.green.v1')!;
    green.light.subtle = {
      tone: 4,
      source: 'reference-match',
      referenceHex: '#d9f1ff'
    };

    expect(issueCodes(locked, validateLockedTonalSystemSource)).toContain(
      'SUPPORT_REFERENCE_MATCH_UNSUPPORTED'
    );
  });

  it('rejects achromatic primary locks, variant drift, and primary override conflicts', () => {
    const recipe = createRecipe();
    expect(() =>
      lockTonalSystemRecipe(recipe, 'n.black.v1', { light: 45, dark: 45 }, createLockedReferences())
    ).toThrow('chromatic Munsell family');

    recipe.primary.variant = 'v2';
    expect(() =>
      lockTonalSystemRecipe(recipe, 'b.blue.v1', { light: 45, dark: 45 }, createLockedReferences())
    ).toThrow('explicit primary variant');

    recipe.primary.variant = 'v1';
    recipe.overrides = [
      {
        id: 'b.blue.v1',
        seedHex: '#0066aa',
        policies: { light: 'harmonized', dark: 'harmonized' }
      }
    ];
    expect(() =>
      lockTonalSystemRecipe(recipe, 'b.blue.v1', { light: 45, dark: 45 }, createLockedReferences())
    ).toThrow('PRIMARY_OVERRIDE_CONFLICT');

    const locked = createLockedSource();
    locked.overrides.push({
      id: 'b.blue.v1',
      seedHex: '#0066aa',
      policies: { light: 'harmonized', dark: 'harmonized' }
    });
    expect(issueCodes(locked, validateLockedTonalSystemSource)).toContain(
      'PRIMARY_OVERRIDE_CONFLICT'
    );

    const blackPrimary = structuredClone(locked);
    blackPrimary.overrides = [];
    blackPrimary.primary.id = 'n.black.v1';
    expect(issueCodes(blackPrimary, validateLockedTonalSystemSource)).toContain(
      'ACHROMATIC_PRIMARY_UNSUPPORTED'
    );
  });

  it('accepts locked harmony-rest positions from 1 through 99 and rejects caps', () => {
    const recipe = createRecipe();
    recipe.tonalAnchors.rest = { mode: 'locked', light: 1, dark: 99 };
    expect(validateTonalSystemRecipe(recipe).valid).toBe(true);

    for (const tone of [0, 100] as const) {
      const invalid = createRecipe();
      invalid.tonalAnchors.rest = {
        mode: 'locked',
        light: tone,
        dark: 45
      } as TonalSystemRecipeV5['tonalAnchors']['rest'];
      expect(issueCodes(invalid)).toContain('INVALID_REST_TONE');
    }
  });
});
