import {
  resolveCardSurfaceSource,
  resolveColorVariantLeaves,
  resolveContentSurfaceContextVariant,
  type Schema,
  validateSchemaComponentContracts
} from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { splitCardSurfaceSchema } from './splitCardSurfaceSchema.ts';

describe('splitCardSurfaceSchema color variants', () => {
  it.each([
    false,
    true
  ])('preserves an authored Alternative context leaf (border-only: %s)', (borderOnly) => {
    const components = splitCardSurfaceSchema({
      options: {
        border: {
          defaultMode: 'adaptive',
          adaptive: {
            default: {
              light: {
                onSubtle: { primary: { high: false } }
              }
            }
          }
        }
      },
      elements: {
        e1: {
          name: 'card',
          decorations: { borderStyle: 'solid' },
          scales: { borderWidth: 1 },
          palettes: {
            default: {
              light: {
                onSubtle: {
                  standard: {
                    boxColor: { primary: { high: { rest: '#123456', hover: '#345678' } } },
                    borderColor: { primary: { high: { rest: '#456789' } } }
                  },
                  alternative: borderOnly
                    ? { borderColor: { primary: { high: { rest: '#56789a' } } } }
                    : { boxColor: { primary: { high: { rest: '#234567' } } } }
                }
              }
            }
          }
        }
      },
      contentSurfaceContext: {
        default: {
          light: {
            onSubtle: {
              standard: { primary: { high: { rest: 'onVivid', selected: 'onSubtle' } } },
              alternative: {
                primary: {
                  high: borderOnly ? { rest: 'onVivid', selected: 'onSubtle' } : { rest: 'onVivid' }
                }
              }
            }
          }
        }
      }
    });
    expect(
      components.card.contentSurfaceContext!.default!.light!.onSubtle!.alternative?.primary?.high
    ).toEqual(borderOnly ? { selected: 'onSubtle' } : {});
    const effective = resolveCardSurfaceSource({ components } as Schema).components.card!;
    const outputs = effective.contentSurfaceContext!.default!.light!.onSubtle!;
    expect(resolveColorVariantLeaves(outputs.standard, outputs.alternative)?.primary?.high).toEqual(
      borderOnly ? { rest: 'onVivid', selected: 'onSubtle' } : { rest: 'onVivid' }
    );
    expect(() => validateSchemaComponentContracts({ components } as Schema)).not.toThrow();
  });

  it('keeps a border-only alternative on Card without fabricating Container surfaces', () => {
    const components = splitCardSurfaceSchema({
      options: {
        border: {
          defaultMode: 'adaptive',
          adaptive: { default: { light: { onSubtle: { neutral: { low: false } } } } }
        }
      },
      elements: {
        e1: {
          name: 'card',
          decorations: { borderStyle: 'solid' },
          scales: { borderWidth: 1 },
          palettes: {
            default: {
              light: {
                onSubtle: {
                  standard: {
                    boxColor: { neutral: { low: { rest: '#ffffff', hover: '#eeeeee' } } },
                    borderColor: { neutral: { low: { rest: '#cccccc', hover: '#aaaaaa' } } }
                  },
                  alternative: { borderColor: { neutral: { low: { rest: '#000000' } } } }
                }
              }
            }
          }
        }
      },
      contentSurfaceContext: {
        default: { light: { onSubtle: { standard: { neutral: { low: { rest: 'onSubtle' } } } } } }
      }
    });
    const schema = { components } as Schema;
    expect(() => validateSchemaComponentContracts(schema)).not.toThrow();
    expect(components.container.elements.e1.palettes.default?.light?.onSubtle).not.toHaveProperty(
      'alternative'
    );
    expect(components.container.contentSurfaceContext.default?.light?.onSubtle).not.toHaveProperty(
      'alternative'
    );
    const resolved = resolveCardSurfaceSource(schema);
    const palette = resolved.components.card!.elements.e1!.palettes!.default!.light!.onSubtle;
    expect(resolveColorVariantLeaves(palette.standard, palette.alternative)).toEqual({
      boxColor: { neutral: { low: { rest: '#ffffff', hover: '#eeeeee' } } },
      borderColor: { neutral: { low: { rest: '#000000' } } }
    });
  });

  it('inherits Standard descendant polarity when an alternative only changes the surface color', () => {
    const components = splitCardSurfaceSchema({
      elements: {
        e1: {
          name: 'card',
          palettes: {
            default: {
              light: {
                onSubtle: {
                  standard: {
                    boxColor: {
                      primary: {
                        high: { rest: '#123456', hover: '#345678', selected: { rest: '#456789' } }
                      }
                    }
                  },
                  alternative: { boxColor: { primary: { high: { rest: '#234567' } } } }
                }
              }
            }
          }
        }
      },
      contentSurfaceContext: {
        default: {
          light: {
            onSubtle: {
              standard: { primary: { high: { rest: 'onVivid', selected: 'onSubtle' } } }
            }
          }
        }
      }
    });
    const outputs = components.container.contentSurfaceContext.default!.light!.onSubtle!;
    expect(outputs).not.toHaveProperty('alternative');
    expect(resolveContentSurfaceContextVariant(outputs, 'alternative')).toEqual({
      primary: { high: { rest: 'onVivid' } }
    });
    const resolved = resolveCardSurfaceSource({ components } as Schema).components.card!;
    const palette = resolved.elements.e1!.palettes!.default!.light!.onSubtle;
    expect(resolveColorVariantLeaves(palette.standard, palette.alternative).boxColor).toEqual({
      primary: { high: { rest: '#234567' } }
    });
    expect(resolved.contentSurfaceContext!.default!.light!.onSubtle!.alternative).toEqual({
      primary: { high: { rest: 'onVivid', selected: 'onSubtle' } }
    });
  });
});
