import { describe, expect, it } from 'vitest';
import {
  createComplementaryColorId,
  DEFAULT_TONAL_SYSTEM_RECIPE,
  getLegacyComplementaryIdMap,
  parseTonalFamilyId,
  TONAL_CORE_FAMILY_IDS,
  validateLockedTonalSystemSource,
  validateTonalSystemRecipe
} from './tonal-system-contract.ts';

const recipe = () => structuredClone(DEFAULT_TONAL_SYSTEM_RECIPE);
const catalog = (complementaryColors: unknown) => ({
  colors: [],
  names: {},
  neutrals: [],
  complementaryColors
});
const blue = {
  id: 'b.blue.v1.c',
  sourceId: 'primary',
  strategy: 'contrast-complement-v1'
};

describe('Complementary color namespace and migration', () => {
  it('keeps origin identity in a bounded .c namespace', () => {
    expect(createComplementaryColorId('b.blue.v1')).toBe('b.blue.v1.c');
    expect(parseTonalFamilyId('b.blue.v1.c')).toMatchObject({
      stem: 'b.blue',
      complementary: true,
      sourceFamilyId: 'b.blue.v1',
      variant: 'v1'
    });
    for (const id of ['b.blue.v1.c.c', 'b.blue.v1c', 'b.blue.v2.1', 'n.black.v1.c'])
      expect(parseTonalFamilyId(id)).toBeNull();
    expect(() => createComplementaryColorId('n.black.v1')).toThrow('Invalid complementary origin');
    expect(() => createComplementaryColorId('b.blue.v1.c')).toThrow('Invalid complementary origin');
  });

  it('accepts both strategies and optional existing profiles without changing base profiles', () => {
    for (const strategy of ['material-complement-v1', 'contrast-complement-v1']) {
      const input = {
        ...recipe(),
        catalog: catalog([{ ...blue, strategy, tonalProfile: 'balanced' }])
      };
      const result = validateTonalSystemRecipe(input);
      expect(result.valid, JSON.stringify(result.issues)).toBe(true);
      if (!result.valid) continue;
      expect(result.value.tonalProfile).toBe(input.tonalProfile);
      expect(result.value.catalog?.complementaryColors).toEqual([
        { ...blue, strategy, tonalProfile: 'balanced' }
      ]);
    }
  });

  it.each([
    [{ ...blue, id: 'b.blue.v2.c' }],
    [{ ...blue, sourceId: 'n.black.v1' }],
    [blue, { ...blue, sourceId: 'b.blue.v1' }],
    [blue, { ...blue, id: 'b.blue.v1.c.c', sourceId: 'b.blue.v1.c' }],
    [{ ...blue, strategy: 'unknown' }],
    [{ ...blue, tonalProfile: 'unknown' }],
    [{ ...blue, tonalProfile: {} }],
    [{ ...blue, surprise: true }]
  ])('rejects invalid, chained, duplicate or unknown association authoring %j', (...entries) => {
    expect(validateTonalSystemRecipe({ ...recipe(), catalog: catalog(entries) }).valid).toBe(false);
  });

  it('rejects complementary identities as authored ordinary families', () => {
    const overrides = [
      {
        id: 'b.blue.v1.c',
        seedHex: '#40beff',
        policies: { light: 'source-exact', dark: 'adaptive' }
      }
    ];
    expect(validateTonalSystemRecipe({ ...recipe(), overrides }).valid).toBe(false);
    expect(
      validateTonalSystemRecipe({ ...recipe(), catalog: { ...catalog([]), colors: overrides } })
        .valid
    ).toBe(false);
  });

  it.each([
    5, 6, 7
  ])('migrates V%s support names and reference locks without mutating historical input', (formatVersion) => {
    const legacy = {
      ...recipe(),
      formatVersion,
      catalog: {
        colors: [],
        neutrals: [],
        names: { 'b.blue.v2': 'Blue complement' },
        supportingColors: [
          { id: 'b.blue.v2', sourceId: 'primary', strategy: 'material-support-v1' }
        ]
      },
      functionalReferences: [
        {
          id: 'b.blue.v2',
          light: { vivid: { mode: 'locked', tone: 50 }, subtle: { mode: 'locked', tone: 4 } },
          dark: { vivid: { mode: 'locked', tone: 40 }, subtle: { mode: 'locked', tone: 4 } }
        }
      ]
    };
    const snapshot = structuredClone(legacy);
    const result = validateTonalSystemRecipe(legacy);
    expect(result.valid, JSON.stringify(result.issues)).toBe(true);
    if (!result.valid) return;
    expect(getLegacyComplementaryIdMap(legacy)).toEqual({ 'b.blue.v2': 'b.blue.v1.c' });
    expect(result.value.formatVersion).toBe(8);
    expect(result.value.catalog).toMatchObject({
      names: { 'b.blue.v1.c': 'Blue complement' },
      complementaryColors: [{ ...blue, strategy: 'material-complement-v1' }]
    });
    expect(result.value.catalog).not.toHaveProperty('supportingColors');
    expect(result.value.functionalReferences[0]).toMatchObject({
      id: 'b.blue.v1.c',
      light: { vivid: { tone: 50 } }
    });
    expect(legacy).toEqual(snapshot);
  });

  it('migrates locked non-primary origin identities and the complete reference set', () => {
    const refs = [...TONAL_CORE_FAMILY_IDS, 'pb.indigo.v2', 'pb.indigo.v3'].map((id) => ({
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
    const input = {
      ...recipe(),
      formatVersion: 7,
      primary: {
        id: 'b.blue.v1',
        seedHex: '#0064b4',
        policies: { light: 'source-exact', dark: 'adaptive' }
      },
      tonalAnchors: { rest: { mode: 'locked', light: 50, dark: 40 } },
      catalog: {
        colors: [
          {
            id: 'pb.indigo.v2',
            seedHex: '#6750a4',
            policies: { light: 'source-exact', dark: 'adaptive' }
          }
        ],
        neutrals: [],
        names: {},
        supportingColors: [
          { id: 'pb.indigo.v3', sourceId: 'pb.indigo.v2', strategy: 'material-support-v1' }
        ]
      },
      functionalReferences: refs
    };
    const result = validateLockedTonalSystemSource(input);
    expect(result.valid, JSON.stringify(result.issues)).toBe(true);
    if (!result.valid) return;
    expect(result.value.functionalReferences.map((reference) => reference.id)).toContain(
      'pb.indigo.v2.c'
    );
    expect(result.value.functionalReferences.map((reference) => reference.id)).not.toContain(
      'pb.indigo.v3'
    );
  });

  it('rejects ambiguous aliases and occupied historical identities rather than repairing them', () => {
    const legacy = [{ id: 'b.blue.v2', sourceId: 'primary', strategy: 'material-support-v1' }];
    expect(
      validateTonalSystemRecipe({
        ...recipe(),
        catalog: { ...catalog([blue]), supportingColors: legacy }
      }).valid
    ).toBe(false);
    expect(
      validateTonalSystemRecipe({
        ...recipe(),
        catalog: {
          colors: [],
          names: {},
          neutrals: [],
          supportingColors: [{ ...legacy[0], id: 'b.blue.v1' }]
        }
      }).valid
    ).toBe(false);
    expect(
      validateTonalSystemRecipe({
        ...recipe(),
        catalog: {
          colors: [],
          names: { 'b.blue.v2': 'Old name', 'b.blue.v1.c': 'Conflicting name' },
          neutrals: [],
          supportingColors: legacy
        }
      }).valid
    ).toBe(false);
  });
});
