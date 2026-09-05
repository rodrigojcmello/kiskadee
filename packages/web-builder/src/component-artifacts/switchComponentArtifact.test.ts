import type { Schema } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { buildSwitchComponentArtifact } from './switchComponentArtifact.ts';

function createSchema(): Schema {
  return {
    name: 'Switch artifact test',
    version: [1, 0, 0],
    author: 'Kiskadee',
    breakpoints: { 'bp:all': 0 },
    components: {
      switch: {
        effects: {
          activationFeedback: {
            profile: 'halo',
            visual: {
              tone: {
                default: 'subtle',
                bySurfaceContext: {
                  onSubtle: 'subtle',
                  onVivid: 'vivid'
                }
              }
            }
          }
        },
        options: {
          variant: 'standard',
          activationMotion: 'slow'
        },
        variants: {
          standard: {
            options: {
              mode: 'base'
            },
            modes: {
              base: {
                elements: {
                  e1: { name: 'switch' }
                }
              }
            }
          }
        }
      }
    }
  };
}

describe('buildSwitchComponentArtifact', () => {
  it('preserves Surface Context activation-feedback projections as static metadata', () => {
    expect(buildSwitchComponentArtifact(createSchema())).toMatchObject({
      component: 'switch',
      options: {
        variant: 'standard',
        activationMotion: 'slow'
      },
      effects: {
        activationFeedback: {
          profile: 'halo',
          visual: {
            tone: {
              default: 'subtle',
              bySurfaceContext: {
                onSubtle: 'subtle',
                onVivid: 'vivid'
              }
            }
          }
        }
      },
      variants: {
        standard: {
          options: {
            mode: 'base'
          }
        }
      }
    });
  });
});
