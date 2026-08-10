import { describe, expect, it } from 'vitest';
import {
  getSchemaTypographyContractIssues,
  validateElementTypographyContract,
  validateSchemaTypographyContract,
  validateSchemaTypographyDefinitionContract
} from './typography.contract.zod.ts';

function createProfile(
  textFont: 'body' | 'heading' | 'code' = 'body',
  textWeight: 'normal' | 'semiBold' | 'bold' = 'normal',
  textSize = 16
) {
  return {
    decorations: {
      textFont,
      textWeight
    },
    scales: {
      textSize,
      textHeight: textSize + 4,
      textLetterSpacing: -0.1
    }
  };
}

describe('typography contract', () => {
  it('accepts independent profiles with nested decorations and scales', () => {
    expect(
      validateSchemaTypographyDefinitionContract({
        profiles: {
          'body-medium': createProfile(),
          'body-medium-strong': createProfile('body', 'semiBold')
        }
      })
    ).toEqual([]);
  });

  it('rejects exact duplicate profiles and identifies the original profile', () => {
    expect(
      validateSchemaTypographyDefinitionContract({
        profiles: {
          'body-medium': createProfile(),
          'paragraph-medium': createProfile()
        }
      })
    ).toEqual([
      'global.typography.profiles.paragraph-medium: duplicates typography profile "body-medium"'
    ]);
  });

  it('accepts equal metrics when font role, weight, or tracking presence differs', () => {
    const withoutTracking = createProfile();
    delete (withoutTracking.scales as Partial<typeof withoutTracking.scales>).textLetterSpacing;

    expect(
      validateSchemaTypographyDefinitionContract({
        profiles: {
          'body-medium': withoutTracking,
          'heading-medium': {
            ...withoutTracking,
            decorations: { ...withoutTracking.decorations, textFont: 'heading' }
          },
          'body-medium-strong': {
            ...withoutTracking,
            decorations: { ...withoutTracking.decorations, textWeight: 'semiBold' }
          },
          'body-medium-tracked': {
            ...withoutTracking,
            scales: { ...withoutTracking.scales, textLetterSpacing: 0 }
          }
        }
      })
    ).toEqual([]);
  });

  it('accepts omitted, zero, negative, and positive letter spacing', () => {
    const withoutTracking = createProfile();
    delete (withoutTracking.scales as Partial<typeof withoutTracking.scales>).textLetterSpacing;

    expect(
      validateSchemaTypographyDefinitionContract({
        profiles: {
          'tracking-omitted': withoutTracking,
          'tracking-zero': {
            ...createProfile(),
            scales: { ...createProfile().scales, textLetterSpacing: 0 }
          },
          'tracking-negative': {
            ...createProfile(),
            scales: { ...createProfile().scales, textLetterSpacing: -0.5 }
          },
          'tracking-positive': {
            ...createProfile(),
            scales: { ...createProfile().scales, textLetterSpacing: 0.5 }
          }
        }
      })
    ).toEqual([]);
  });

  it('rejects empty catalogs, invalid ids, invalid metrics, and non-finite tracking', () => {
    expect(validateSchemaTypographyDefinitionContract({ profiles: {} })).toEqual([
      'global.typography.profiles: expected at least one profile'
    ]);

    expect(
      validateSchemaTypographyDefinitionContract({
        profiles: {
          BodyMedium: createProfile()
        }
      })
    ).toEqual([expect.stringContaining('lowercase kebab-case typography profile id')]);

    const issues = validateSchemaTypographyDefinitionContract({
      profiles: {
        'body-medium': {
          decorations: {
            textFont: 'body',
            textWeight: 'normal'
          },
          scales: {
            textSize: 0,
            textHeight: Number.POSITIVE_INFINITY,
            textLetterSpacing: Number.NaN
          }
        }
      }
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('textSize'),
        expect.stringContaining('textHeight'),
        expect.stringContaining('textLetterSpacing')
      ])
    );
  });

  it('enforces exclusive s:all and a bp:all base for responsive references', () => {
    expect(
      validateElementTypographyContract({
        's:all': 'body-medium',
        's:md:1': 'body-medium'
      })
    ).toEqual(['typography.s:all: "s:all" cannot be combined with another size']);

    expect(
      validateElementTypographyContract({
        's:all': 'body-medium',
        's:sm:1': undefined
      })
    ).toEqual([]);

    expect(
      validateElementTypographyContract({
        's:all': undefined
      })
    ).toEqual(['typography: expected at least one size reference']);

    expect(
      validateElementTypographyContract({
        's:md:1': {
          'bp:lg:1': 'body-large'
        }
      })
    ).toEqual([expect.stringContaining('typography.s:md:1.bp:all')]);
  });

  it('validates references, declared breakpoints, and responsive family/weight invariants', () => {
    const schema = {
      breakpoints: {
        'bp:all': 0
      },
      global: {
        typography: {
          profiles: {
            'body-medium': createProfile(),
            'heading-large': createProfile('heading', 'bold', 20)
          }
        }
      },
      components: {
        button: {
          elements: {
            e2: {
              typography: {
                's:md:1': {
                  'bp:all': 'body-medium',
                  'bp:lg:1': 'heading-large',
                  'bp:lg:2': 'missing-profile'
                }
              }
            }
          }
        }
      }
    };

    const issues = getSchemaTypographyContractIssues(schema);
    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('bp:lg:1: breakpoint "bp:lg:1" is not declared'),
        expect.stringContaining('bp:lg:1: responsive typography must preserve textFont "body"'),
        expect.stringContaining('bp:lg:1: responsive typography must preserve textWeight "normal"'),
        expect.stringContaining('bp:lg:2: references unknown typography profile "missing-profile"')
      ])
    );
  });

  it('rejects raw typography properties alongside a profile reference', () => {
    const issues = getSchemaTypographyContractIssues({
      breakpoints: {
        'bp:all': 0
      },
      global: {
        typography: {
          profiles: {
            'body-medium': createProfile()
          }
        }
      },
      components: {
        button: {
          elements: {
            e2: {
              typography: {
                's:all': 'body-medium'
              },
              decorations: {
                textFont: 'body',
                textWeight: 'normal'
              },
              scales: {
                textSize: 16,
                textHeight: 20,
                textLetterSpacing: 0
              }
            }
          }
        }
      }
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.stringContaining('decorations.textFont: cannot be authored together'),
        expect.stringContaining('decorations.textWeight: cannot be authored together'),
        expect.stringContaining('scales.textSize: cannot be authored together'),
        expect.stringContaining('scales.textHeight: cannot be authored together'),
        expect.stringContaining('scales.textLetterSpacing: cannot be authored together')
      ])
    );
  });

  it('accepts a valid responsive sequence and throws on invalid schema contracts', () => {
    const validSchema = {
      breakpoints: {
        'bp:all': 0,
        'bp:lg:1': 1152
      },
      global: {
        typography: {
          profiles: {
            'body-medium': createProfile(),
            'body-large': createProfile('body', 'normal', 20)
          }
        }
      },
      components: {
        button: {
          elements: {
            e2: {
              typography: {
                's:md:1': {
                  'bp:all': 'body-medium',
                  'bp:lg:1': 'body-large'
                }
              }
            }
          }
        }
      }
    };

    expect(() => validateSchemaTypographyContract(validSchema)).not.toThrow();
    expect(() =>
      validateSchemaTypographyContract({
        breakpoints: { 'bp:all': 0 },
        components: validSchema.components
      })
    ).toThrow('global.typography: required');
  });
});
