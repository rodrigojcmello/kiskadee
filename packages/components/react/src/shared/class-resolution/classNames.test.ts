import type { ClassNameByElementJSON, EffectClassBucketJSON } from '@kiskadee/core';
import { describe, expect, it, vi } from 'vitest';
import {
  joinClassNames,
  mergeClassNamePatches,
  normalizeScaleKey,
  resolveEffectBucketClassName,
  resolveIntentClassName,
  resolveRadiusClassName,
  resolveScaleClassName,
  resolveSchemaElementClassName,
  resolveTypographyClassName
} from './classNames.ts';

const element: ClassNameByElementJSON = {
  d: 'base',
  c: {
    s: {
      primary: {
        hh: 'primary-highest',
        h: 'primary-high',
        m: 'primary-medium',
        l: 'primary-low',
        ll: 'primary-lowest'
      },
      neutral: {
        h: 'neutral-high',
        m: 'neutral-medium'
      }
    },
    v: {
      primary: {
        h: 'on-vivid-primary-high',
        m: 'on-vivid-primary-medium'
      }
    }
  },
  s: {
    all: 'scale-all',
    'md:1': 'scale-medium'
  },
  t: {
    bm: 'font-body weight-normal size-medium line-medium'
  },
  rr: {
    all: 'radius-rounded-all',
    'md:1': 'radius-rounded-medium'
  },
  rp: {
    all: 'radius-pill-all',
    'md:1': 'radius-pill-medium'
  },
  rs: {
    all: 'radius-square-all',
    'md:1': 'radius-square-medium'
  }
};

describe('class name resolution helpers', () => {
  it('joins non-empty class name fragments', () => {
    expect(joinClassNames('base', undefined, false, null, '', 'active')).toBe('base active');
    expect(joinClassNames(undefined, false, null, '')).toBeUndefined();
  });

  it('normalizes schema scale keys', () => {
    expect(normalizeScaleKey('s:md:1')).toBe('md:1');
    expect(normalizeScaleKey('md:1')).toBe('md:1');
  });

  it('resolves intent classes by emphasis bucket', () => {
    expect(resolveIntentClassName(element, 'primary', 'medium')).toBe('primary-medium');
    expect(resolveIntentClassName(element, 'primary', 'highest')).toBe('primary-highest');
  });

  it('keeps onSubtle and onVivid color buckets isolated', () => {
    expect(resolveIntentClassName(element, 'primary', 'high')).toBe('primary-high');
    expect(resolveIntentClassName(element, 'primary', 'high', { surfaceContext: 'onVivid' })).toBe(
      'on-vivid-primary-high'
    );
  });

  it('does not fall back to onSubtle colors when onVivid is missing', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const defaultOnlyElement: ClassNameByElementJSON = {
      c: {
        s: {
          primary: { h: 'primary-high' }
        }
      }
    };

    expect(
      resolveIntentClassName(defaultOnlyElement, 'primary', 'high', {
        surfaceContext: 'onVivid'
      })
    ).toBe('');
    expect(warn).toHaveBeenCalledOnce();
    warn.mockRestore();
  });

  it('resolves intent fallbacks explicitly', () => {
    expect(
      resolveIntentClassName(element, 'missing', 'medium', {
        fallbackIntent: 'neutral'
      })
    ).toBe('neutral-medium');

    expect(
      resolveIntentClassName(element, 'missing', 'high', {
        useFirstIntentFallback: true
      })
    ).toBe('primary-high');

    expect(resolveIntentClassName(element, undefined, 'medium')).toBe('');
  });

  it('uses fallback bucket order when an emphasis bucket is missing', () => {
    const sparseElement: ClassNameByElementJSON = {
      c: {
        s: {
          primary: {
            h: 'primary-high'
          }
        }
      }
    };

    expect(
      resolveIntentClassName(sparseElement, 'primary', 'medium', {
        emphasisFallbackOrder: ['h']
      })
    ).toBe('primary-high');
  });

  it('uses the default color bucket order when emphasis is not provided', () => {
    const lowOnlyElement: ClassNameByElementJSON = {
      c: {
        s: {
          primary: {
            l: 'primary-low'
          }
        }
      }
    };

    expect(resolveIntentClassName(lowOnlyElement, 'primary', undefined)).toBe('primary-low');
  });

  it('resolves scale and schema element classes', () => {
    expect(resolveScaleClassName(element, 's:md:1')).toBe('scale-all scale-medium');
    expect(
      resolveSchemaElementClassName(element, {
        scale: 's:md:1',
        intent: 'primary',
        emphasis: 'medium'
      })
    ).toBe('base primary-medium scale-all scale-medium');

    expect(
      resolveSchemaElementClassName(element, {
        intent: 'primary',
        emphasis: 'medium',
        surfaceContext: 'onVivid'
      })
    ).toBe('base on-vivid-primary-medium');
  });

  it('resolves typography profiles through their compact bucket', () => {
    expect(resolveTypographyClassName(element, 'body-medium')).toBe(
      'font-body weight-normal size-medium line-medium'
    );
    expect(resolveTypographyClassName(element, 'missing-profile')).toBe('');
  });

  it('resolves radius classes by radius mode and scale', () => {
    expect(resolveRadiusClassName(element, 's:md:1', 'rounded')).toBe(
      'radius-rounded-all radius-rounded-medium'
    );
    expect(resolveRadiusClassName(element, 's:md:1', 'pill')).toBe(
      'radius-pill-all radius-pill-medium'
    );
    expect(resolveRadiusClassName(element, 's:md:1', 'square')).toBe(
      'radius-square-all radius-square-medium'
    );
  });

  it('resolves effect buckets with all and scale classes', () => {
    const bucket: EffectClassBucketJSON = {
      all: 'effect-all',
      'md:1': 'effect-medium'
    };

    expect(resolveEffectBucketClassName('effect-string')).toBe('effect-string');
    expect(resolveEffectBucketClassName(bucket)).toBe('effect-all');
    expect(resolveEffectBucketClassName(bucket, { scale: 's:md:1' })).toBe(
      'effect-all effect-medium'
    );
    expect(resolveEffectBucketClassName(bucket, { scale: 's:md:1', includeAll: false })).toBe(
      'effect-medium'
    );
    expect(resolveEffectBucketClassName(undefined)).toBe('');
  });

  it('merges class name patches across declared slots only', () => {
    expect(
      mergeClassNamePatches(
        ['e1', 'e2', 'e3'],
        { e1: 'base-root' },
        { e1: 'feature-root', e2: 'feature-label' },
        null,
        undefined,
        { e1: 'effect-root', e3: 'effect-icon' }
      )
    ).toEqual({
      e1: 'base-root feature-root effect-root',
      e2: 'feature-label',
      e3: 'effect-icon'
    });
  });
});
