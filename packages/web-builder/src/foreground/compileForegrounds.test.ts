import type { ElementForeground, SchemaForegrounds } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { expandElementForeground } from './compileForegrounds.ts';

const emphases = {
  medium: { rest: '#333333' },
  low: { rest: '#555555' },
  lowest: { rest: '#777777' }
} as const;

const foregrounds = {
  profiles: {
    neutral: {
      standard: {
        palettes: {
          default: {
            light: { onSubtle: emphases, onVivid: emphases },
            dark: { onSubtle: emphases }
          }
        }
      }
    },
    red: {
      standard: {
        palettes: {
          default: {
            light: { onSubtle: emphases, onVivid: emphases },
            dark: { onSubtle: emphases }
          }
        }
      },
      deep: {
        palettes: {
          default: {
            light: {
              onSubtle: {
                medium: { rest: '#811819' },
                low: { rest: '#811819ad' },
                lowest: { rest: '#8118193d' }
              }
            }
          }
        }
      }
    }
  }
} as const satisfies SchemaForegrounds;

describe('expandElementForeground', () => {
  it('projects profile values into the local textColor intent', () => {
    expect(
      expandElementForeground(
        { neutral: { family: 'neutral', profile: 'standard' } } satisfies ElementForeground,
        foregrounds
      )
    ).toEqual({
      default: {
        light: {
          onSubtle: { textColor: { neutral: emphases } },
          onVivid: { textColor: { neutral: emphases } }
        },
        dark: {
          onSubtle: { textColor: { neutral: emphases } }
        }
      }
    });
  });

  it('keeps multiple named color families independent in the same color channel', () => {
    expect(
      expandElementForeground(
        {
          neutral: { family: 'neutral', profile: 'standard' },
          red: { family: 'red', profile: 'standard' }
        } satisfies ElementForeground,
        foregrounds
      )
    ).toEqual({
      default: {
        light: {
          onSubtle: { textColor: { neutral: emphases, red: emphases } },
          onVivid: { textColor: { neutral: emphases, red: emphases } }
        },
        dark: {
          onSubtle: { textColor: { neutral: emphases, red: emphases } }
        }
      }
    });
  });

  it('keeps standard and deep profiles from the same family independent', () => {
    expect(
      expandElementForeground(
        {
          red: { family: 'red', profile: 'standard' },
          'red-deep': { family: 'red', profile: 'deep' }
        } satisfies ElementForeground,
        foregrounds
      )
    ).toMatchObject({
      default: {
        light: {
          onSubtle: {
            textColor: {
              red: emphases,
              'red-deep': {
                medium: { rest: '#811819' },
                low: { rest: '#811819ad' },
                lowest: { rest: '#8118193d' }
              }
            }
          }
        }
      }
    });
  });

  it('fails defensively when a profile reference is unknown', () => {
    expect(() =>
      expandElementForeground({ neutral: { family: 'missing', profile: 'standard' } }, foregrounds)
    ).toThrow('[web-builder] Foreground family "missing" is not defined.');
    expect(() =>
      expandElementForeground({ neutral: { family: 'neutral', profile: 'deep' } }, foregrounds)
    ).toThrow('[web-builder] Foreground profile "neutral.deep" is not defined.');
  });

  it('projects only Rest when a global profile also publishes control states', () => {
    const stateful = structuredClone(foregrounds) as any;
    stateful.profiles.neutral.standard.palettes.default.light.onSubtle.medium.hover = '#222222';
    stateful.profiles.neutral.standard.palettes.default.light.onSubtle.medium.pending =
      '#333333b3';

    expect(
      expandElementForeground(
        { neutral: { family: 'neutral', profile: 'standard' } },
        stateful
      ).default?.light?.onSubtle?.textColor?.neutral?.medium
    ).toEqual({ rest: '#333333' });
  });
});
