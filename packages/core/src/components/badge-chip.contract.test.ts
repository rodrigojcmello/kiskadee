import { describe, expect, it } from 'vitest';
import { validateBadgeComponentContract } from './badge.ts';
import { validateChipComponentContract } from './chip.ts';

function palette(
  color: 'boxColor' | 'borderColor' | 'textColor',
  states: Record<string, string> = { rest: '#000000' },
  intent = 'neutral'
) {
  return {
    default: {
      light: {
        onSubtle: {
          [color]: { [intent]: { medium: states } }
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
        scales: {
          boxHeight: { 's:md:1': 20 },
          borderRadius: { pill: 999 }
        },
        palettes: palette('boxColor', states, 'attention')
      },
      e2: {
        name: 'badge-content',
        typography: { 's:md:1': 'body-medium' },
        palettes: palette('textColor', states, 'attention')
      },
      e3: {
        name: 'badge-full-bleed-mark',
        iconSize: { 's:md:1': 's:md:1' },
        scales: { borderRadius: { pill: 999 } },
        palettes: palette('textColor', states, 'attention')
      },
      e4: {
        name: 'badge-contained-mark-icon',
        iconSize: { 's:md:1': 's:sm:1' },
        palettes: palette('textColor', states, 'attention')
      },
      e5: {
        name: 'badge-dot-surface',
        scales: {
          boxHeight: { 's:sm:3': 6 },
          boxWidth: { 's:sm:3': 6 },
          borderRadius: { pill: 999 }
        },
        palettes: palette('boxColor', states, 'attention')
      },
      e6: {
        name: 'badge-separation-ring',
        decorations: { borderStyle: 'solid' },
        scales: {
          borderWidth: { 's:md:1': 2 },
          borderRadius: { pill: 999 }
        },
        palettes: {
          default: {
            light: {
              onSubtle: {
                boxColor: { attention: { medium: states ?? { rest: '#ffffff' } } },
                borderColor: { attention: { medium: states ?? { rest: '#ffffff' } } }
              }
            }
          }
        }
      }
    }
  };
}

function badgeShadow() {
  return {
    shadow: {
      e5: { kind: 'outer', states: { rest: 's:sm:1' } }
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
        scales: {
          paddingLeft: { 's:md:1': 2 },
          paddingRight: { 's:md:1': 2 }
        },
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

  it('accepts only a static Rest outer-shadow recipe on the Badge Dot surface', () => {
    const value = badge() as ReturnType<typeof badge> & { effects?: unknown };
    value.effects = badgeShadow();
    expect(validateBadgeComponentContract(value)).toEqual([]);

    const invalid = badge() as ReturnType<typeof badge> & { effects?: unknown };
    invalid.effects = {
      shadow: {
        e2: { kind: 'outer', states: { rest: 's:sm:1' } },
        e3: { kind: 'outer', states: { rest: 's:sm:1' } },
        e5: {
          kind: 'inner',
          states: { rest: 'unknown', hover: 's:md:1' },
          fixedLevels: ['s:sm:1']
        }
      }
    };

    expect(validateBadgeComponentContract(invalid)).toEqual(
      expect.arrayContaining([
        'components.badge.effects.shadow.e2: unrecognized key',
        'components.badge.effects.shadow.e3: unrecognized key',
        'components.badge.effects.shadow.e5.kind: expected "outer"',
        'components.badge.effects.shadow.e5.states.hover: unrecognized key',
        'components.badge.effects.shadow.e5.fixedLevels: unrecognized key',
        'components.badge.effects.shadow.e5.states.rest: expected element size value'
      ])
    );
  });

  it('keeps textual Badge width structural and rejects an authored boxWidth', () => {
    const withWidth = badge();
    (withWidth.elements.e1.scales as Record<string, unknown>).boxWidth = { 's:md:1': 20 };

    expect(validateBadgeComponentContract(withWidth)).toEqual(
      expect.arrayContaining([
        expect.stringContaining('components.badge.elements.e1.scales.boxWidth: unrecognized key')
      ])
    );
  });

  it('allows an absent separation ring, accepts neutral, and rejects removed Badge intents', () => {
    const withoutRing = badge();
    delete (withoutRing.elements as Partial<typeof withoutRing.elements>).e6;
    expect(validateBadgeComponentContract(withoutRing)).toEqual([]);

    const withNeutral = badge();
    withNeutral.elements.e1.palettes = palette('boxColor', undefined, 'neutral');
    expect(validateBadgeComponentContract(withNeutral)).toEqual([]);

    const withRemovedIntent = badge();
    withRemovedIntent.elements.e1.palettes = palette('boxColor', undefined, 'informative');
    expect(validateBadgeComponentContract(withRemovedIntent)).toEqual(
      expect.arrayContaining([expect.stringContaining('.informative: unrecognized intent')])
    );
  });

  it('keeps Lowest in the Badge contract vocabulary even when a preset omits it', () => {
    const withLowest = badge();
    (withLowest.elements.e1 as { palettes: unknown }).palettes = {
      default: {
        light: {
          onSubtle: {
            boxColor: { attention: { lowest: { rest: '#000000' } } }
          }
        }
      }
    };

    expect(validateBadgeComponentContract(withLowest)).toEqual([]);
  });

  it('accepts independent backing and border colors on the Badge separation element', () => {
    const value = badge();

    expect(validateBadgeComponentContract(value)).toEqual([]);
    expect(value.elements.e6.palettes.default.light.onSubtle).toHaveProperty('boxColor');
    expect(value.elements.e6.palettes.default.light.onSubtle).toHaveProperty('borderColor');
  });

  it('accepts Chip interaction states and serialized surface output', () => {
    expect(validateChipComponentContract(chip())).toEqual([]);
  });

  it('limits Chip label geometry to authored inline padding', () => {
    const value = chip();
    (value.elements.e3.scales as Record<string, unknown>).marginLeft = { 's:md:1': 2 };

    expect(validateChipComponentContract(value)).toEqual(
      expect.arrayContaining(['components.chip.elements.e3.scales.marginLeft: unrecognized key'])
    );
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
