import type { Schema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { buildCardComponentArtifact } from './cardComponentArtifact.ts';

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
                  contentSurfaceContext: 'default'
                },
                {
                  intent: 'primary',
                  emphasis: 'highest',
                  contentSurfaceContext: 'inverse'
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
                  default: {
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
                contentSurfaceContext: 'default',
                rest: '#ffffff'
              },
              {
                intent: 'primary',
                emphasis: 'highest',
                contentSurfaceContext: 'inverse',
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
    const palette = schema.components.card?.elements.e1?.palettes?.default?.light?.default.boxColor;
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
});
