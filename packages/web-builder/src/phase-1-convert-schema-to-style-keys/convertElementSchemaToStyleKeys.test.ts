import type { Schema, StyleKeyByElement } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { buildScopedToneMetadataKey } from './colors/convertElementColorsToStyleKeys.ts';
import { convertElementSchemaToStyleKeys } from './convertElementSchemaToStyleKeys.ts';

function createSchema(components: Schema['components'], global?: Schema['global']): Schema {
  return {
    name: 'Test Design System',
    version: [1, 0, 0],
    author: 'Kiskadee',
    breakpoints: {
      'bp:all': 0
    },
    global,
    components
  };
}

describe('convertElementSchemaToStyleKeys', () => {
  it('converts top-level element decorations, scales, radius scales, palettes, and effects', () => {
    const schema = createSchema({
      button: {
        elements: {
          e1: {
            decorations: {
              borderStyle: 'solid'
            },
            scales: {
              paddingTop: {
                's:md:1': 8
              },
              borderRadius: {
                rounded: {
                  's:md:1': 12
                }
              }
            },
            palettes: {
              default: {
                light: {
                  boxColor: {
                    primary: {
                      medium: {
                        rest: [10, 20, 30, 1]
                      }
                    }
                  }
                }
              }
            },
            effects: {
              shadow: {
                x: { rest: 0 },
                y: { rest: 2 },
                blur: { rest: 4 },
                color: { rest: [0, 0, 0, 0.2] }
              }
            }
          }
        }
      }
    });

    const { styleKeys, toneMetadataByPalette } = convertElementSchemaToStyleKeys(schema);
    const button = styleKeys.button as Record<string, StyleKeyByElement>;
    const e1 = button.e1;

    expect(e1.decorations).toEqual(['borderStyle__solid']);
    expect(e1.scales).toEqual({
      's:md:1': ['paddingTop__8']
    });
    expect(e1.radiusScales).toEqual({
      rounded: {
        's:md:1': ['borderRadiusRounded__12']
      }
    });
    expect(e1.palettes).toEqual({
      default: {
        light: {
          primary: {
            rest: ['boxColor__[10,20,30,1]']
          }
        }
      }
    });
    expect(e1.effects).toEqual({
      rest: ['shadow__[0,2,4,[0,0,0,0.2]]']
    });
    const metadataKey = buildScopedToneMetadataKey(
      {
        componentName: 'button',
        elementName: 'e1'
      },
      'primary::boxColor__[10,20,30,1]'
    );

    expect(toneMetadataByPalette.get('default.light')?.get(metadataKey)).toEqual({
      tones: ['medium']
    });
  });

  it('converts variant element maps', () => {
    const schema = createSchema({
      tabs: {
        variants: {
          line: {
            elements: {
              e3: {
                decorations: {
                  textWeight: 'medium'
                },
                scales: {
                  textSize: {
                    's:md:1': 16
                  }
                }
              }
            }
          }
        }
      }
    });

    const { styleKeys } = convertElementSchemaToStyleKeys(schema);
    const tabs = styleKeys.tabs as Record<string, Record<string, StyleKeyByElement>>;

    expect(tabs.line.e3.decorations).toEqual(['textWeight__medium']);
    expect(tabs.line.e3.scales).toEqual({
      's:md:1': ['textSize__16']
    });
  });

  it('keeps emphasis metadata scoped by palette', () => {
    const sameColor = [0, 0, 0, 1] as const;
    const schema = createSchema({
      button: {
        elements: {
          e1: {
            palettes: {
              default: {
                light: {
                  boxColor: {
                    primary: {
                      high: {
                        rest: sameColor
                      }
                    }
                  }
                },
                dark: {
                  boxColor: {
                    primary: {
                      medium: {
                        rest: sameColor
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

    const { toneMetadataByPalette } = convertElementSchemaToStyleKeys(schema);
    const metadataKey = buildScopedToneMetadataKey(
      {
        componentName: 'button',
        elementName: 'e1'
      },
      'primary::boxColor__[0,0,0,1]'
    );

    expect(toneMetadataByPalette.get('default.light')?.get(metadataKey)).toEqual({
      tones: ['high']
    });
    expect(toneMetadataByPalette.get('default.dark')?.get(metadataKey)).toEqual({
      tones: ['medium']
    });
  });

  it('preserves size tokens for border radius effects', () => {
    const schema = createSchema({
      button: {
        elements: {
          e1: {
            effects: {
              borderRadius: {
                rounded: {
                  hover: {
                    's:sm:1': 24,
                    's:md:1': 20
                  }
                }
              }
            }
          }
        }
      }
    });

    const { styleKeys } = convertElementSchemaToStyleKeys(schema);
    const button = styleKeys.button as Record<string, StyleKeyByElement>;

    expect(button.e1.effects).toEqual({
      hover: ['borderRadiusRounded--hover++s:sm:1__24', 'borderRadiusRounded--hover++s:md:1__20']
    });
  });
});
