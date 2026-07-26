import { describe, expect, it } from 'vitest';
import { surfaceContextBuckets } from '../types/colors/colors.types.ts';
import { getElementPaletteValidationIssues } from './palettes.ts';

const state = {
  rest: '#123456',
  hover: '#234567'
};

function validate(value: unknown) {
  return getElementPaletteValidationIssues(value, ['boxColor', 'borderColor']);
}

describe('surface-context palettes', () => {
  it('publishes stable compact artifact buckets', () => {
    expect(surfaceContextBuckets).toEqual({
      onSubtle: 's',
      onVivid: 'v'
    });
  });

  it('accepts onSubtle and onVivid with equal property, intent, and emphasis coverage', () => {
    expect(
      validate({
        default: {
          light: {
            onSubtle: {
              boxColor: {
                primary: {
                  high: state
                }
              }
            },
            onVivid: {
              boxColor: {
                primary: {
                  high: {
                    rest: '#ffffff'
                  }
                }
              }
            }
          }
        }
      })
    ).toEqual([]);
  });

  it('rejects the legacy theme-to-color shape', () => {
    const issues = validate({
      default: {
        light: {
          boxColor: {
            primary: {
              high: state
            }
          }
        }
      }
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['default', 'light', 'boxColor'],
          message: 'unrecognized surface context'
        }),
        expect.objectContaining({
          path: ['default', 'light', 'onSubtle'],
          message: 'required surface context'
        })
      ])
    );
  });

  it('rejects a missing onSubtle context and an unknown context', () => {
    const issues = validate({
      default: {
        light: {
          elevated: {
            boxColor: {
              primary: {
                high: state
              }
            }
          }
        }
      }
    });

    expect(issues).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          path: ['default', 'light', 'elevated'],
          message: 'unrecognized surface context'
        }),
        expect.objectContaining({
          path: ['default', 'light', 'onSubtle'],
          message: 'required surface context'
        })
      ])
    );
  });

  it('rejects incomplete onVivid coverage while allowing sparse states', () => {
    const issues = validate({
      default: {
        light: {
          onSubtle: {
            boxColor: {
              primary: {
                high: state,
                medium: state
              }
            }
          },
          onVivid: {
            boxColor: {
              primary: {
                high: {
                  rest: '#ffffff'
                }
              }
            }
          }
        }
      }
    });

    expect(issues).toContainEqual({
      path: ['default', 'light', 'onVivid', 'boxColor', 'primary', 'medium'],
      message: 'must cover the same property, intent, and emphasis as onSubtle'
    });
  });

  it('rejects onVivid coverage absent from onSubtle', () => {
    const issues = validate({
      default: {
        light: {
          onSubtle: {
            boxColor: {
              primary: {
                high: state
              }
            }
          },
          onVivid: {
            boxColor: {
              primary: {
                high: state,
                medium: state
              }
            }
          }
        }
      }
    });

    expect(issues).toContainEqual({
      path: ['default', 'light', 'onVivid', 'boxColor', 'primary', 'medium'],
      message: 'must not add a property, intent, or emphasis absent from onSubtle'
    });
  });

  it('requires rest for each declared emphasis', () => {
    const issues = validate({
      default: {
        light: {
          onSubtle: {
            boxColor: {
              primary: {
                high: {
                  hover: '#234567'
                }
              }
            }
          }
        }
      }
    });

    expect(issues).toContainEqual({
      path: ['default', 'light', 'onSubtle', 'boxColor', 'primary', 'high', 'rest'],
      message: 'required state'
    });
  });
});
