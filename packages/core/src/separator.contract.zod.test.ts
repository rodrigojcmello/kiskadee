import { describe, expect, it } from 'vitest';
import {
  getSchemaSeparatorsContractIssues,
  validateElementSeparatorContract,
  validateSchemaSeparatorsDefinitionContract
} from './separator.contract.zod.ts';

function palettes(color = '#d1d1d1') {
  return {
    default: {
      light: {
        onSubtle: {
          boxColor: {
            neutral: {
              medium: { rest: color }
            }
          }
        }
      }
    }
  };
}

describe('separator contract', () => {
  it('accepts a neutral profile and responsive element references', () => {
    expect(
      validateSchemaSeparatorsDefinitionContract({
        profiles: {
          subtle: { scales: { boxWidth: 1 }, palettes: palettes() }
        }
      })
    ).toEqual([]);

    expect(
      validateElementSeparatorContract({
        's:md:1': {
          'bp:all': 'subtle',
          'bp:lg:1': 'solid'
        }
      })
    ).toEqual([]);
  });

  it('rejects invalid IDs, empty catalogs, non-positive widths and exact duplicates', () => {
    expect(validateSchemaSeparatorsDefinitionContract({ profiles: {} })).toContain(
      'global.separators.profiles: expected at least one profile'
    );

    const issues = validateSchemaSeparatorsDefinitionContract({
      profiles: {
        Subtle: { scales: { boxWidth: 0 }, palettes: palettes() },
        duplicate: { palettes: palettes(), scales: { boxWidth: 0 } }
      }
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('expected a lowercase kebab-case separator profile id'),
        expect.stringContaining('boxWidth: Too small'),
        expect.stringContaining('duplicates separator profile "Subtle"')
      ])
    );
  });

  it('enforces the neutral medium Rest-only palette vocabulary', () => {
    const issues = validateSchemaSeparatorsDefinitionContract({
      profiles: {
        subtle: {
          scales: { boxWidth: 1 },
          palettes: {
            default: {
              light: {
                onSubtle: {
                  boxColor: {
                    primary: { low: { hover: '#ffffff' } }
                  }
                }
              }
            }
          }
        }
      }
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('.boxColor.primary: unrecognized intent'),
        expect.stringContaining('.boxColor.neutral: required intent')
      ])
    );
  });

  it('validates references, breakpoints, palette invariance and local conflicts', () => {
    const issues = getSchemaSeparatorsContractIssues({
      breakpoints: {
        'bp:all': 0,
        'bp:lg:1': 1152
      },
      global: {
        separators: {
          profiles: {
            subtle: { scales: { boxWidth: 1 }, palettes: palettes('#dddddd') },
            thick: { scales: { boxWidth: 2 }, palettes: palettes('#dddddd') },
            contrast: { scales: { boxWidth: 2 }, palettes: palettes('#111111') }
          }
        }
      },
      components: {
        dropdown: {
          elements: {
            e7: {
              separator: {
                's:md:1': {
                  'bp:all': 'subtle',
                  'bp:lg:1': 'thick',
                  'bp:lg:4': 'contrast'
                }
              },
              scales: { boxWidth: 8 },
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      boxColor: { neutral: { medium: { rest: '#ffffff' } } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('scales.boxWidth: cannot be authored together'),
        expect.stringContaining('.boxColor: cannot be authored together'),
        expect.stringContaining('breakpoint "bp:lg:4" is not declared'),
        expect.stringContaining('must preserve the palettes from "subtle"')
      ])
    );
  });

  it('reports missing catalogs and unknown profiles', () => {
    expect(
      getSchemaSeparatorsContractIssues({
        breakpoints: { 'bp:all': 0 },
        components: {
          separator: {
            elements: {
              e1: { separator: { 's:all': 'subtle' } }
            }
          }
        }
      })
    ).toContain('global.separators: required when component elements reference separator profiles');

    expect(
      getSchemaSeparatorsContractIssues({
        breakpoints: { 'bp:all': 0 },
        global: {
          separators: {
            profiles: {
              subtle: { scales: { boxWidth: 1 }, palettes: palettes() }
            }
          }
        },
        components: {
          separator: {
            elements: {
              e1: { separator: { 's:all': 'missing' } }
            }
          }
        }
      })
    ).toContain(
      'components.separator.elements.e1.separator.s:all: references unknown separator profile "missing"'
    );
  });
});
