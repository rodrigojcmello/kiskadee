import { describe, expect, it } from 'vitest';
import { validateTextFieldComponentContract } from './text-field.contract.zod.ts';

const contentSurfaceContext = {
  default: { light: { onVivid: { neutral: { medium: { rest: 'onSubtle' } } } } }
};
const component = (mode: object) => ({ variants: { standard: { modes: { outline: mode } } } });

describe('TextField optional content anatomy', () => {
  it('preserves presets without content slots or descendant surface output', () => {
    expect(
      validateTextFieldComponentContract(component({ elements: { e1: { name: 'root' } } }))
    ).toEqual([]);
  });

  it('accepts passive icon/text references and per-mode surface output', () => {
    expect(
      validateTextFieldComponentContract(
        component({
          contentSurfaceContext,
          contentRegionSurfaceContext: contentSurfaceContext,
          elements: {
            e8: {
              name: 'content-region',
              scales: { paddingLeft: { 's:md:1': 8 }, marginRight: 8, borderWidth: 1 }
            },
            e9: { name: 'icon', iconSize: { 's:md:1': 's:md:1' } },
            e10: { name: 'text', typography: { 's:md:1': 'body-medium' } }
          }
        })
      )
    ).toEqual([]);
  });

  it('rejects retired passive frames and region-owned artwork geometry', () => {
    const issues = validateTextFieldComponentContract(
      component({
        elements: {
          e11: {
            name: 'passive-frame',
            iconSize: { 's:all': 's:md:1' },
            typography: { 's:all': 'body-medium' }
          },
          e8: { name: 'content-region', iconSize: { 's:all': 's:md:1' } }
        }
      })
    );
    expect(issues.some((issue) => issue.includes('e11'))).toBe(true);
    expect(issues.some((issue) => issue.includes('.e8'))).toBe(true);
  });

  it('rejects local icon pixels and visual properties outside their slot contract', () => {
    const issues = validateTextFieldComponentContract(
      component({
        elements: {
          e8: { name: 'content-region', scales: { boxWidth: 4 } },
          e9: { name: 'icon', iconSize: { 's:md:1': 20 } },
          e10: { name: 'text', scales: { textSize: 14 } }
        }
      })
    );
    expect(issues.some((issue) => issue.includes('.e8.scales'))).toBe(true);
    expect(issues.some((issue) => issue.includes('.e9.iconSize'))).toBe(true);
    expect(issues.some((issue) => issue.includes('.e10'))).toBe(true);
  });

  it.each([
    'contentSurfaceContext',
    'contentRegionSurfaceContext'
  ] as const)('validates %s states with the existing shared contract', (key) => {
    const invalid = structuredClone(contentSurfaceContext);
    invalid.default.light.onVivid.neutral.medium.rest = 'automatic';
    expect(validateTextFieldComponentContract(component({ [key]: invalid, elements: {} }))).toEqual(
      [
        `components.textField.variants.standard.modes.outline.${key}.default.light.onVivid.neutral.medium.rest: expected onSubtle, onVivid, or inherit`
      ]
    );
  });
});
