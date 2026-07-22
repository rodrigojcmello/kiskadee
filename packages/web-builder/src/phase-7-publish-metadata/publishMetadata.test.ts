import type { Schema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { buildComponentSurfaceContexts } from './publishMetadata.ts';

function createSchema(components: Schema['components']): Schema {
  return {
    name: 'Surface context test',
    version: [1, 0, 0],
    author: 'Kiskadee',
    breakpoints: { 'bp:all': 0 },
    components
  };
}

describe('buildComponentSurfaceContexts', () => {
  it('publishes interaction states independently by palette and surface context', () => {
    const schema = createSchema({
      button: {
        elements: {
          e1: {
            name: 'button',
            palettes: {
              default: {
                light: {
                  default: {
                    boxColor: {
                      primary: {
                        high: {
                          rest: '#0064b4',
                          hover: '#0059a1'
                        }
                      }
                    }
                  },
                  inverse: {
                    boxColor: {
                      primary: {
                        high: {
                          rest: '#ffffff',
                          pressed: '#a4cfff'
                        }
                      }
                    },
                    borderColor: {
                      primary: {
                        low: {
                          rest: '#ffffff',
                          selected: { rest: '#ffffffcc' }
                        }
                      }
                    }
                  }
                },
                dark: {
                  default: {
                    boxColor: {
                      primary: {
                        high: { rest: '#0064b4' }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    expect(buildComponentSurfaceContexts(schema, 'button')).toEqual({
      'default.light': {
        default: {
          state: {
            primary: {
              high: { rest: true, hover: true }
            }
          }
        },
        inverse: {
          state: {
            primary: {
              high: { rest: true, pressed: true },
              low: { rest: true, selected: true }
            }
          }
        }
      },
      'default.dark': {
        default: {
          state: {
            primary: {
              high: { rest: true }
            }
          }
        }
      }
    });
  });
});
