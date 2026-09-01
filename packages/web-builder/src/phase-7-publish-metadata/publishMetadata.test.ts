import type { Schema, SchemaFonts } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import {
  buildComponentSurfaceContexts,
  buildManifestFonts,
  buildManifestIcons,
  buildManifestTypography,
  isPublishableColorSourceFile
} from './publishMetadata.ts';

function createSchema(components: Schema['components']): Schema {
  return {
    name: 'Surface context test',
    version: [1, 0, 0],
    author: 'Kiskadee',
    breakpoints: { 'bp:all': 0 },
    components
  };
}

describe('isPublishableColorSourceFile', () => {
  it('accepts color modules and excludes colocated tests, specs, and declarations', () => {
    expect(isPublishableColorSourceFile('b.blue.v1.ts')).toBe(true);
    expect(isPublishableColorSourceFile('b.blue.v1.test.ts')).toBe(false);
    expect(isPublishableColorSourceFile('b.blue.v1.spec.ts')).toBe(false);
    expect(isPublishableColorSourceFile('b.blue.v1.d.ts')).toBe(false);
    expect(isPublishableColorSourceFile('README.md')).toBe(false);
  });
});

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
            iconSize: {
              's:sm:2': 's:sm:2',
              's:md:1': 's:md:1'
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

  it('computes Text contexts after expanding its global foreground profile', () => {
    const states = {
      medium: { rest: '#333333' },
      low: { rest: '#555555' },
      lowest: { rest: '#777777' }
    } as const;
    const schema: Schema = {
      ...createSchema({
        text: {
          elements: {
            e1: {
              name: 'foreground',
              foreground: {
                neutral: { family: 'neutral', profile: 'standard' },
                red: { family: 'red', profile: 'standard' },
                'red-deep': { family: 'red', profile: 'deep' }
              }
            }
          }
        }
      }),
      global: {
        foregrounds: {
          profiles: {
            neutral: {
              standard: {
                palettes: {
                  default: {
                    light: { onSubtle: states, onVivid: states }
                  }
                }
              }
            },
            red: {
              standard: {
                palettes: {
                  default: {
                    light: { onSubtle: states, onVivid: states }
                  }
                }
              },
              deep: {
                palettes: {
                  default: {
                    light: { onSubtle: states, onVivid: states }
                  }
                }
              }
            }
          }
        }
      }
    };

    expect(buildComponentSurfaceContexts(schema, 'text')).toEqual({
      'default.light': {
        onSubtle: {
          state: {
            neutral: {
              medium: { rest: true },
              low: { rest: true },
              lowest: { rest: true }
            },
            red: {
              medium: { rest: true },
              low: { rest: true },
              lowest: { rest: true }
            },
            'red-deep': {
              medium: { rest: true },
              low: { rest: true },
              lowest: { rest: true }
            }
          }
        },
        onVivid: {
          state: {
            neutral: {
              medium: { rest: true },
              low: { rest: true },
              lowest: { rest: true }
            },
            red: {
              medium: { rest: true },
              low: { rest: true },
              lowest: { rest: true }
            },
            'red-deep': {
              medium: { rest: true },
              low: { rest: true },
              lowest: { rest: true }
            }
          }
        }
      }
    });
  });

  it('computes Separator contexts from the same expanded recipe used for style emission', () => {
    const schema: Schema = {
      ...createSchema({
        separator: {
          elements: {
            e1: {
              name: 'line',
              separator: { 's:all': 'subtle' }
            }
          }
        }
      }),
      global: {
        separators: {
          profiles: {
            subtle: {
              scales: { boxWidth: 1 },
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      boxColor: { neutral: { medium: { rest: '#dddddd' } } }
                    },
                    onVivid: {
                      boxColor: { neutral: { medium: { rest: '#ffffff33' } } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    };

    expect(buildComponentSurfaceContexts(schema, 'separator')).toEqual({
      'default.light': {
        onSubtle: {
          state: { neutral: { medium: { rest: true } } }
        },
        onVivid: {
          state: { neutral: { medium: { rest: true } } }
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

describe('buildManifestTypography', () => {
  it('publishes only the descriptive artifact path', () => {
    expect(buildManifestTypography(true)).toEqual({
      artifact: 'typography.kiskadee.json'
    });
    expect(buildManifestTypography(false)).toBeUndefined();
  });
});

describe('buildManifestIcons', () => {
  it('publishes the selected family and variant ids', () => {
    expect(buildManifestIcons({ family: 'fluent-system', variant: 'regular' })).toEqual({
      family: 'fluent-system',
      variant: 'regular'
    });
  });

  it('omits icon metadata without a recommendation', () => {
    expect(buildManifestIcons(undefined)).toBeUndefined();
  });
});
