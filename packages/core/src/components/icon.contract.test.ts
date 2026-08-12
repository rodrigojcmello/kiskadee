import { describe, expect, it } from 'vitest';
import { validateIconComponentContract } from './icon.ts';

function createIcon() {
  return {
    elements: {
      e1: {
        name: 'glyph',
        iconSize: {
          's:sm:1': 's:sm:1',
          's:md:1': 's:md:1',
          's:lg:1': 's:lg:1'
        },
        palettes: {
          default: {
            light: {
              onSubtle: {
                textColor: {
                  neutral: { medium: { rest: '#202020' } },
                  primary: { medium: { rest: '#0064b4' } }
                }
              },
              onVivid: {
                textColor: {
                  neutral: { medium: { rest: '#ffffff' } },
                  primary: { medium: { rest: '#ffffff' } }
                }
              }
            }
          }
        }
      }
    }
  };
}

describe('Icon component contract', () => {
  it('accepts the canonical glyph, scale, palette and accessibility-independent shape', () => {
    expect(validateIconComponentContract(createIcon())).toEqual([]);
  });

  it('rejects extra elements, options, invalid icon sizes and non-rest color branches', () => {
    const icon = createIcon() as any;
    icon.options = { decorative: true };
    icon.elements.e2 = { name: 'label' };
    icon.elements.e1.iconSize['s:all'] = 's:lg:5';
    icon.elements.e1.palettes.default.light.onSubtle.textColor.warning = {
      medium: { rest: '#ffff00' }
    };
    icon.elements.e1.palettes.default.light.onSubtle.textColor.neutral.high = {
      rest: '#202020'
    };
    icon.elements.e1.palettes.default.light.onSubtle.textColor.primary.medium.hover = '#005a9e';
    icon.elements.e1.palettes.default.light.onSubtle.textColor.primary.medium.active = '#004578';

    expect(validateIconComponentContract(icon)).toEqual(
      expect.arrayContaining([
        'components.icon.options: unrecognized key',
        'components.icon.elements.e2: unrecognized key',
        'components.icon.elements.e1.iconSize.s:all: "s:all" cannot be combined with another size',
        expect.stringContaining('.warning: unrecognized intent'),
        expect.stringContaining('.neutral.high: unrecognized emphasis'),
        expect.stringContaining('.primary.medium.hover: unrecognized state'),
        expect.stringContaining('.primary.medium.active: unrecognized state')
      ])
    );
  });
});
