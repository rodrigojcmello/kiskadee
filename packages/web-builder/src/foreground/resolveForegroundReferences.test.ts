import { type ElementPalettes, fg, type SchemaForegrounds } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { resolveForegroundReferences } from './resolveForegroundReferences.ts';

const foregrounds = {
  profiles: {
    red: {
      standard: {
        palettes: {
          default: {
            light: {
              onSubtle: {
                high: {
                  rest: '#c50f1f',
                  hover: '#b70419',
                  pressed: '#951219',
                  pending: '#c50f1fb3'
                },
                medium: { rest: '#c50f1fad' },
                low: { rest: '#888888' },
                lowest: { rest: '#c50f1f3d' }
              },
              onVivid: {
                high: { rest: '#ffa89f' },
                medium: { rest: '#ffa89fc2' },
                low: { rest: '#888888' },
                lowest: { rest: '#ffa89f66' }
              }
            },
            dark: {
              onSubtle: {
                high: { rest: '#ff958b' },
                medium: { rest: '#ff958bad' },
                low: { rest: '#888888' },
                lowest: { rest: '#ff958b3d' }
              }
            }
          }
        }
      }
    }
  }
} as const satisfies SchemaForegrounds;

describe('resolveForegroundReferences', () => {
  it('lowers direct and parent-state references using the consumer segment', () => {
    const palettes = {
      default: {
        dark: {
          onVivid: {
            textColor: {
              destructive: {
                high: {
                  rest: fg('red.standard.light.onSubtle.high'),
                  hover: fg.parentState('red.standard.light.onSubtle.high.hover'),
                  selected: {
                    rest: fg.parentState('red.standard.light.onSubtle.high.pressed')
                  }
                }
              }
            }
          }
        }
      }
    } as const satisfies ElementPalettes;

    expect(resolveForegroundReferences(palettes, foregrounds)).toEqual({
      default: {
        dark: {
          onVivid: {
            textColor: {
              destructive: {
                high: {
                  rest: '#c50f1f',
                  hover: { ref: '#b70419' },
                  selected: { rest: { ref: '#951219' } }
                }
              }
            }
          }
        }
      }
    });
  });

  it('rejects unknown coordinates, legacy wrappers, and non-text use', () => {
    expect(() =>
      resolveForegroundReferences(
        {
          default: {
            light: {
              onSubtle: {
                textColor: {
                  destructive: {
                    medium: { rest: 'fg:red.deep.light.onSubtle.high' }
                  }
                }
              }
            }
          }
        },
        foregrounds
      )
    ).toThrow('references unavailable foreground profile "red.deep"');

    expect(() =>
      resolveForegroundReferences(
        {
          default: {
            light: {
              onSubtle: {
                textColor: {
                  destructive: {
                    medium: {
                      rest: '#c50f1f',
                      hover: { ref: 'fg:red.standard.light.onSubtle.high.hover' }
                    }
                  }
                }
              }
            }
          }
        },
        foregrounds
      )
    ).toThrow('must use the fg.parentState() authoring wrapper');

    expect(() =>
      resolveForegroundReferences(
        {
          default: {
            light: {
              onSubtle: {
                boxColor: {
                  destructive: {
                    medium: { rest: fg('red.standard.light.onSubtle.high') }
                  }
                }
              }
            }
          }
        },
        foregrounds
      )
    ).toThrow('uses an fg reference outside textColor');
  });
});
