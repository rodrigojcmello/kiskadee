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
          onSubtle: {
            boxColor: {
              primary: {
                medium: { rest: '#ffbf00' }
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
          onSubtle: {
            primary: {
              rest: ['boxColor__#ffbf00']
            }
          }
        }
      }
    });
  });

  it('generates style keys for palette property with a reference value', (): void => {
    const elementPalettes: ElementPalettes = {
      default: {
        light: {
          onSubtle: {
            borderColor: {
              primary: {
                medium: {
                  rest: '#ffffff',
                  hover: { ref: '#ffffff1a' }
                }
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
          onSubtle: {
            primary: {
              rest: ['borderColor__#ffffff'],
              hover: ['borderColor==hover__#ffffff1a']
            }
          }
        }
      }
    });
  });

  it('generates style keys for multiple palette entries', (): void => {
    const elementPalettes: ElementPalettes = {
      default: {
        light: {
          onSubtle: {
            textColor: {
              primary: {
                medium: {
                  rest: '#40bf40',
                  hover: { ref: '#4040bf80' }
                }
              },
              secondary: {
                medium: {
                  rest: '#4040bf80'
                }
              }
            },
            borderColor: {
              primary: {
                medium: {
                  rest: '#40bf40'
                }
              },
              redLike: {
                medium: {
                  rest: '#00000005',
                  focus: { ref: '#5c423d1a' }
                }
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
          onSubtle: {
            primary: {
              rest: ['textColor__#40bf40', 'borderColor__#40bf40'],
              hover: ['textColor==hover__#4040bf80']
            },
            secondary: {
              rest: ['textColor__#4040bf80']
            },
            redLike: {
              rest: ['borderColor__#00000005'],
              focus: ['borderColor==focus__#5c423d1a']
            }
          }
        }
      }
    });
  });

  it('throws when using legacy direct interaction-state map at property root (no emphasis)', (): void => {
    const elementPalettes: ElementPalettes = {
      default: {
        light: {
          onSubtle: {
            // Legacy direct interaction‐state map at property level (invalid now)
            boxColor: {
              rest: '#90484484',
              hover: { ref: '#9048448480' }
            } as any
          }
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
          onSubtle: {
            boxColor: {
              primary: {
                medium: {
                  rest: '#5c423de6',
                  hover: '#704e43e6',
                  selected: {
                    rest: '#4095bf',
                    hover: { ref: '#4d8ccbcc' }
                  },
                  disabled: '#80808080'
                }
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
          onSubtle: {
            primary: {
              rest: ['boxColor__#5c423de6'],
              hover: ['boxColor--hover__#704e43e6'],
              'selected:rest': ['boxColor--selected:rest__#4095bf'],
              'selected:hover': ['boxColor==selected:hover__#4d8ccbcc'],
              disabled: ['boxColor--disabled__#80808080']
            }
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
          onSubtle: {
            boxColor: {
              primary: {
                medium: {
                  rest: { ref: '#5c423d80' } as unknown as Color
                }
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
