import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  type ButtonElements,
  type ButtonIndicatorPlacement,
  type ButtonSelectionEmphasis,
  type ClassNameByElementJSON,
  type StyleKeyByElement,
  validateButtonComponentContract
} from '../index.ts';

const palette = () => ({
  default: {
    light: {
      onSubtle: { boxColor: { neutral: { medium: { selected: { rest: { ref: '#0067b8' } } } } } }
    }
  }
});
function indicator(): NonNullable<ButtonElements['e11']> {
  return {
    name: 'button-indicator',
    scales: {
      boxWidth: { 's:md:1': 20 },
      boxHeight: 3,
      marginTop: 2,
      marginBottom: 2,
      marginLeft: 4,
      marginRight: 4,
      borderRadius: { rounded: 2, pill: 2, square: 0 }
    },
    palettes: palette()
  };
}

describe('Button optional state indicator', () => {
  it('accepts inside and outside recipes independently or together without new palette axes', () => {
    for (const elements of [
      { e11: indicator() },
      { e12: indicator() },
      { e11: indicator(), e12: indicator() }
    ]) {
      expect(validateButtonComponentContract({ elements })).toEqual([]);
    }
  });
  it('applies the same sparse-state, geometry and parent-reference contract to the outside recipe', () => {
    const outside = indicator();
    expect(validateButtonComponentContract({ elements: { e12: outside } })).toEqual([]);
    const issues = validateButtonComponentContract({
      elements: {
        e12: {
          ...outside,
          scales: { ...outside.scales, boxHeight: 0 },
          palettes: {
            default: {
              light: {
                onSubtle: { boxColor: { neutral: { medium: { selected: { rest: '#000000' } } } } }
              }
            }
          }
        }
      }
    });
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('components.button.elements.e12.scales.boxHeight'),
        'components.button.elements.e12.palettes.default.light.onSubtle.boxColor.neutral.medium.selected.rest: expected parent-state reference'
      ])
    );
  });
  it('exports bounded placement and preserves presets without indicator anatomy', () => {
    expectTypeOf<ButtonIndicatorPlacement>().toEqualTypeOf<'inside' | 'outside'>();
    expectTypeOf<ButtonSelectionEmphasis>().toEqualTypeOf<'lowest' | 'low' | 'medium' | 'high'>();
    expectTypeOf<StyleKeyByElement>().not.toHaveProperty('placements');
    expectTypeOf<ClassNameByElementJSON>().not.toHaveProperty('placements');
    expect(validateButtonComponentContract({ elements: { e1: { name: 'button' } } })).toEqual([]);
    expect(
      validateButtonComponentContract({
        options: { indicatorPlacement: 'outside' },
        elements: { e11: indicator() }
      })
    ).toEqual([]);
  });
  it.each([
    undefined,
    'lowest',
    'low',
    'medium',
    'high'
  ])('accepts optional selection emphasis %j without requiring indicator anatomy', (selectionEmphasis) => {
    expect(
      validateButtonComponentContract({
        options: selectionEmphasis === undefined ? {} : { selectionEmphasis },
        elements: { e1: { name: 'button' } }
      })
    ).toEqual([]);
    expect(
      validateButtonComponentContract({
        options: selectionEmphasis === undefined ? {} : { selectionEmphasis },
        elements: { e11: indicator() }
      })
    ).toEqual([]);
  });
  it.each([
    'highest',
    'all',
    'stacked',
    'none',
    true,
    null
  ])('rejects invalid selection emphasis %j', (selectionEmphasis) => {
    expect(
      validateButtonComponentContract({
        options: { selectionEmphasis },
        elements: { e11: indicator() }
      })
    ).toContain(
      'components.button.options.selectionEmphasis: expected "lowest", "low", "medium" or "high"'
    );
  });
  it('rejects the removed independent indicator scope option', () => {
    expect(validateButtonComponentContract({ options: { indicatorScope: 'stacked' } })).toContain(
      'components.button.options.indicatorScope: unrecognized key'
    );
  });
  it.each([
    'marginLeft',
    'marginRight'
  ] as const)('requires a non-negative %s recipe', (property) => {
    const value = indicator();
    for (const entry of [undefined, -1, Infinity, { 's:md:1': -1 }]) {
      expect(
        validateButtonComponentContract({
          elements: { e11: { ...value, scales: { ...value.scales, [property]: entry } } }
        })
      ).toEqual(expect.arrayContaining([expect.stringContaining(`e11.scales.${property}`)]));
    }
    value.scales[property] = 0;
    expect(validateButtonComponentContract({ elements: { e11: value } })).toEqual([]);
  });
  it('accepts sparse selected parent paint and explicit Rest only for e11', () => {
    const value = indicator();
    expect(validateButtonComponentContract({ elements: { e11: value } })).toEqual([]);
    expect(
      validateButtonComponentContract({ elements: { e1: { name: 'button', palettes: palette() } } })
    ).toContain(
      'components.button.elements.e1.palettes.default.light.onSubtle.boxColor.neutral.medium.rest: required state'
    );
    value.palettes.default!.light!.onSubtle.boxColor.neutral!.medium!.rest = '#ffffff';
    expect(validateButtonComponentContract({ elements: { e11: value } })).toEqual([]);
  });
  it('rejects the retired placements branch, other paint properties and self-state selected paint', () => {
    const value = indicator() as any;
    value.placements = { inside: { palettes: palette() } };
    value.palettes.default.light.onSubtle.textColor = { neutral: { medium: { rest: '#000000' } } };
    value.palettes.default.light.onSubtle.boxColor.neutral.medium.selected.rest = '#123456';
    const issues = validateButtonComponentContract({ elements: { e11: value } });
    expect(issues).toEqual(
      expect.arrayContaining([
        'components.button.elements.e11.placements: unrecognized key',
        'components.button.elements.e11.palettes.default.light.onSubtle.textColor: unrecognized key',
        'components.button.elements.e11.palettes.default.light.onSubtle.boxColor.neutral.medium.selected.rest: expected parent-state reference'
      ])
    );
  });
  it.each([
    0,
    -1,
    Infinity,
    NaN,
    { 's:invalid': 3 },
    { 's:md:1': { 'bp:invalid': 3 } }
  ])('rejects invalid indicator dimensions %j', (boxHeight) => {
    const value = indicator();
    expect(
      validateButtonComponentContract({
        elements: { e11: { ...value, scales: { ...value.scales, boxHeight } } }
      })
    ).toEqual(expect.arrayContaining([expect.stringContaining('e11.scales.boxHeight')]));
  });
  it('requires complete geometry, a palette and known option values', () => {
    const issues = validateButtonComponentContract({
      options: { indicatorPlacement: 'top' },
      elements: {
        e11: {
          name: 'button-indicator',
          scales: {}
        }
      }
    });
    expect(issues).toEqual(
      expect.arrayContaining([
        'components.button.options.indicatorPlacement: expected "inside" or "outside"',
        'components.button.elements.e11.scales.borderRadius: required object',
        'components.button.elements.e11.palettes: expected object'
      ])
    );
  });
});
