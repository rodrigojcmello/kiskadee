import { describe, expect, it } from 'vitest';
import {
  type DesignSystemSchemaArtifact,
  resolveDesignSystemCardSurfaceColor
} from './design-system-card-surface';

const schema = {
  components: {
    card: {
      elements: {
        e1: {
          palettes: {
            default: {
              light: {
                onSubtle: {
                  boxColor: {
                    neutral: {
                      low: {
                        rest: '#ffffff'
                      }
                    }
                  }
                },
                onVivid: {
                  boxColor: {
                    neutral: {
                      low: {
                        rest: {
                          ref: 'var(--k-card-on-vivid)'
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
    }
  }
} satisfies DesignSystemSchemaArtifact;

describe('design-system Card surface resolution', () => {
  it('reads onSubtle by default from the canonical surface-context layer', () => {
    expect(
      resolveDesignSystemCardSurfaceColor({
        schema,
        segment: 'default',
        theme: 'light',
        intent: 'neutral',
        emphasis: 'low'
      })
    ).toBe('#ffffff');
  });

  it('resolves an explicit surface context and color reference', () => {
    expect(
      resolveDesignSystemCardSurfaceColor({
        schema,
        segment: 'default',
        theme: 'light',
        surfaceContext: 'onVivid',
        intent: 'neutral',
        emphasis: 'low'
      })
    ).toBe('var(--k-card-on-vivid)');
  });

  it('does not fall back across missing contexts or palette coordinates', () => {
    expect(
      resolveDesignSystemCardSurfaceColor({
        schema,
        segment: 'default',
        theme: 'dark',
        intent: 'neutral',
        emphasis: 'low'
      })
    ).toBeUndefined();
  });
});
