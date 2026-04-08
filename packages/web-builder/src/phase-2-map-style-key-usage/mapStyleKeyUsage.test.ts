import { describe, it, expect } from 'vitest';
import { mapStyleKeyUsage, type StyleKeyUsageMap } from './mapStyleKeyUsage';
import type { ComponentStyleKeyMap } from '@kiskadee/core';
import { DEFAULT_WEB_STYLE_EMISSION_POLICY } from '../style-emission/web-build-policy';

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

  it('counts nested palettes correctly', () => {
    const input = {
      PaletteComponent: {
        Root: {
          palettes: {
            ios: {
              light: {
                primary: {
                  rest: ['pA', 'pB', 'pA'],
                  disabled: ['pC']
                },
                secondary: {
                  hover: ['pB']
                }
              },
              dark: {
                primary: {
                  rest: ['pD']
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
      pD: 1
    };
    expect(result).toEqual(expected);

    const keys = Object.keys(result);
    expect(keys).toEqual(['pA', 'pB', 'pC', 'pD']);
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
