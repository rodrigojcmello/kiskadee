import type { ElementIconSize, SchemaIconSizes } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { expandElementIconSize } from './compileIconSizes.ts';

const iconSizes = {
  's:sm:1': 16,
  's:md:1': 20,
  's:lg:1': 24
} as const satisfies SchemaIconSizes;

describe('expandElementIconSize', () => {
  it('expands identity and responsive references into equal width and height maps', () => {
    const iconSize = {
      's:sm:1': 's:sm:1',
      's:md:1': {
        'bp:all': 's:lg:1',
        'bp:lg:1': 's:md:1'
      }
    } as const satisfies ElementIconSize;

    expect(expandElementIconSize(iconSize, iconSizes)).toEqual({
      boxWidth: {
        's:sm:1': 16,
        's:md:1': {
          'bp:all': 24,
          'bp:lg:1': 20
        }
      },
      boxHeight: {
        's:sm:1': 16,
        's:md:1': {
          'bp:all': 24,
          'bp:lg:1': 20
        }
      }
    });
  });

  it('fails visibly when a referenced preset size is absent', () => {
    expect(() => expandElementIconSize({ 's:md:1': 's:lg:2' }, iconSizes)).toThrow(
      'Icon size "s:lg:2" is not defined'
    );
  });
});
