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
      e7: { name: 'separator', separator: { 's:all': 'subtle' } },
      e8: { name: 'end-text', typography: { 's:all': 'body-small' } },
      e9: { name: 'group-label', typography: { 's:all': 'body-small-strong' } },
      e10: { name: 'checkmark', iconSize: { 's:all': 's:md:1' } }
    }
  };
}

describe('Dropdown component contract', () => {
  it('accepts the shared topology without the optional scroll affordance', () => {
    expect(validateDropdownComponentContract(createDropdown())).toEqual([]);
  });

  it('accepts the optional scroll affordance only with icon size and owned palettes', () => {
    const dropdown = createDropdown() as any;
    dropdown.elements.e11 = {
      name: 'scroll-affordance',
      iconSize: { 's:all': 's:md:1' },
      palettes: {}
    };
    expect(validateDropdownComponentContract(dropdown)).toEqual([]);

    delete dropdown.elements.e11.iconSize;
    dropdown.elements.e11.scales = { paddingTop: 2 };
    expect(validateDropdownComponentContract(dropdown)).toEqual(
      expect.arrayContaining([
        'components.dropdown.elements.e11.iconSize: required reference',
        'components.dropdown.elements.e11.scales: not allowed for this element'
      ])
    );
  });

  it('accepts only supported component-level presence defaults', () => {
    const dropdown = createDropdown() as any;
    dropdown.effects.presence = { profile: 'fade-translate' };
    expect(validateDropdownComponentContract(dropdown)).toEqual([]);

    dropdown.effects.presence = { profile: 'zoom' };
    expect(validateDropdownComponentContract(dropdown)).toContain(
      'components.dropdown.effects.presence.profile: unsupported profile'
    );
  });

  it('requires every visual element', () => {
    const dropdown = createDropdown() as any;
    delete dropdown.elements.e5;

    expect(validateDropdownComponentContract(dropdown)).toContain(
      'components.dropdown.elements.e5: required element'
    );
  });

  it.each(['e8', 'e9', 'e10'] as const)('requires rich-menu slot %s', (elementName) => {
    const dropdown = createDropdown() as any;
    delete dropdown.elements[elementName];

    expect(validateDropdownComponentContract(dropdown)).toContain(
      `components.dropdown.elements.${elementName}: required element`
    );
  });

  it('accepts item rhythm, text inset and trailing spacing only in their owning slots', () => {
    const dropdown = createDropdown() as any;
    dropdown.elements.e2.scales = { marginBottom: 2 };
    dropdown.elements.e4.scales = { paddingLeft: 2, paddingRight: 2 };
    dropdown.elements.e5.scales = { paddingLeft: 2, paddingRight: 2 };
    dropdown.elements.e6.scales = { paddingLeft: 4 };
    dropdown.elements.e8.scales = { paddingLeft: 6, paddingRight: 6 };
    dropdown.elements.e9.scales = {
      paddingTop: 8,
      paddingRight: 6,
      paddingBottom: 8,
      paddingLeft: 6,
      marginLeft: 6
    };

    expect(validateDropdownComponentContract(dropdown)).toEqual([]);

    dropdown.elements.e8.scales.marginBottom = 2;
    expect(validateDropdownComponentContract(dropdown)).toContain(
      'components.dropdown.elements.e8.scales.marginBottom: unrecognized key'
    );

    dropdown.elements.e8.scales = {};
    dropdown.elements.e6.scales.paddingRight = 4;
    expect(validateDropdownComponentContract(dropdown)).toContain(
      'components.dropdown.elements.e6.scales.paddingRight: unrecognized key'
    );
  });

  it('keeps the checkmark gap authored through the canonical paddingRight scale', () => {
    const dropdown = createDropdown() as any;
    dropdown.elements.e10.scales = { paddingRight: 4 };

    expect(validateDropdownComponentContract(dropdown)).toEqual([]);

    dropdown.elements.e10.scales.paddingLeft = 4;
    expect(validateDropdownComponentContract(dropdown)).toContain(
      'components.dropdown.elements.e10.scales.paddingLeft: unrecognized key'
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
