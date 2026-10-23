import { describe, expect, expectTypeOf, it } from 'vitest';
import {
  type ButtonContainerElementStyle,
  type ElementHeightReference,
  type ElementStyle,
  elementSizeValues,
  type Schema,
  validateButtonComponentContract,
  validateSchemaComponentContracts
} from '../index.ts';

function createButton(reference: unknown) {
  return {
    elements: {
      e1: {
        name: 'button',
        scales: { paddingTop: 4, paddingBottom: 4, _boxHeight: reference }
      }
    }
  };
}

describe('Button inspection height reference', () => {
  it('exposes the reference only on the Button container type', () => {
    expectTypeOf<NonNullable<ElementStyle['scales']>>().not.toHaveProperty('_boxHeight');
    expectTypeOf<NonNullable<ButtonContainerElementStyle['scales']>>().toHaveProperty('_boxHeight');
  });
  it('accepts scalar and fixed-size references through public contracts', () => {
    const references: ElementHeightReference[] = [
      30,
      { 's:sm:1': 24, 's:md:1': 32, 's:lg:1': 40 },
      Object.fromEntries(elementSizeValues.map((size) => [size, 30]))
    ];

    for (const reference of references) {
      const container: ButtonContainerElementStyle = {
        name: 'button',
        scales: { _boxHeight: reference }
      };
      expect(validateButtonComponentContract({ elements: { e1: container } })).toEqual([]);
      expect(() =>
        validateSchemaComponentContracts({ components: { button: createButton(reference) } })
      ).not.toThrow();

      const schema = {
        name: 'button-inspection-reference',
        version: [1, 0, 0],
        author: 'Kiskadee',
        breakpoints: { 'bp:all': 0 },
        components: {
          button: {
            elements: {
              e1: { name: 'button', scales: { _boxHeight: reference } }
            }
          }
        }
      } satisfies Schema;
      expect(() => validateSchemaComponentContracts(schema)).not.toThrow();
    }
  });

  it('preserves existing recipes with no inspection reference', () => {
    expect(
      validateButtonComponentContract({
        elements: {
          e1: {
            name: 'button',
            scales: { paddingTop: 4, paddingBottom: 4, borderWidth: 1 }
          },
          e3: { name: 'button-icon', iconSize: { 's:md:1': 's:md:1' } }
        }
      })
    ).toEqual([]);
  });

  it.each([0, -1, NaN, Infinity, -Infinity])('rejects invalid scalar reference %s', (height) => {
    expect(validateButtonComponentContract(createButton(height))).toContain(
      'components.button.elements.e1.scales._boxHeight: expected finite number greater than 0'
    );
    expect(() =>
      validateSchemaComponentContracts({ components: { button: createButton(height) } })
    ).toThrow('scales._boxHeight');
  });

  it.each([null, '', '30', false, [], {}])('rejects malformed reference %j', (reference) => {
    expect(validateButtonComponentContract(createButton(reference))).toContain(
      'components.button.elements.e1.scales._boxHeight: expected positive number or non-empty fixed-size map'
    );
  });

  it.each([
    0,
    -1,
    NaN,
    Infinity,
    '30',
    null,
    { 'bp:all': 30 }
  ])('rejects non-positive, non-numeric, and responsive fixed-size values %j', (height) => {
    expect(validateButtonComponentContract(createButton({ 's:md:1': height }))).toContain(
      'components.button.elements.e1.scales._boxHeight.s:md:1: expected finite number greater than 0'
    );
  });

  it.each([
    's:all',
    'bp:all',
    's:md:2',
    's:sm:6',
    's:lg:0',
    'md'
  ])('rejects non-canonical fixed-size key %s', (size) => {
    expect(validateButtonComponentContract(createButton({ [size]: 30 }))).toContain(
      `components.button.elements.e1.scales._boxHeight.${size}: unrecognized key`
    );
  });

  it('limits the reference to Button e1 without permitting other underscore properties', () => {
    const button = createButton(30);
    expect(
      validateButtonComponentContract({
        elements: {
          e1: { ...button.elements.e1, scales: { _boxWidth: 40 } },
          e3: {
            name: 'button-icon',
            iconSize: { 's:md:1': 's:md:1' },
            scales: { _boxHeight: 20 }
          }
        }
      })
    ).toEqual(
      expect.arrayContaining([
        'components.button.elements.e1.scales._boxWidth: unrecognized key',
        'components.button.elements.e3.scales._boxHeight: unrecognized key'
      ])
    );

    expect(() =>
      validateSchemaComponentContracts({
        components: {
          textField: {
            variants: {
              standard: {
                modes: {
                  outline: { elements: { e3: { name: 'control', scales: { _boxHeight: 32 } } } }
                }
              }
            }
          }
        }
      })
    ).toThrow('_boxHeight');
  });
});
