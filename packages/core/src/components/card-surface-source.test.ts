import { describe, expect, it } from 'vitest';
import type { Schema } from '../schema.ts';
import { validateSchemaComponentContracts } from '../utils/validateComponentContracts.ts';
import { resolveCardSurfaceSource } from './card-surface-source.ts';

function createSchema(): Schema {
  return {
    name: 'Surface source test',
    version: [1, 0, 0],
    author: 'Kiskadee',
    breakpoints: { 'bp:all': 0 },
    components: {
      container: {
        options: {
          canonicalSurfaces: {
            default: {
              light: [
                {
                  intent: 'primary',
                  emphasis: 'highest',
                  contentSurfaceContext: 'onVivid'
                }
              ]
            }
          }
        },
        contentSurfaceContext: {
          default: {
            light: {
              onSubtle: {
                primary: { highest: { rest: 'onVivid' } },
                primaryComplementary: { highest: { rest: 'onVivid' } }
              }
            }
          }
        },
        elements: {
          e1: {
            name: 'container',
            palettes: {
              default: {
                light: {
                  onSubtle: {
                    boxColor: {
                      primary: { highest: { rest: '#123456' } },
                      primaryComplementary: { highest: { rest: '#234567' } }
                    }
                  }
                }
              }
            }
          }
        }
      },
      card: {
        surfaceSource: 'container',
        contentSurfaceContext: {
          default: { light: { onSubtle: { primary: { highest: { selected: 'onSubtle' } } } } }
        },
        elements: {
          e1: {
            name: 'card',
            palettes: {
              default: {
                light: {
                  onSubtle: {
                    boxColor: { primary: { highest: { hover: '#345678' } } },
                    borderColor: { primary: { highest: { rest: '#456789' } } }
                  }
                }
              }
            }
          }
        }
      }
    }
  };
}

describe('Card Container surface source', () => {
  it('materializes Rest and complementary paint while preserving Card deltas and authored input', () => {
    const authored = createSchema();
    expect(() => validateSchemaComponentContracts(authored)).not.toThrow();

    const effective = resolveCardSurfaceSource(authored);
    const colors = effective.components.card?.elements.e1?.palettes?.default?.light?.onSubtle;
    expect(colors?.boxColor?.primary?.highest).toEqual({ hover: '#345678', rest: '#123456' });
    expect(colors?.boxColor?.primaryComplementary?.highest).toEqual({ rest: '#234567' });
    expect(colors?.borderColor?.primary?.highest).toEqual({ rest: '#456789' });
    expect(
      effective.components.card?.contentSurfaceContext?.default?.light?.onSubtle?.primary?.highest
    ).toEqual({ selected: 'onSubtle', rest: 'onVivid' });
    expect(effective.components.card?.options?.canonicalSurfaces).toEqual(
      authored.components.container?.options?.canonicalSurfaces
    );
    expect(
      authored.components.card?.elements.e1?.palettes?.default?.light?.onSubtle.boxColor?.primary
        ?.highest?.rest
    ).toBeUndefined();
    expect(resolveCardSurfaceSource(effective)).toBe(effective);
  });

  it('fails when Card references a missing Container coordinate', () => {
    const schema = createSchema();
    delete schema.components.container?.elements.e1.palettes.default?.light?.onSubtle.boxColor
      ?.primary;
    expect(() => validateSchemaComponentContracts(schema)).toThrow(/boxColor.primary.highest.rest/);
  });

  it('keeps Container-only canonical and complementary surfaces out of the Card copy', () => {
    const authored = createSchema();
    const container = authored.components.container!;
    const palette = container.elements.e1.palettes.default!.light!.onSubtle.boxColor;
    palette.neutral = { low: { rest: '#eeeeee' } };
    palette.neutralComplementary = { low: { rest: '#dddddd' } };
    const outputs = container.contentSurfaceContext.default!.light!.onSubtle!;
    outputs.neutral = { low: { rest: 'onSubtle' } };
    outputs.neutralComplementary = { low: { rest: 'onSubtle' } };
    const catalog = container.options!.canonicalSurfaces!.default!.light!;
    container.options!.canonicalSurfaces!.default!.light = [
      ...catalog,
      { intent: 'neutral', emphasis: 'low', contentSurfaceContext: 'onSubtle' },
      { intent: 'neutralComplementary', emphasis: 'low', contentSurfaceContext: 'onSubtle' }
    ];

    expect(() => validateSchemaComponentContracts(authored)).not.toThrow();
    const effective = resolveCardSurfaceSource(authored);
    expect(effective.components.container?.options?.canonicalSurfaces?.default?.light).toHaveLength(
      3
    );
    expect(effective.components.card?.options?.canonicalSurfaces?.default?.light).toEqual(catalog);
    expect(
      effective.components.card?.elements.e1?.palettes?.default?.light?.onSubtle.boxColor
        ?.neutralComplementary
    ).toBeUndefined();
  });

  it('rejects Card-authored Rest and misplaced canonical catalogs', () => {
    const schema = createSchema();
    const card = schema.components.card!;
    card.elements.e1!.palettes!.default!.light!.onSubtle.boxColor!.primary!.highest!.rest =
      '#000000';
    expect(() => validateSchemaComponentContracts(schema)).toThrow(
      /Card Rest must come from Container/
    );

    delete card.elements.e1!.palettes!.default!.light!.onSubtle.boxColor!.primary!.highest!.rest;
    card.options = { canonicalSurfaces: schema.components.container!.options!.canonicalSurfaces };
    expect(() => validateSchemaComponentContracts(schema)).toThrow(
      /authored catalog belongs to Container/
    );
  });
});
