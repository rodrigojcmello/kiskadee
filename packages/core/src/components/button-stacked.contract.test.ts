import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  type ButtonElements,
  type ButtonIconLayout,
  type ButtonStackedContainerElementStyle,
  type ButtonStackedIconElementStyle,
  type ButtonStackedLabelElementStyle,
  validateButtonComponentContract
} from '../index.ts';

function stackedElements() {
  return {
    e8: {
      name: 'button-stacked',
      scales: {
        paddingTop: { 's:md:1': 8 },
        paddingRight: { 's:md:1': 12 },
        paddingBottom: { 's:md:1': 8 },
        paddingLeft: { 's:md:1': 12 },
        borderWidth: { 's:md:1': 1 },
        borderRadius: { rounded: 4, square: 0 },
        _boxHeight: { 's:md:1': 60 }
      }
    },
    e9: {
      name: 'button-stacked-label',
      typography: { 's:md:1': 'caption-medium' },
      decorations: { textItalic: false },
      scales: { marginTop: { 's:md:1': 4 } }
    },
    e10: {
      name: 'button-stacked-icon',
      iconSize: { 's:md:1': 's:lg:1' }
    }
  } satisfies ButtonElements;
}

describe('Button stacked anatomy contract', () => {
  it('exports geometry-only types without transferring paint or effects ownership', () => {
    expectTypeOf<ButtonIconLayout>().toEqualTypeOf<'inline' | 'edge' | 'stacked'>();
    expectTypeOf<ButtonStackedContainerElementStyle>().not.toHaveProperty('palettes');
    expectTypeOf<ButtonStackedContainerElementStyle>().not.toHaveProperty('effects');
    expectTypeOf<ButtonStackedLabelElementStyle>().not.toHaveProperty('palettes');
    expectTypeOf<ButtonStackedLabelElementStyle>().not.toHaveProperty('effects');
    expectTypeOf<ButtonStackedIconElementStyle>().not.toHaveProperty('scales');
    expectTypeOf<ButtonStackedIconElementStyle>().not.toHaveProperty('palettes');
  });

  it('accepts a complete optional recipe and the stacked layout default', () => {
    expect(
      validateButtonComponentContract({
        options: { iconLayout: 'stacked' },
        elements: { e1: { name: 'button' }, ...stackedElements() }
      })
    ).toEqual([]);
  });

  it('keeps old presets and partially authored optional anatomy valid', () => {
    const { e8, e9, e10 } = stackedElements();
    for (const elements of [{}, { e8 }, { e9 }, { e10 }]) {
      expect(
        validateButtonComponentContract({ elements: { e1: { name: 'button' }, ...elements } })
      ).toEqual([]);
    }
  });

  it.each([
    'e8',
    'e9',
    'e10'
  ] as const)('requires %s when the preset selects stacked by default', (missing) => {
    const elements: ButtonElements = stackedElements();
    delete elements[missing];
    expect(
      validateButtonComponentContract({ options: { iconLayout: 'stacked' }, elements })
    ).toContain(
      'components.button.options.iconLayout: stacked defaults require components.button.elements.e8, e9 and e10'
    );
  });

  it('requires real container geometry instead of a metadata-only element', () => {
    const issues = validateButtonComponentContract({
      elements: { e8: { name: 'button-stacked', scales: { _boxHeight: 60 } } }
    });
    for (const property of [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'borderWidth',
      'borderRadius'
    ]) {
      expect(issues).toContain(`components.button.elements.e8.scales.${property}: required scale`);
    }
  });

  it.each([
    0,
    -1,
    Infinity,
    { 's:md:1': { 'bp:all': 60 } }
  ])('validates the optional stacked reference with the existing height contract: %j', (reference) => {
    const { e8 } = stackedElements();
    expect(
      validateButtonComponentContract({
        elements: { e8: { ...e8, scales: { ...e8.scales, _boxHeight: reference } } }
      })
    ).toEqual(
      expect.arrayContaining([
        expect.stringContaining('components.button.elements.e8.scales._boxHeight')
      ])
    );
  });

  it('requires stacked typography, gap and a catalog-backed icon viewport', () => {
    expect(
      validateButtonComponentContract({
        elements: {
          e9: { name: 'button-stacked-label', scales: {} },
          e10: { name: 'button-stacked-icon' }
        }
      })
    ).toEqual([
      'components.button.elements.e9.typography: required reference',
      'components.button.elements.e9.scales.marginTop: required scale',
      'components.button.elements.e10.iconSize: required reference'
    ]);
  });

  it.each(['e8', 'e9', 'e10'] as const)('rejects independent paint and effects on %s', (slot) => {
    expect(
      validateButtonComponentContract({
        elements: {
          [slot]: { ...stackedElements()[slot], palettes: {}, effects: {} }
        }
      })
    ).toEqual([
      `components.button.elements.${slot}.palettes: not allowed for this element`,
      `components.button.elements.${slot}.effects: not allowed for this element`
    ]);
  });

  it('rejects legacy icon spacing, raw viewport dimensions and arbitrary metadata keys', () => {
    const { e8, e9, e10 } = stackedElements();
    expect(
      validateButtonComponentContract({
        elements: {
          e8: { ...e8, scales: { ...e8.scales, _boxWidth: 60 } },
          e9: { ...e9, scales: { marginTop: 4, paddingRight: 6 } },
          e10: { ...e10, scales: { boxHeight: 24 } }
        }
      })
    ).toEqual([
      'components.button.elements.e8.scales._boxWidth: unrecognized key',
      'components.button.elements.e9.scales.paddingRight: unrecognized key',
      'components.button.elements.e10.scales: not allowed for this element'
    ]);
  });
});
