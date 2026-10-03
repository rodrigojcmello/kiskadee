import { describe, expect, it } from 'vitest';
import { elementSizeValues } from '../breakpoints.ts';
import { validateSchemaComponentContracts } from '../utils/validateComponentContracts.ts';
import { type LayoutComponent, validateLayoutComponentContract } from './layout.ts';

function createLayout(): LayoutComponent {
  const spacing = () =>
    Object.fromEntries(
      elementSizeValues.map((size, index) => [size, (index + 1) * 2])
    ) as LayoutComponent['elements']['e1']['scales']['paddingTop'];
  return {
    elements: {
      e1: {
        name: 'frame',
        scales: {
          paddingTop: spacing(),
          paddingRight: spacing(),
          paddingBottom: spacing(),
          paddingLeft: spacing(),
          marginTop: spacing(),
          marginRight: spacing(),
          marginBottom: spacing(),
          marginLeft: spacing()
        }
      },
      e2: { name: 'flow', scales: { paddingTop: spacing(), paddingLeft: spacing() } }
    }
  };
}

describe('Layout component contract', () => {
  it('accepts a complete shared spacing ladder through component and schema validation', () => {
    const layout = createLayout();
    expect(validateLayoutComponentContract(layout)).toEqual([]);
    expect(() => validateSchemaComponentContracts({ components: { layout } })).not.toThrow();
  });

  it.each(['e1', 'e2'] as const)('requires the %s slot', (slot) => {
    const layout = createLayout();
    Reflect.deleteProperty(layout.elements, slot);
    expect(validateLayoutComponentContract(layout)).toContain(
      `components.layout.elements.${slot}: expected object`
    );
  });

  it.each(['e1', 'e2'] as const)('rejects missing size entries in %s', (slot) => {
    const layout = createLayout();
    Reflect.deleteProperty(layout.elements[slot].scales.paddingTop, 's:lg:5');
    expect(validateLayoutComponentContract(layout)).toContain(
      `components.layout.elements.${slot}.scales.paddingTop.s:lg:5: expected positive finite number`
    );
  });

  it('requires every frame family and both flow directions', () => {
    const layout = createLayout();
    Reflect.deleteProperty(layout.elements.e1.scales, 'marginLeft');
    Reflect.deleteProperty(layout.elements.e2.scales, 'paddingLeft');
    expect(validateLayoutComponentContract(layout)).toEqual([
      'components.layout.elements.e1.scales.marginLeft: expected complete size scale',
      'components.layout.elements.e2.scales.paddingLeft: expected complete size scale'
    ]);
  });

  it.each([
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY
  ])('rejects non-positive or non-finite spacing %s', (invalid) => {
    const layout = createLayout();
    layout.elements.e1.scales.paddingTop['s:sm:5'] = invalid;
    expect(validateLayoutComponentContract(layout)).toContain(
      'components.layout.elements.e1.scales.paddingTop.s:sm:5: expected positive finite number'
    );
  });

  it.each([1, 2])('rejects decreasing or repeated neighboring sizes %s', (invalid) => {
    const layout = createLayout();
    layout.elements.e1.scales.paddingTop['s:sm:4'] = invalid;
    expect(validateLayoutComponentContract(layout)).toContain(
      'components.layout.elements.e1.scales.paddingTop.s:sm:4: expected strictly increasing spacing'
    );
  });

  it.each([
    ['e1', 'marginLeft'],
    ['e2', 'paddingLeft']
  ] as const)('rejects unequal shared spacing in %s.%s', (slot, property) => {
    const layout = createLayout();
    const scale =
      slot === 'e1' ? layout.elements.e1.scales.marginLeft : layout.elements.e2.scales.paddingLeft;
    scale['s:md:1'] += 1;
    expect(validateLayoutComponentContract(layout)).toContain(
      `components.layout.elements.${slot}.scales.${property}.s:md:1: expected the shared frame/flow spacing value`
    );
  });

  it('rejects geometry, paint, effects and gap outside the allowed spacing topology', () => {
    const layout = createLayout();
    Object.assign(layout, { effects: {} });
    Object.assign(layout.elements, { e3: {} });
    Object.assign(layout.elements.e1, { palettes: {} });
    Object.assign(layout.elements.e1.scales, { borderRadius: 4 });
    Object.assign(layout.elements.e2.scales, { gap: 16, marginTop: 8 });
    expect(validateLayoutComponentContract(layout)).toEqual([
      'components.layout.effects: unrecognized key',
      'components.layout.elements.e3: unrecognized key',
      'components.layout.elements.e1.palettes: unrecognized key',
      'components.layout.elements.e1.scales.borderRadius: unrecognized key',
      'components.layout.elements.e2.scales.gap: unrecognized key',
      'components.layout.elements.e2.scales.marginTop: unrecognized key'
    ]);
  });

  it('rejects scalar, responsive and unknown size scale shapes', () => {
    const layout = createLayout();
    Object.assign(layout.elements.e1.scales, { marginLeft: 16 });
    Object.assign(layout.elements.e2.scales.paddingTop, { 's:all': 16 });
    Object.assign(layout.elements.e2.scales.paddingLeft, { 's:md:1': { 'bp:all': 16 } });
    const issues = validateLayoutComponentContract(layout);
    expect(issues).toContain(
      'components.layout.elements.e1.scales.marginLeft: expected complete size scale'
    );
    expect(issues).toContain(
      'components.layout.elements.e2.scales.paddingTop.s:all: unrecognized key'
    );
    expect(issues).toContain(
      'components.layout.elements.e2.scales.paddingLeft.s:md:1: expected positive finite number'
    );
  });

  it('rejects incorrect frame/flow identity and reports the schema owner', () => {
    const layout = createLayout();
    Object.assign(layout.elements.e2, { name: 'content' });
    expect(() => validateSchemaComponentContracts({ components: { layout } })).toThrow(
      'components.layout.elements.e2.name: expected "flow"'
    );
  });
});
