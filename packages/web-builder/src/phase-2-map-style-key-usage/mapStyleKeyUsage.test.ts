import type { ComponentStyleKeyMap } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy.ts';
import { mapStyleKeyUsage, type StyleKeyUsageMap } from './mapStyleKeyUsage.ts';

describe('mapStyleKeyUsage', () => {
  it('returns empty object for empty input', () => {
    const input = {} as ComponentStyleKeyMap;
    const result = mapStyleKeyUsage(input);
    expect(result).toEqual({});
  });

  it('counts decorations correctly', () => {
    const input = {
      Button: {
        Main: {
          decorations: ['keyA', 'keyB', 'keyA']
        }
      }
    } as ComponentStyleKeyMap;
    const result = mapStyleKeyUsage(input);
    const expected: StyleKeyUsageMap = {
      keyA: 2,
      keyB: 1
    };
    expect(result).toEqual(expected);
  });

  it('counts effects and scales correctly across multiple elements', () => {
    const input = {
      ComponentX: {
        Element1: {
          effects: {
            hover: ['e1', 'e2', 'e1'],
            active: ['e2']
          }
        },
        Element2: {
          scales: {
            small: ['s1', 's2'],
            large: ['s1']
          }
        }
      }
    } as ComponentStyleKeyMap;

    const result = mapStyleKeyUsage(input);
    const expected: StyleKeyUsageMap = {
      e1: 2,
      e2: 2,
      s1: 2,
      s2: 1
    };
    expect(result).toEqual(expected);

    const keys = Object.keys(result);
    expect(keys).toEqual(['e1', 'e2', 's1', 's2']);
  });

  it('counts later elements when the first eN element is empty', () => {
    const input = {
      textField: {
        standard: {
          outline: {
            e1: {},
            e3: {
              scales: {
                's:md:1': ['boxHeight__40', 'paddingLeft__12']
              }
            },
            e4: {
              decorations: ['textWeight__regular']
            }
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const result = mapStyleKeyUsage(input);

    expect(result).toEqual({
      boxHeight__40: 1,
      paddingLeft__12: 1,
      textWeight__regular: 1
    });
  });

  it('counts nested palettes correctly', () => {
    const input = {
      PaletteComponent: {
        Root: {
          palettes: {
            ios: {
              light: {
                default: {
                  primary: {
                    rest: ['pA', 'pB', 'pA'],
                    disabled: ['pC']
                  },
                  secondary: {
                    hover: ['pB']
                  }
                },
                inverse: {
                  primary: {
                    rest: ['pE']
                  }
                }
              },
              dark: {
                default: {
                  primary: {
                    rest: ['pD']
                  }
                }
              }
            }
          }
        }
      }
    } as ComponentStyleKeyMap;

    const result = mapStyleKeyUsage(input);
    const expected: StyleKeyUsageMap = {
      pA: 2,
      pB: 2,
      pC: 1,
      pD: 1,
      pE: 1
    };
    expect(result).toEqual(expected);

    const keys = Object.keys(result);
    expect(keys).toEqual(['pA', 'pB', 'pC', 'pD', 'pE']);
  });

  it('skips undefined elements and empty structures', () => {
    const input = {
      C1: undefined,
      C2: {
        E1: {
          decorations: undefined,
          effects: {},
          scales: {},
          palettes: {}
        }
      }
    } as ComponentStyleKeyMap;
    const result = mapStyleKeyUsage(input);
    expect(result).toEqual({});
  });

  it('handles mixed counts and sorts correctly by count then key', () => {
    const input = {
      Mixed: {
        E: {
          decorations: ['a', 'b', 'a', 'c'],
          effects: { hover: ['b', 'c', 'c'] }
        }
      }
    } as ComponentStyleKeyMap;
    const result = mapStyleKeyUsage(input);
    const expected: StyleKeyUsageMap = {
      c: 3,
      a: 2,
      b: 2
    };
    expect(result).toEqual(expected);
    expect(Object.keys(result)).toEqual(['c', 'a', 'b']);
  });

  it('collapses raw and mirrored usage into the mirrored identity when both exist', () => {
    const input = {
      button: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      },
      card: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const result = mapStyleKeyUsage(input, {
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY,
      collapseDirectIntoMirrored: true
    });

    expect(result).toEqual({
      'borderWidth__2@@m': 2
    });
  });

  it('keeps raw and mirrored usage separate when collapse is disabled', () => {
    const input = {
      button: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      },
      card: {
        e1: {
          scales: {
            's:md:1': ['borderWidth__2']
          }
        }
      }
    } as unknown as ComponentStyleKeyMap;

    const result = mapStyleKeyUsage(input, {
      webStyleEmissionPolicy: DEFAULT_WEB_STYLE_EMISSION_POLICY
    });

    expect(result).toEqual({
      borderWidth__2: 1,
      'borderWidth__2@@m': 1
    });
  });
});
