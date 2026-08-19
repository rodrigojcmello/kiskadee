import type { ClassNameByElementJSON } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { resolveStructuralUtilityProjectionClassName } from './structuralUtilityProjection.ts';

const element: ClassNameByElementJSON = {
  p: {
    connected: {
      all: 'projection-all',
      'md:1': 'projection-medium'
    },
    disclosure: {
      'lg:1': 'projection-disclosure-large'
    }
  }
};

describe('resolveStructuralUtilityProjectionClassName', () => {
  it('joins the all and scale-specific classes for one projection key', () => {
    expect(resolveStructuralUtilityProjectionClassName(element, 'connected', 's:md:1')).toBe(
      'projection-all projection-medium'
    );
  });

  it('accepts an already normalized scale key', () => {
    expect(resolveStructuralUtilityProjectionClassName(element, 'disclosure', 'lg:1')).toBe(
      'projection-disclosure-large'
    );
  });

  it('returns only the all class when the requested scale is absent', () => {
    expect(resolveStructuralUtilityProjectionClassName(element, 'connected', 's:sm:1')).toBe(
      'projection-all'
    );
  });

  it('does not fall back to another projection key', () => {
    expect(resolveStructuralUtilityProjectionClassName(element, 'missing', 's:md:1')).toBe('');
    expect(resolveStructuralUtilityProjectionClassName(undefined, 'connected', 's:md:1')).toBe('');
  });
});
