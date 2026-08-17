import { describe, expect, it } from 'vitest';
import { validateButtonComponentContract } from './button.ts';

function createButton(options?: unknown, includeIconRegion = false) {
  return {
    ...(options === undefined ? {} : { options }),
    elements: {
      e1: {
        name: 'button'
      },
      ...(includeIconRegion ? { e4: { name: 'button-icon-region' } } : {})
    }
  };
}

function createDivider() {
  return {
    name: 'button-divider',
    scales: {
      boxWidth: { 's:md:1': 1 },
      boxHeight: { 's:md:1': 20 }
    },
    palettes: {
      default: {
        light: {
          onSubtle: {
            boxColor: {
              neutral: { medium: { rest: '#dce0ed' } }
            }
          }
        }
      }
    }
  };
}

describe('Button component contract', () => {
  it('accepts logical icon layout defaults', () => {
    expect(
      validateButtonComponentContract(
        createButton({
          iconLayout: 'inline',
          iconPlacement: 'leading'
        })
      )
    ).toEqual([]);

    expect(
      validateButtonComponentContract(
        createButton({
          iconLayout: 'edge',
          iconPlacement: 'trailing'
        })
      )
    ).toEqual([]);
  });

  it('accepts surfaced icon corner policies when the icon region exists', () => {
    expect(
      validateButtonComponentContract(
        createButton(
          {
            iconSurfaceCorners: 'edge'
          },
          true
        )
      )
    ).toEqual([]);

    expect(
      validateButtonComponentContract(
        createButton(
          {
            iconSurfaceCorners: 'all'
          },
          true
        )
      )
    ).toEqual([]);
  });

  it('rejects unknown icon layout options and values', () => {
    expect(
      validateButtonComponentContract(
        createButton({
          iconLayout: 'stacked',
          iconPlacement: 'left',
          iconGap: 8
        })
      )
    ).toEqual([
      'components.button.options.iconGap: unrecognized key',
      'components.button.options.iconLayout: expected "inline" or "edge"',
      'components.button.options.iconPlacement: expected "leading" or "trailing"'
    ]);
  });

  it('rejects invalid or unsupported surfaced icon corner defaults', () => {
    expect(
      validateButtonComponentContract(
        createButton({
          iconSurfaceCorners: 'inner'
        })
      )
    ).toEqual([
      'components.button.options.iconSurfaceCorners: expected "edge" or "all"',
      'components.button.options.iconSurfaceCorners: surfaced corner defaults require components.button.elements.e4'
    ]);
  });

  it('accepts icon-size references only on the icon slot', () => {
    expect(
      validateButtonComponentContract({
        elements: {
          e1: { name: 'button' },
          e3: {
            name: 'button-icon',
            iconSize: { 's:md:1': 's:md:1' }
          }
        }
      })
    ).toEqual([]);

    expect(
      validateButtonComponentContract({
        elements: {
          e1: {
            name: 'button',
            iconSize: { 's:md:1': 's:md:1' }
          },
          e3: {
            name: 'button-icon',
            scales: { boxWidth: { 's:md:1': 20 } }
          }
        }
      })
    ).toEqual(
      expect.arrayContaining([
        'components.button.elements.e1.iconSize: not allowed for this element',
        'components.button.elements.e3.scales.boxWidth: unrecognized key'
      ])
    );
  });

  it('accepts the optional trailing disclosure slot', () => {
    expect(
      validateButtonComponentContract({
        elements: {
          e1: { name: 'button' },
          e5: {
            name: 'button-disclosure',
            iconSize: { 's:all': 's:sm:1' },
            scales: { paddingRight: 4 }
          }
        }
      })
    ).toEqual([]);
  });

  it('accepts Rest-only divider defaults when the divider slot exists', () => {
    expect(
      validateButtonComponentContract({
        options: {
          groupDivider: true,
          disclosureDivider: false
        },
        elements: {
          e1: { name: 'button' },
          e6: createDivider()
        }
      })
    ).toEqual([]);
  });

  it('keeps explicit Rest-only intent and emphasis overrides available', () => {
    const divider = createDivider();
    const boxColor = divider.palettes.default.light.onSubtle.boxColor as Record<string, unknown>;
    boxColor.primary = { high: { rest: '#123456' } };

    expect(
      validateButtonComponentContract({
        elements: {
          e1: { name: 'button' },
          e6: divider
        }
      })
    ).toEqual([]);
  });

  it('rejects legacy divider styling on the disclosure slot', () => {
    expect(
      validateButtonComponentContract({
        elements: {
          e1: { name: 'button' },
          e5: {
            name: 'button-disclosure',
            decorations: { borderStyle: 'solid' },
            scales: { borderWidth: 1 },
            palettes: {
              default: {
                light: {
                  onSubtle: {
                    borderColor: {
                      neutral: { medium: { rest: '#dce0ed' } }
                    }
                  }
                }
              }
            }
          }
        }
      })
    ).toEqual(
      expect.arrayContaining([
        'components.button.elements.e5.decorations: not allowed for this element',
        'components.button.elements.e5.scales.borderWidth: unrecognized key',
        'components.button.elements.e5.palettes.default.light.onSubtle.borderColor: unrecognized key'
      ])
    );
  });

  it('rejects non-Rest divider states and invalid divider geometry', () => {
    const divider = createDivider();
    divider.scales.boxWidth['s:md:1'] = 0;
    divider.palettes.default.light.onSubtle.boxColor.neutral.medium = {
      rest: '#dce0ed',
      hover: '#ffffff'
    } as never;

    expect(
      validateButtonComponentContract({
        elements: {
          e1: { name: 'button' },
          e6: divider
        }
      })
    ).toEqual(
      expect.arrayContaining([
        'components.button.elements.e6.scales.boxWidth.s:md:1: expected finite number greater than 0',
        'components.button.elements.e6.palettes.default.light.onSubtle.boxColor.neutral.medium.hover: only Rest is allowed for the Button divider'
      ])
    );
  });

  it('rejects a divider without any authored color', () => {
    const divider = createDivider();
    divider.palettes = {} as never;

    expect(
      validateButtonComponentContract({
        elements: {
          e1: { name: 'button' },
          e6: divider
        }
      })
    ).toEqual(
      expect.arrayContaining(['components.button.elements.e6.palettes: expected non-empty object'])
    );
  });

  it('rejects shadow and activation-feedback effects on the divider slot', () => {
    const divider = {
      ...createDivider(),
      effects: {
        shadow: {
          x: { rest: 0 },
          y: { rest: 1 },
          blur: { rest: 2 },
          color: { rest: '#000000' }
        },
        activationFeedback: 'opacity'
      }
    };

    expect(
      validateButtonComponentContract({
        elements: {
          e1: { name: 'button' },
          e6: divider
        }
      })
    ).toContain('components.button.elements.e6.effects: not allowed for the Button divider');
  });

  it('rejects enabled divider defaults without e6 and non-boolean option values', () => {
    expect(
      validateButtonComponentContract(
        createButton({
          groupDivider: true,
          disclosureDivider: 'yes'
        })
      )
    ).toEqual([
      'components.button.options.disclosureDivider: expected boolean',
      'components.button.options: enabled divider defaults require components.button.elements.e6'
    ]);
  });
});
