import { expect, it } from 'vitest';
import { validateSelectComponentContract } from './select.zod.ts';

it('accepts independent modes and rejects TextField-only topology', () => {
  const valid = {
    options: { mode: 'outline' },
    variants: {
      standard: {
        modes: {
          outline: {
            elements: {
              e4: { name: 'trigger' },
              e8: { name: 'previous' },
              e11: { name: 'placeholder' }
            }
          }
        }
      }
    }
  };
  expect(validateSelectComponentContract(valid)).toEqual([]);
  expect(
    validateSelectComponentContract({ ...valid, options: { mode: 'inside' } }).length
  ).toBeGreaterThan(0);
  expect(
    validateSelectComponentContract({ ...valid, variants: { floating: { modes: {} } } }).length
  ).toBeGreaterThan(0);
});

it('accepts mode-specific focus presentation and shared decorative dividers', () => {
  const schema = {
    options: { focusIndicator: 'outer', focusRingColorSource: 'global', showDividers: true },
    variants: {
      standard: {
        modes: {
          outline: {
            options: { focusIndicator: 'inner', focusRingColorSource: 'component' },
            elements: {
              e12: {
                name: 'divider',
                separator: { 's:all': 'subtle' },
                scales: { boxHeight: 20 }
              }
            }
          },
          underline: { options: { focusIndicator: 'underline' }, elements: {} },
          borderless: { options: { showDividers: false }, elements: {} }
        }
      }
    }
  };
  expect(validateSelectComponentContract(schema)).toEqual([]);
  for (const invalid of [
    { focusIndicator: 'outline' },
    { focusRingColorSource: 'blue' },
    { showDividers: 'always' }
  ]) {
    expect(validateSelectComponentContract({ ...schema, options: invalid }).length).toBeGreaterThan(
      0
    );
    expect(
      validateSelectComponentContract({
        ...schema,
        variants: { standard: { modes: { outline: { options: invalid, elements: {} } } } }
      }).length
    ).toBeGreaterThan(0);
  }
});

it('keeps divider paint and thickness in the separator profile', () => {
  const validateDivider = (e12: unknown) =>
    validateSelectComponentContract({
      variants: { standard: { modes: { outline: { elements: { e12 } } } } }
    });
  expect(validateDivider({ name: 'divider', separator: { 's:all': 'subtle' } })).toEqual([]);
  for (const e12 of [
    { name: 'divider' },
    { name: 'divider', separator: {} },
    { name: 'divider', separator: { profile: 'subtle' } },
    { name: 'divider', separator: { 's:all': 'subtle' }, scales: { boxWidth: 2 } },
    { name: 'divider', separator: { 's:all': 'subtle' }, palettes: {} },
    { name: 'divider', separator: { 's:all': 'subtle' }, decorations: {} }
  ]) {
    expect(validateDivider(e12).length).toBeGreaterThan(0);
  }
});

it('rejects styling outside each slot ownership instead of accepting a generic element bag', () => {
  const rejected: Record<string, object[]> = {
    e1: [{ scales: { paddingTop: 2 } }, { typography: { 's:all': 'body' } }],
    e2: [{ scales: { paddingLeft: 2 } }, { decorations: { borderStyle: 'solid' } }],
    e3: [{ scales: { boxWidth: 20 } }, { typography: { 's:all': 'body' } }],
    e4: [{ scales: { boxHeight: 32 } }, { scales: { marginTop: 2 } }],
    e5: [{ scales: { paddingTop: 2 } }],
    e6: [{ scales: { borderWidth: 1 } }],
    e7: [{ scales: { paddingBottom: 2 } }, { scales: { boxWidth: 20 } }],
    e8: [{ scales: { boxHeight: 32 } }, { scales: { marginLeft: 2 } }],
    e9: [{ scales: { boxHeight: 32 } }, { scales: { marginRight: 2 } }],
    e10: [{ scales: { marginBottom: 2 } }],
    e11: [{ scales: { borderRadius: { rounded: 4 } } }],
    e12: [{ scales: { marginTop: 2 } }, { scales: { marginBottom: 2 } }]
  };
  for (const [key, extras] of Object.entries(rejected)) {
    for (const extra of [...extras, { effects: {} }]) {
      const element = {
        name: key,
        ...(key === 'e12' ? { separator: { 's:all': 'subtle' } } : {}),
        ...extra
      };
      expect(
        validateSelectComponentContract({
          variants: { standard: { modes: { outline: { elements: { [key]: element } } } } }
        }),
        `${key}: ${JSON.stringify(extra)}`
      ).not.toEqual([]);
    }
  }
});

it('rejects colors on slots that do not own that paint', () => {
  for (const [key, property] of [
    ['e2', 'boxColor'],
    ['e3', 'textColor'],
    ['e5', 'borderColor'],
    ['e7', 'textColor'],
    ['e8', 'borderBottomColor']
  ]) {
    expect(
      validateSelectComponentContract({
        variants: {
          standard: {
            modes: {
              outline: {
                elements: {
                  [key!]: {
                    name: key,
                    palettes: {
                      default: {
                        light: {
                          onSubtle: {
                            [property!]: { neutral: { medium: { rest: '#000000' } } }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      })
    ).not.toEqual([]);
  }
});

it('requires the complete positioner geometry and rejects unrelated paint', () => {
  const validate = (e13: unknown) =>
    validateSelectComponentContract({
      variants: { standard: { modes: { outline: { elements: { e13 } } } } }
    });
  const scales = { marginTop: 8, paddingTop: 8, paddingRight: 8, paddingBottom: 8, paddingLeft: 8 };
  expect(validate({ name: 'positioner', scales })).toEqual([]);
  expect(validate({ name: 'positioner', scales: { marginTop: 8 } })).not.toEqual([]);
  expect(validate({ name: 'positioner', scales, palettes: {} })).not.toEqual([]);
});
