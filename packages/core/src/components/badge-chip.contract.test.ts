import { describe, expect, it } from 'vitest';
import { validateBadgeComponentContract } from './badge.ts';
import { validateChipComponentContract } from './chip.ts';

function palette(
  color: 'boxColor' | 'borderColor' | 'textColor',
  states: Record<string, string> = { rest: '#000000' }
) {
  return {
    default: {
      light: {
        onSubtle: {
          [color]: { neutral: { medium: states } }
        }
      }
    }
  };
}

function badge(states?: Record<string, string>) {
  return {
    elements: {
      e1: {
        name: 'badge-surface',
        scales: { boxHeight: { 's:md:1': 20 }, borderRadius: { pill: 999 } },
        palettes: palette('boxColor', states)
      },
      e2: {
        name: 'badge-label',
        typography: { 's:md:1': 'body-medium' },
        palettes: palette('textColor', states)
      },
      e3: {
        name: 'badge-icon',
        iconSize: { 's:md:1': 's:md:1' },
        palettes: palette('textColor', states)
      },
      e4: {
        name: 'badge-count',
        typography: { 's:md:1': 'body-medium' },
        palettes: palette('textColor', states)
      },
      e5: {
        name: 'badge-dot',
        scales: {
          boxHeight: { 's:sm:3': 6 },
          boxWidth: { 's:sm:3': 6 },
          borderRadius: { pill: 999 }
        },
        palettes: palette('boxColor', states)
      }
    }
  };
}

function chip() {
  return {
    contentSurfaceContext: {
      default: {
        light: {
          onSubtle: {
            neutral: { medium: { rest: 'inherit', selected: 'onVivid' } }
          }
        }
      }
    },
    elements: {
      e1: { name: 'chip-container' },
      e2: {
        name: 'chip-primary',
        scales: { boxHeight: { 's:md:1': 32 }, borderRadius: { rounded: 4 } },
        palettes: palette('boxColor', {
          rest: '#ffffff',
          hover: '#eeeeee',
          pressed: '#dddddd',
          focus: '#ffffff',
          selected: '#0064b4',
          disabled: '#cccccc'
        })
      },
      e3: {
        name: 'chip-label',
        typography: { 's:md:1': 'body-medium' },
        palettes: palette('textColor')
      },
      e4: {
        name: 'chip-icon',
        iconSize: { 's:md:1': 's:md:1' },
        palettes: palette('textColor')
      },
      e5: {
        name: 'chip-remove',
        scales: {
          marginLeft: { 's:md:1': 0 },
          borderWidth: { 's:md:1': 1 },
          borderRadius: { rounded: 4 }
        },
        palettes: palette('boxColor')
      },
      e6: {
        name: 'chip-remove-icon',
        iconSize: { 's:md:1': 's:sm:1' },
        palettes: palette('textColor')
      },
      e7: { name: 'chip-badge', scales: { marginLeft: { 's:md:1': 6 } } }
    }
  };
}

describe('Badge and Chip component contracts', () => {
  it('accepts the supported Badge anatomy and rejects interaction states', () => {
    expect(validateBadgeComponentContract(badge())).toEqual([]);
    expect(validateBadgeComponentContract(badge({ rest: '#000000', hover: '#111111' }))).toEqual(
      expect.arrayContaining([expect.stringContaining('.hover: unrecognized state')])
    );
  });

  it('accepts Chip interaction states and serialized surface output', () => {
    expect(validateChipComponentContract(chip())).toEqual([]);
  });

  it('rejects unknown Chip elements, states, and incomplete surface state maps', () => {
    const value = chip() as ReturnType<typeof chip> & Record<string, unknown>;
    (value.elements as Record<string, unknown>).e8 = { name: 'unknown' };
    const e2 = value.elements.e2 as typeof value.elements.e2;
    e2.palettes = palette('boxColor', { rest: '#ffffff', pending: '#eeeeee' });
    const map = value.contentSurfaceContext.default.light.onSubtle.neutral.medium as Record<
      string,
      unknown
    >;
    delete map.rest;

    expect(validateChipComponentContract(value)).toEqual(
      expect.arrayContaining([
        'components.chip.elements.e8: unrecognized key',
        expect.stringContaining('.pending: unrecognized state'),
        expect.stringContaining('.rest: required state')
      ])
    );
  });
});
