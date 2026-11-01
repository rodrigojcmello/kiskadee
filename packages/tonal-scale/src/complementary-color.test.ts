import { describe, expect, it, vi } from 'vitest';
import { deltaEOk, hexToOklch } from './color-math.ts';
import * as complementaryColor from './complementary-color.ts';
import {
  ComplementaryColorSourceError,
  deriveComplementaryColor,
  resolveComplementaryTonalProfile
} from './complementary-color.ts';
import { generateKiskadeeScale } from './kiskadee-tonal-scale.ts';
import { generateKiskadeeTonalSystem } from './tonal-system.ts';
import { DEFAULT_TONAL_SYSTEM_RECIPE } from './tonal-system-contract.ts';

describe('Complementary color calibration', () => {
  it('moderates excess chroma without changing the approved Blue references or other candidates', () => {
    const origin = hexToOklch('#09760a');
    const green = hexToOklch(deriveComplementaryColor('#09760a', 'contrast-complement-v1').seedHex);
    expect(green.c).toBeLessThan(0.2);
    expect(green.c / origin.c).toBeLessThan(1.16);
    expect(Math.abs(green.l - 76)).toBeLessThan(0.5);
    expect(Math.abs(green.h - origin.h)).toBeLessThan(1);
    for (const [source, previous] of [
      ['#0064b4', '#40befe'],
      ['#0078d4', '#4bc1fe'],
      ['#b70419', '#fe8a80'],
      ['#5053b2', '#b5a2f4']
    ])
      expect(deriveComplementaryColor(source, 'contrast-complement-v1').seedHex).toBe(previous);
  });

  it.each([
    '#010306',
    '#020306',
    '#010406',
    '#000001',
    '#091726',
    '#d9f1ff',
    '#e1efff'
  ])('keeps a valid extreme origin %s bounded by its own chromatic information', (sourceHex) => {
    const seedHex = deriveComplementaryColor(sourceHex, 'contrast-complement-v1').seedHex;
    expect(hexToOklch(seedHex).c).toBeLessThanOrEqual(hexToOklch(sourceHex).c * 1.15 + 0.001);
    for (const theme of ['light', 'dark'] as const)
      expect(generateKiskadeeScale({ seedHex, theme, profile: 'balanced' }).diagnostics.valid).toBe(
        true
      );
  });

  it('does not amplify one-byte RGB differences near black into strongly different accents', () => {
    const seeds = ['#010306', '#020306', '#010406'].map((source) =>
      hexToOklch(deriveComplementaryColor(source, 'contrast-complement-v1').seedHex)
    );
    for (const seed of seeds) expect(deltaEOk(seeds[0], seed) * 100).toBeLessThan(1);
  });

  it.each([
    '#ffffff',
    '#000000',
    '#808080',
    '#fefeff',
    'not-a-color',
    '#0000'
  ])('rejects an unreliable or invalid origin %s instead of inventing a chromatic accent', (source) => {
    for (const strategy of ['material-complement-v1', 'contrast-complement-v1'] as const)
      expect(() => deriveComplementaryColor(source, strategy)).toThrow(
        ComplementaryColorSourceError
      );
  });

  it('reports a complementary source failure through normal system diagnostics', () => {
    const derive = vi
      .spyOn(complementaryColor, 'deriveComplementaryColor')
      .mockImplementation(() => {
        throw new ComplementaryColorSourceError('Unreliable test origin.');
      });
    try {
      const result = generateKiskadeeTonalSystem({
        ...DEFAULT_TONAL_SYSTEM_RECIPE,
        catalog: {
          colors: [],
          names: {},
          neutrals: [],
          complementaryColors: [
            { id: 'b.blue.v1.c', sourceId: 'primary', strategy: 'contrast-complement-v1' }
          ]
        }
      });
      expect(result.valid).toBe(false);
      expect(result.issues).toContainEqual(
        expect.objectContaining({
          code: 'COMPLEMENTARY_SOURCE_UNRELIABLE',
          familyId: 'b.blue.v1.c',
          severity: 'error'
        })
      );
    } finally {
      derive.mockRestore();
    }
  }, 60000);

  it.each([
    ['#0064b4', '#40beff'],
    ['#0078d4', '#4dc1ff']
  ])('approximates observed Windows accent %s without a hardcoded output', (source, observed) => {
    const { seedHex } = deriveComplementaryColor(source, 'contrast-complement-v1');
    expect(deltaEOk(hexToOklch(seedHex), hexToOklch(observed)) * 100).toBeLessThan(0.5);
    expect(seedHex).not.toBe(source);
    expect(seedHex).toBe(deriveComplementaryColor(source, 'contrast-complement-v1').seedHex);
  });

  it('preserves the existing Material derivation and scopes profile selection', () => {
    expect(deriveComplementaryColor('#0b57d0', 'material-complement-v1').seedHex).toBe('#004e6f');
    expect(deriveComplementaryColor('#6750a4', 'material-complement-v1').seedHex).toBe('#2d4187');
    expect(resolveComplementaryTonalProfile('material-complement-v1', 'vivid-lights')).toBe(
      'vivid-lights'
    );
    expect(resolveComplementaryTonalProfile('contrast-complement-v1', 'vivid-lights')).toBe(
      'balanced'
    );
    expect(
      resolveComplementaryTonalProfile('contrast-complement-v1', 'vivid-lights', 'muted-darks')
    ).toBe('muted-darks');
  });

  it('keeps origin families unchanged and preserves all four complementary anchors', () => {
    const recipe = {
      ...DEFAULT_TONAL_SYSTEM_RECIPE,
      tonalProfile: 'vivid-lights',
      primary: { ...DEFAULT_TONAL_SYSTEM_RECIPE.primary, seedHex: '#0064b4' },
      catalog: {
        colors: [
          {
            id: 'pb.indigo.v2',
            seedHex: '#5b5fc7',
            policies: { light: 'source-exact', dark: 'adaptive' }
          }
        ],
        names: {},
        neutrals: []
      }
    };
    const base = generateKiskadeeTonalSystem(recipe);
    const result = generateKiskadeeTonalSystem({
      ...recipe,
      catalog: {
        ...recipe.catalog,
        complementaryColors: [
          ['primary', 'b.blue.v1.c'],
          ['pb.indigo.v2', 'pb.indigo.v2.c'],
          ['r.red.v1', 'r.red.v1.c'],
          ['g.green.v1', 'g.green.v1.c']
        ].map(([sourceId, id]) => ({ sourceId, id, strategy: 'contrast-complement-v1' }))
      }
    });
    expect(result.valid, JSON.stringify(result.issues)).toBe(true);
    expect(base.valid).toBe(true);
    for (const family of base.families)
      expect(result.families.find((item) => item.id === family.id)).toEqual(family);
    const complementary = result.families.filter((family) => family.id.endsWith('.c'));
    expect(complementary).toHaveLength(4);
    for (const family of complementary) {
      expect(family.tonalProfile).toBe('balanced');
      for (const theme of ['light', 'dark'] as const) {
        const scale = family.themes[theme].scale;
        expect(scale.diagnostics.valid).toBe(true);
        expect(scale.colors.some((color) => color.hex === family.sourceSeedHex)).toBe(true);
      }
    }
  }, 120000);

  it('uses measured hue independently of the complementary origin category', () => {
    const result = generateKiskadeeTonalSystem({
      ...DEFAULT_TONAL_SYSTEM_RECIPE,
      catalog: {
        colors: [
          {
            id: 'pb.indigo.v2',
            seedHex: '#5053b2',
            policies: { light: 'source-exact', dark: 'adaptive' }
          }
        ],
        names: {},
        neutrals: [],
        complementaryColors: [
          { id: 'pb.indigo.v2.c', sourceId: 'pb.indigo.v2', strategy: 'material-complement-v1' }
        ]
      }
    });
    expect(result.valid, JSON.stringify(result.issues)).toBe(true);
    const family = result.families.find((item) => item.id === 'pb.indigo.v2.c');
    expect(family?.sector).toBe('blue');
    expect(family?.identity?.sector).toBe('blue');
  }, 120000);
});
