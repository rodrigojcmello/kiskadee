import { describe, expect, it } from 'vitest';
import type { ElementPaletteSource } from './resolveElementPaletteSources.ts';
import { resolveElementPaletteSources } from './resolveElementPaletteSources.ts';

const foregroundStates = {
  medium: { rest: '#333333' },
  low: { rest: '#555555' },
  lowest: { rest: '#777777' }
} as const;

describe('resolveElementPaletteSources', () => {
  it('merges separator, foreground, and authored colors into one effective palette', () => {
    const element = {
      separator: { 's:all': 'subtle' },
      foreground: { neutral: 'neutral' },
      palettes: {
        default: {
          light: {
            onSubtle: {
              borderColor: {
                neutral: { medium: { rest: '#999999' } }
              }
            }
          }
        }
      }
    } as const satisfies ElementPaletteSource;

    const resolved = resolveElementPaletteSources(element, {
      foregrounds: {
        profiles: {
          neutral: {
            palettes: {
              default: {
                light: { onSubtle: foregroundStates }
              }
            }
          }
        }
      },
      separators: {
        profiles: {
          subtle: {
            scales: { boxWidth: 1 },
            palettes: {
              default: {
                light: {
                  onSubtle: {
                    boxColor: {
                      neutral: { medium: { rest: '#dddddd' } }
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    expect(resolved.separatorRecipe?.scales.boxWidth).toEqual({ 's:all': 1 });
    expect(resolved.palettes).toEqual({
      default: {
        light: {
          onSubtle: {
            boxColor: {
              neutral: { medium: { rest: '#dddddd' } }
            },
            textColor: {
              neutral: foregroundStates
            },
            borderColor: {
              neutral: { medium: { rest: '#999999' } }
            }
          }
        }
      }
    });
  });
});
