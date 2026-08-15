import type { ElementSeparator, SchemaSeparators } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { expandElementSeparator } from './compileSeparators.ts';

const sharedPalettes = {
  default: {
    light: {
      onSubtle: {
        boxColor: {
          neutral: {
            medium: { rest: '#dddddd' }
          }
        }
      }
    }
  }
} as const;

const separators = {
  profiles: {
    subtle: { scales: { boxWidth: 1 }, palettes: sharedPalettes },
    thick: { scales: { boxWidth: 2 }, palettes: sharedPalettes }
  }
} as const satisfies SchemaSeparators;

describe('expandElementSeparator', () => {
  it('expands scale and breakpoint references while preserving the shared palette', () => {
    const separator = {
      's:md:1': {
        'bp:all': 'thick',
        'bp:lg:1': 'subtle'
      }
    } as const satisfies ElementSeparator;

    expect(expandElementSeparator(separator, separators)).toEqual({
      scales: {
        boxWidth: {
          's:md:1': {
            'bp:all': 2,
            'bp:lg:1': 1
          }
        }
      },
      palettes: sharedPalettes
    });
  });

  it('rejects missing profiles and palette changes defensively', () => {
    expect(() => expandElementSeparator({ 's:all': 'missing' }, separators)).toThrow(
      'Separator profile "missing" is not defined'
    );

    expect(() =>
      expandElementSeparator(
        {
          's:md:1': 'subtle',
          's:lg:1': 'contrast'
        },
        {
          profiles: {
            ...separators.profiles,
            contrast: {
              scales: { boxWidth: 2 },
              palettes: {
                default: {
                  light: {
                    onSubtle: {
                      boxColor: { neutral: { medium: { rest: '#111111' } } }
                    }
                  }
                }
              }
            }
          }
        }
      )
    ).toThrow('does not preserve the palettes');
  });
});
