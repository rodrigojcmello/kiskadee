import { describe, expect, it } from 'vitest';
import { validateDropdownComponentContract } from './dropdown.ts';

function createDropdown() {
  return {
    effects: {
      shadow: {
        e1: {
          kind: 'outer',
          states: { rest: 's:md:1' },
          fixedLevels: ['s:md:1']
        }
      }
    },
    elements: {
      e1: { name: 'surface' },
      e2: { name: 'item' },
      e3: { name: 'icon', iconSize: { 's:all': 's:md:1' } },
      e4: { name: 'label', typography: { 's:all': 'body-medium' } },
      e5: { name: 'description', typography: { 's:all': 'body-small' } },
      e6: { name: 'indicator', iconSize: { 's:all': 's:sm:1' } },
      e7: { name: 'separator', separator: { 's:all': 'subtle' } }
    }
  };
}

describe('Dropdown component contract', () => {
  it('accepts the shared seven-element visual topology', () => {
    expect(validateDropdownComponentContract(createDropdown())).toEqual([]);
  });

  it('requires every visual element', () => {
    const dropdown = createDropdown() as any;
    delete dropdown.elements.e5;

    expect(validateDropdownComponentContract(dropdown)).toContain(
      'components.dropdown.elements.e5: required element'
    );
  });

  it('accepts only neutral or destructive at medium emphasis', () => {
    const dropdown = createDropdown() as any;
    dropdown.elements.e2.palettes = {
      default: {
        light: {
          onSubtle: {
            boxColor: {
              positive: { medium: { rest: '#ffffff' } },
              neutral: { high: { rest: '#ffffff' } }
            }
          }
        }
      }
    };

    expect(validateDropdownComponentContract(dropdown)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('.positive: unrecognized Dropdown intent'),
        expect.stringContaining('.neutral.high: expected "medium" emphasis')
      ])
    );
  });

  it('rejects icon-size references outside icon slots', () => {
    const dropdown = createDropdown() as any;
    dropdown.elements.e2.iconSize = { 's:all': 's:md:1' };

    expect(validateDropdownComponentContract(dropdown)).toContain(
      'components.dropdown.elements.e2.iconSize: not allowed for this element'
    );
  });

  it('requires the shared separator reference on the separator slot', () => {
    const dropdown = createDropdown() as any;
    delete dropdown.elements.e7.separator;

    expect(validateDropdownComponentContract(dropdown)).toContain(
      'components.dropdown.elements.e7.separator: required reference'
    );
  });
});
