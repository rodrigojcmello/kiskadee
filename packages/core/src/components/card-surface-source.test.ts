import { describe, expect, it } from 'vitest';
import type { Schema } from '../schema.ts';
import { validateSchemaComponentContracts } from '../utils/validateComponentContracts.ts';
import { resolveCardSurfaceSource } from './card-surface-source.ts';
import {
  type DerivedContainerComponent,
  type ManualContainerComponent,
  materializeContainerSurfaceContext
} from './container.ts';

function createSchema(): Schema & { components: { container: ManualContainerComponent } } {
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
                standard: {
                  primary: { highest: { rest: 'onVivid' } },
                  primaryComplementary: { highest: { rest: 'onVivid' } }
                }
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
                    standard: {
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
        }
      },
      card: {
        surfaceSource: 'container',
        options: {
          border: {
            defaultMode: 'adaptive',
            adaptive: {
              default: { light: { onSubtle: { primary: { highest: false } } } }
            }
          }
        },
        contentSurfaceContext: {
          default: {
            light: { onSubtle: { standard: { primary: { highest: { selected: 'onSubtle' } } } } }
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
    }
  };
}

describe('Card Container surface source', () => {
  function createDerivedSchema() {
    const original = createSchema();
    const manual = original.components.container;
    const palette = manual.elements.e1.palettes.default!.light!.onSubtle!.standard.boxColor;
    palette.neutral = { low: { rest: '#eee' } };
    const computed = manual.contentSurfaceContext;
    const rest = computed.default!.light!.onSubtle!.standard;
    rest.primary!.highest!.rest = 'onSubtle';
    rest.neutral = { low: { rest: 'onSubtle' } };
    const { contentSurfaceContext: _map, ...card } = original.components.card!;
    const container: DerivedContainerComponent = {
      elements: manual.elements,
      contentSurfaceContext: { derive: { element: 'e1', property: 'boxColor' } },
      options: {
        canonicalSurfaces: {
          default: {
            light: [
              { intent: 'neutral', emphasis: 'low', referenceFor: 'onSubtle' },
              { intent: 'primary', emphasis: 'highest', referenceFor: 'onVivid' }
            ]
          }
        }
      }
    };
    const authored: Schema = {
      ...original,
      components: { ...original.components, container, card }
    };
    return { authored, computed, container };
  }

  it('materializes derived Container Rest and projects its catalog context into Card', () => {
    const { authored, computed, container } = createDerivedSchema();
    expect(() => validateSchemaComponentContracts(authored)).not.toThrow();
    expect(() => resolveCardSurfaceSource(authored)).toThrow(/materialize derivation/);

    const effective = resolveCardSurfaceSource(
      materializeContainerSurfaceContext(authored, computed)
    );
    expect(() => validateSchemaComponentContracts(effective)).not.toThrow();
    expect(
      effective.components.card!.contentSurfaceContext!.default!.light!.onSubtle!.standard!.primary!
        .highest
    ).toEqual({ rest: 'onSubtle' });
    expect(effective.components.card!.options!.canonicalSurfaces!.default!.light).toEqual([
      { intent: 'primary', emphasis: 'highest', contentSurfaceContext: 'onSubtle' }
    ]);
    expect(container.contentSurfaceContext).toEqual({
      derive: { element: 'e1', property: 'boxColor' }
    });
    expect(container.options.canonicalSurfaces.default!.light![1]).not.toHaveProperty(
      'contentSurfaceContext'
    );
  });

  it('rejects a Card-authored output map when its Container derives the context', () => {
    const { authored, computed } = createDerivedSchema();
    authored.components.card!.contentSurfaceContext = {};
    expect(() => validateSchemaComponentContracts(authored)).toThrow(
      /components.card.contentSurfaceContext: derived Container owns the context/
    );
    expect(() => materializeContainerSurfaceContext(authored, computed)).toThrow(
      /components.card.contentSurfaceContext: derived Container owns the context/
    );
  });

  it('rejects a Card paint coordinate missing from its derived Container before materialization', () => {
    const { authored } = createDerivedSchema();
    const card = authored.components.card!;
    const palette = card.elements.e1!.palettes!.default!.light!.onSubtle!.standard;
    palette.boxColor!.neutral = { highest: { hover: '#ffffff' } };
    palette.borderColor!.neutral = { highest: { rest: '#456789' } };
    card.options!.border!.adaptive.default!.light!.onSubtle!.neutral = { highest: false };

    expect(() => validateSchemaComponentContracts(authored)).toThrow(
      /components\.container\.elements\.e1\.palettes\.default\.light\.onSubtle\.standard\.boxColor\.neutral\.highest\.rest: required Rest value/
    );
  });

  it('accepts a derived Container Standard Rest inherited by an Alternative Card recipe', () => {
    const { authored } = createDerivedSchema();
    const palettes = authored.components.card!.elements.e1!.palettes!.default!.light!.onSubtle!;
    palettes.alternative = { boxColor: { primary: { highest: { hover: '#ffffff' } } } };

    expect(() => validateSchemaComponentContracts(authored)).not.toThrow();
  });

  it('requires both opaque backdrop references for every derived Container palette', () => {
    const { authored, container } = createDerivedSchema();
    const palette = container.elements.e1.palettes.default!.light!.onSubtle!.standard.boxColor;
    palette.neutral!.low!.rest = '#fff0';
    expect(() => validateSchemaComponentContracts(authored)).toThrow(
      /canonical backdrop must be an opaque hex color/
    );

    palette.neutral!.low!.rest = '#fff';
    const catalog = container.options.canonicalSurfaces.default!;
    catalog.light = catalog.light!.slice(0, 1);
    expect(() => validateSchemaComponentContracts(authored)).toThrow(
      /missing referenceFor "onVivid"/
    );
  });

  it('materializes Rest and complementary paint while preserving Card deltas and authored input', () => {
    const authored = createSchema();
    expect(() => validateSchemaComponentContracts(authored)).not.toThrow();

    const effective = resolveCardSurfaceSource(authored);
    expect(effective.components.container).toEqual(authored.components.container);
    const colors =
      effective.components.card?.elements.e1?.palettes?.default?.light?.onSubtle?.standard;
    expect(colors?.boxColor?.primary?.highest).toEqual({ hover: '#345678', rest: '#123456' });
    expect(colors?.boxColor?.primaryComplementary?.highest).toEqual({ rest: '#234567' });
    expect(colors?.borderColor?.primary?.highest).toEqual({ rest: '#456789' });
    expect(
      effective.components.card?.contentSurfaceContext?.default?.light?.onSubtle?.standard?.primary
        ?.highest
    ).toEqual({ selected: 'onSubtle', rest: 'onVivid' });
    expect(effective.components.card?.options?.canonicalSurfaces).toEqual(
      authored.components.container?.options?.canonicalSurfaces
    );
    expect(
      authored.components.card?.elements.e1?.palettes?.default?.light?.onSubtle.standard.boxColor
        ?.primary?.highest?.rest
    ).toBeUndefined();
    expect(resolveCardSurfaceSource(effective)).toBe(effective);
  });

  it('fails when Card references a missing Container coordinate', () => {
    const schema = createSchema();
    delete schema.components.container?.elements.e1.palettes.default?.light?.onSubtle.standard
      .boxColor?.primary;
    expect(() => validateSchemaComponentContracts(schema)).toThrow(/boxColor.primary.highest.rest/);
  });

  it('keeps Container calibration markers out of the resolved Card catalog', () => {
    const authored = createSchema();
    const light = authored.components.container!.options!.canonicalSurfaces!.default!.light!;
    authored.components.container!.options!.canonicalSurfaces!.default!.light = [
      { ...light[0]!, referenceFor: 'onVivid' }
    ];

    expect(() => validateSchemaComponentContracts(authored)).not.toThrow();
    const effective = resolveCardSurfaceSource(authored);
    expect(effective.components.card?.options?.canonicalSurfaces?.default?.light).toEqual(light);
    expect(effective.components.container?.options?.canonicalSurfaces?.default?.light).toEqual([
      { ...light[0]!, referenceFor: 'onVivid' }
    ]);
  });

  it('rejects multiple canonical backdrops for the same context in one segment and theme', () => {
    const authored = createSchema();
    const catalog = authored.components.container!.options!.canonicalSurfaces!.default!;
    catalog.light = [
      { ...catalog.light![0]!, referenceFor: 'onVivid' },
      {
        intent: 'primaryComplementary',
        emphasis: 'highest',
        contentSurfaceContext: 'onVivid',
        referenceFor: 'onVivid'
      }
    ];

    expect(() => validateSchemaComponentContracts(authored)).toThrow(
      /\.light\.1\.referenceFor: duplicate reference for onVivid/
    );
  });

  it.each([
    true,
    false
  ])('inherits missing Alternative descendant states independently of variant order (alternative first: %s)', (alternativeFirst) => {
    const authored = createSchema();
    const card = authored.components.card!;
    const variants = card.elements.e1!.palettes!.default!.light!.onSubtle;
    const alternative = { boxColor: { primary: { highest: {} } } };
    card.elements.e1!.palettes!.default!.light!.onSubtle = alternativeFirst
      ? { alternative, standard: variants.standard }
      : { standard: variants.standard, alternative };
    authored.components.container!.elements.e1.palettes.default!.light!.onSubtle.alternative = {
      boxColor: { primary: { highest: { rest: '#56789a' } } }
    };

    const effective = resolveCardSurfaceSource(authored).components.card!;
    expect(
      effective.elements.e1!.palettes!.default!.light!.onSubtle.alternative?.boxColor?.primary
        ?.highest
    ).toEqual({ rest: '#56789a' });
    expect(
      effective.contentSurfaceContext!.default!.light!.onSubtle!.alternative?.primary?.highest
    ).toEqual({ rest: 'onVivid', selected: 'onSubtle' });

    card.contentSurfaceContext!.default!.light!.onSubtle!.alternative = {
      primary: { highest: { pending: 'onSubtle' } }
    };
    expect(
      resolveCardSurfaceSource(authored).components.card!.contentSurfaceContext!.default!.light!
        .onSubtle!.alternative?.primary?.highest
    ).toEqual({ rest: 'onVivid', pending: 'onSubtle' });
  });

  it('keeps Container-only canonical and complementary surfaces out of the Card copy', () => {
    const authored = createSchema();
    const container = authored.components.container!;
    const palette = container.elements.e1.palettes.default!.light!.onSubtle.standard.boxColor;
    palette.neutral = { low: { rest: '#eeeeee' } };
    palette.neutralComplementary = { low: { rest: '#dddddd' } };
    const outputs = container.contentSurfaceContext.default!.light!.onSubtle!.standard;
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
      effective.components.card?.elements.e1?.palettes?.default?.light?.onSubtle.standard.boxColor
        ?.neutralComplementary
    ).toBeUndefined();
  });

  it('rejects Card-authored Rest and misplaced canonical catalogs', () => {
    const schema = createSchema();
    const card = schema.components.card!;
    card.elements.e1!.palettes!.default!.light!.onSubtle.standard.boxColor!.primary!.highest!.rest =
      '#000000';
    expect(() => validateSchemaComponentContracts(schema)).toThrow(
      /Card Rest must come from Container/
    );

    delete card.elements.e1!.palettes!.default!.light!.onSubtle.standard.boxColor!.primary!.highest!
      .rest;
    card.options = {
      border: card.options!.border,
      canonicalSurfaces: schema.components.container!.options!.canonicalSurfaces
    };
    expect(() => validateSchemaComponentContracts(schema)).toThrow(
      /authored catalog belongs to Container/
    );
  });
});
