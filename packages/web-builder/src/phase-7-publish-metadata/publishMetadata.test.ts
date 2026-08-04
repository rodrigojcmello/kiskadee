import { ICON_SIZE_BY_SCALE, type Schema, type SchemaFonts } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { buildComponentSurfaceContexts, buildManifestFonts } from './publishMetadata.ts';

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
                  onSubtle: {
                    boxColor: {
                      primary: {
                        high: {
                          rest: '#0064b4',
                          hover: '#0059a1'
                        }
                      }
                    }
                  },
                  onVivid: {
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
                  onSubtle: {
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
        onSubtle: {
          state: {
            primary: {
              high: { rest: true, hover: true }
            }
          }
        },
        onVivid: {
          state: {
            primary: {
              high: { rest: true, pressed: true },
              low: { rest: true, selected: true }
            }
          }
        }
      },
      'default.dark': {
        onSubtle: {
          state: {
            primary: {
              high: { rest: true }
            }
          }
        }
      }
    });
  });

  it('publishes the rest-only Icon contract in both surface contexts', () => {
    const schema = createSchema({
      icon: {
        elements: {
          e1: {
            name: 'glyph',
            scales: {
              boxWidth: ICON_SIZE_BY_SCALE,
              boxHeight: ICON_SIZE_BY_SCALE
            },
            palettes: {
              default: {
                light: {
                  onSubtle: {
                    textColor: {
                      neutral: { medium: { rest: '#21242d' } },
                      primary: { medium: { rest: '#0064b4' } }
                    }
                  },
                  onVivid: {
                    textColor: {
                      neutral: { medium: { rest: '#f4f6fe' } },
                      primary: { medium: { rest: '#c1deff' } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    expect(buildComponentSurfaceContexts(schema, 'icon')).toEqual({
      'default.light': {
        onSubtle: {
          state: {
            neutral: { medium: { rest: true } },
            primary: { medium: { rest: true } }
          }
        },
        onVivid: {
          state: {
            neutral: { medium: { rest: true } },
            primary: { medium: { rest: true } }
          }
        }
      }
    });
  });
});

describe('buildManifestFonts', () => {
  it('publishes only explicitly selected role IDs', () => {
    const fonts = {
      families: {
        inter: { stack: ['Inter', 'Arial', 'sans-serif'] },
        'jetbrains-mono': { stack: ['JetBrains Mono', 'monospace'] }
      },
      roles: {
        body: 'inter',
        heading: 'inter',
        code: 'jetbrains-mono'
      }
    } as const satisfies SchemaFonts;

    expect(buildManifestFonts(fonts)).toEqual({
      body: 'inter',
      heading: 'inter',
      code: 'jetbrains-mono'
    });
  });

  it('does not synthesize omitted optional roles', () => {
    const fonts = {
      families: {
        inter: { stack: ['Inter', 'sans-serif'] }
      },
      roles: {
        body: 'inter'
      }
    } as const satisfies SchemaFonts;

    expect(buildManifestFonts(fonts)).toEqual({ body: 'inter' });
  });

  it('omits font metadata when the schema has no catalog', () => {
    expect(buildManifestFonts(undefined)).toBeUndefined();
  });
});
