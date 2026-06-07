import type { Color, ElementPalettes } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { convertElementColorsToStyleKeys } from './convertElementColorsToStyleKeys.ts';

/*------------------------------------------------------------------------------------------------*/
/* There is no error handling here; errors were handled during the style key to CSS conversion in
/*   phase 4
/*------------------------------------------------------------------------------------------------*/

describe('convertElementColorsToStyleKeys', () => {
  it('generates style keys for palette property without reference', (): void => {
    const elementPalettes: ElementPalettes = {
      default: {
        light: {
          boxColor: {
            primary: {
              medium: { rest: [45, 100, 50, 1] }
            }
          }
        }
      }
    };
    const result = convertElementColorsToStyleKeys(elementPalettes);
    expect(result.styleKeys).toEqual({
      default: {
        light: {
          primary: {
            rest: ['boxColor__[45,100,50,1]']
          }
        }
      }
    });
  });

  it('generates style keys for palette property with a reference value', (): void => {
    const elementPalettes: ElementPalettes = {
      default: {
        light: {
          borderColor: {
            primary: {
              medium: {
                rest: [255, 255, 255, 1],
                hover: { ref: [255, 255, 255, 0.1] }
              }
            }
          }
        }
      }
    };
    const result = convertElementColorsToStyleKeys(elementPalettes);
    expect(result.styleKeys).toEqual({
      default: {
        light: {
          primary: {
            rest: ['borderColor__[255,255,255,1]'],
            hover: ['borderColor==hover__[255,255,255,0.1]']
          }
        }
      }
    });
  });

  it('generates style keys for multiple palette entries', (): void => {
    const elementPalettes: ElementPalettes = {
      default: {
        light: {
          textColor: {
            primary: {
              medium: {
                rest: [120, 50, 50, 1],
                hover: { ref: [240, 50, 50, 0.5] }
              }
            },
            secondary: {
              medium: {
                rest: [240, 50, 50, 0.5]
              }
            }
          },
          borderColor: {
            primary: {
              medium: {
                rest: [120, 50, 50, 1]
              }
            },
            redLike: {
              medium: {
                rest: [0, 0, 0, 0.02],
                focus: { ref: [10, 20, 30, 0.1] }
              }
            }
          }
        }
      }
    };
    const result = convertElementColorsToStyleKeys(elementPalettes);
    expect(result.styleKeys).toEqual({
      default: {
        light: {
          primary: {
            rest: ['textColor__[120,50,50,1]', 'borderColor__[120,50,50,1]'],
            hover: ['textColor==hover__[240,50,50,0.5]']
          },
          secondary: {
            rest: ['textColor__[240,50,50,0.5]']
          },
          redLike: {
            rest: ['borderColor__[0,0,0,0.02]'],
            focus: ['borderColor==focus__[10,20,30,0.1]']
          }
        }
      }
    });
  });

  it('throws when using legacy direct interaction-state map at property root (no emphasis)', (): void => {
    const elementPalettes: ElementPalettes = {
      default: {
        light: {
          // Legacy direct interaction‐state map at property level (invalid now)
          boxColor: {
            rest: [0, 128, 255, 1],
            hover: { ref: [0, 128, 255, 0.5] }
          } as any
        }
      }
    };
    expect(() => convertElementColorsToStyleKeys(elementPalettes)).toThrowError(
      /no longer supported|must define high\/medium\/low\/lowest/i
    );
  });

  it('handles selected submap: emits selected/rest and selected:hover keys', (): void => {
    const elementPalettes: ElementPalettes = {
      default: {
        light: {
          boxColor: {
            primary: {
              medium: {
                rest: [10, 20, 30, 0.9],
                hover: [15, 25, 35, 0.9],
                selected: {
                  rest: [200, 50, 50, 1],
                  hover: { ref: [210, 55, 55, 0.8] }
                },
                disabled: [0, 0, 50, 0.5]
              }
            }
          }
        }
      }
    };

    const result = convertElementColorsToStyleKeys(elementPalettes);

    expect(result.styleKeys).toEqual({
      default: {
        light: {
          primary: {
            rest: ['boxColor__[10,20,30,0.9]'],
            hover: ['boxColor--hover__[15,25,35,0.9]'],
            'selected:rest': ['boxColor--selected:rest__[200,50,50,1]'],
            'selected:hover': ['boxColor==selected:hover__[210,55,55,0.8]'],
            disabled: ['boxColor--disabled__[0,0,50,0.5]']
          }
        }
      }
    });
  });
});

describe('convertElementColorsToStyleKeys – invalid inputs', () => {
  it('throws when rest is provided as a reference object (rest > ref)', (): void => {
    // Although TypeScript typing forbids rest to be a reference (ColorValue),
    // we cast to any to simulate a runtime-invalid schema and assert current behavior.
    const elementPalettes = {
      default: {
        light: {
          boxColor: {
            primary: {
              medium: {
                rest: { ref: [10, 20, 30, 0.5] } as unknown as Color
              }
            }
          }
        }
      }
    };

    // Current behavior: convertElementColorsToStyleKeys will detect a ref at "rest" and
    // call buildStyleKey with isRef=true and interactionState='rest', which throws.
    expect(() => convertElementColorsToStyleKeys(elementPalettes)).toThrowError(
      /isRef=true.*non-'rest' interaction state/i
    );
  });
});
