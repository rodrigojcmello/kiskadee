import type { Schema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { buildCardComponentArtifact } from './cardComponentArtifact.ts';
import { buildContainerComponentArtifact } from './containerComponentArtifact.ts';

function createSchema(): Schema {
  return {
    name: 'Card artifact test',
    version: [1, 0, 0],
    author: 'Kiskadee',
    breakpoints: { 'bp:all': 0 },
    components: {
      card: {
        options: {
          canonicalSurfaces: {
            default: {
              light: [
                {
                  intent: 'neutral',
                  emphasis: 'low',
                  contentSurfaceContext: 'onSubtle'
                },
                {
                  intent: 'primary',
                  emphasis: 'highest',
                  contentSurfaceContext: 'onVivid'
                }
              ]
            }
          }
        },
        elements: {
          e1: {
            name: 'card',
            palettes: {
              default: {
                light: {
                  onSubtle: {
                    boxColor: {
                      neutral: {
                        low: { rest: '#ffffff' }
                      },
                      primary: {
                        highest: { rest: '#0064b4' }
                      }
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

describe('buildCardComponentArtifact', () => {
  it('preserves authored order and resolves Rest colors from the Card palette', () => {
    expect(buildCardComponentArtifact(createSchema())).toEqual({
      component: 'card',
      options: {
        canonicalSurfaces: {
          default: {
            light: [
              {
                intent: 'neutral',
                emphasis: 'low',
                contentSurfaceContext: 'onSubtle',
                rest: '#ffffff'
              },
              {
                intent: 'primary',
                emphasis: 'highest',
                contentSurfaceContext: 'onVivid',
                rest: '#0064b4'
              }
            ]
          }
        }
      }
    });
  });

  it('fails explicitly when a canonical surface cannot resolve a solid Rest color', () => {
    const schema = createSchema();
    const palette =
      schema.components.card?.elements.e1?.palettes?.default?.light?.onSubtle.boxColor;
    if (!palette?.primary) throw new Error('Test Card palette is missing');
    palette.primary.highest = { rest: { kind: 'linear', angle: 0, stops: [] } };

    expect(() => buildCardComponentArtifact(schema)).toThrow(
      'Card canonical surface "default.light.primary.highest" must resolve to a solid Rest color.'
    );
  });

  it('omits the artifact when the Card does not declare canonical surfaces', () => {
    const schema = createSchema();
    if (!schema.components.card) throw new Error('Test Card schema is missing');
    delete schema.components.card.options;

    expect(buildCardComponentArtifact(schema)).toBeNull();
  });

  it('publishes Container-owned canonical surfaces in both component artifacts', () => {
    const schema = createSchema();
    const card = schema.components.card!;
    const catalog = card.options!.canonicalSurfaces!;
    card.surfaceSource = 'container';
    card.options = {};
    const colors = card.elements.e1!.palettes!.default!.light!.onSubtle.boxColor!;
    colors.neutral!.low = {};
    colors.primary!.highest = {};
    schema.components.container = {
      options: { canonicalSurfaces: catalog },
      contentSurfaceContext: {
        default: {
          light: {
            onSubtle: {
              neutral: { low: { rest: 'onSubtle' } },
              primary: { highest: { rest: 'onVivid' } }
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
                    neutral: { low: { rest: '#ffffff' } },
                    primary: { highest: { rest: '#0064b4' } }
                  }
                }
              }
            }
          }
        }
      }
    };

    const cardArtifact = buildCardComponentArtifact(schema);
    const containerArtifact = buildContainerComponentArtifact(schema);
    expect(cardArtifact?.options.canonicalSurfaces.default?.light?.map(({ rest }) => rest)).toEqual(
      ['#ffffff', '#0064b4']
    );
    expect(containerArtifact?.options.canonicalSurfaces).toEqual(
      cardArtifact?.options.canonicalSurfaces
    );
  });
});
