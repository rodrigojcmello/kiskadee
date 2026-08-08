import { breakpoints, type ElementTypography, type SchemaTypography } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { buildTypographyArtifact, createTypographyBuild } from './compileTypography.ts';

const typography = {
  profiles: {
    'body-compact': {
      decorations: { textFont: 'body', textWeight: 'normal' },
      scales: { textSize: 12, textHeight: 16, textLetterSpacing: 0.12 }
    },
    'body-regular': {
      decorations: { textFont: 'body', textWeight: 'semiBold' },
      scales: { textSize: 14, textHeight: 20 }
    },
    'body-wide': {
      decorations: { textFont: 'body', textWeight: 'semiBold' },
      scales: { textSize: 16, textHeight: 24, textLetterSpacing: 0.16 }
    }
  }
} as const satisfies SchemaTypography;

describe('createTypographyBuild', () => {
  it('publishes atomic keys for every declared profile, including unused profiles', () => {
    const build = createTypographyBuild(typography, breakpoints);

    expect(build?.profileStyleKeys).toEqual({
      'body-compact': [
        'textFont__body',
        'textWeight__normal',
        'textSize__12',
        'textLineHeight__1.333333',
        'textLetterSpacing__0.01'
      ],
      'body-regular': [
        'textFont__body',
        'textWeight__semiBold',
        'textSize__14',
        'textLineHeight__1.428571'
      ],
      'body-wide': [
        'textFont__body',
        'textWeight__semiBold',
        'textSize__16',
        'textLineHeight__1.5',
        'textLetterSpacing__0.01'
      ]
    });
    expect(build?.usage['body-wide']).toEqual([]);
  });

  it('hoists invariant font while keeping scale-varying weight and all metrics in scales', () => {
    const build = createTypographyBuild(typography, breakpoints);
    const elementTypography = {
      's:sm:1': 'body-compact',
      's:md:1': 'body-regular'
    } as const satisfies ElementTypography;

    const expanded = build?.expandElement(elementTypography, {
      component: 'button',
      element: 'e2',
      elementName: 'button-text'
    });

    expect(expanded?.decorations).toEqual(['textFont__body']);
    expect(expanded?.scales['s:sm:1']).toEqual([
      'textWeight__normal',
      'textSize__12',
      'textLineHeight__1.333333',
      'textLetterSpacing__0.01'
    ]);
    expect(expanded?.scales['s:md:1']).toEqual([
      'textWeight__semiBold',
      'textSize__14',
      'textLineHeight__1.428571'
    ]);
  });

  it('emits a responsive normal reset only when tracking transitions to omitted', () => {
    const build = createTypographyBuild(typography, breakpoints);
    const expanded = build?.expandElement(
      {
        's:all': {
          'bp:all': 'body-wide',
          'bp:lg:1': 'body-regular'
        }
      },
      {
        component: 'card',
        variant: 'standard',
        mode: 'compact',
        element: 'e2',
        elementName: 'card-label'
      }
    );

    expect(expanded?.decorations).toEqual(['textFont__body', 'textWeight__semiBold']);
    expect(expanded?.scales['s:all']).toEqual([
      'textSize__16',
      'textLineHeight__1.5',
      'textLetterSpacing__0.01',
      'textSize++s:all::bp:lg:1__14',
      'textLineHeight++s:all::bp:lg:1__1.428571',
      'textLetterSpacing++s:all::bp:lg:1__normal'
    ]);
    expect(build?.usage['body-wide']).toEqual([
      {
        component: 'card',
        variant: 'standard',
        mode: 'compact',
        element: 'e2',
        elementName: 'card-label',
        scale: 's:all'
      }
    ]);
    expect(build?.usage['body-regular']).toEqual([
      {
        component: 'card',
        variant: 'standard',
        mode: 'compact',
        element: 'e2',
        elementName: 'card-label',
        scale: 's:all',
        breakpoint: 'bp:lg:1'
      }
    ]);
  });

  it('orders tracking transitions by the schema min-width values', () => {
    const build = createTypographyBuild(typography, {
      'bp:all': 0,
      'bp:lg:1': 500,
      'bp:sm:1': 1000
    });
    const expanded = build?.expandElement(
      {
        's:all': {
          'bp:all': 'body-regular',
          'bp:sm:1': 'body-regular',
          'bp:lg:1': 'body-wide'
        }
      },
      {
        component: 'card',
        element: 'e2',
        elementName: 'card-label'
      }
    );

    expect(expanded?.scales['s:all']).toEqual([
      'textSize__14',
      'textLineHeight__1.428571',
      'textSize++s:all::bp:lg:1__16',
      'textLineHeight++s:all::bp:lg:1__1.5',
      'textLetterSpacing++s:all::bp:lg:1__0.01',
      'textSize++s:all::bp:sm:1__14',
      'textLineHeight++s:all::bp:sm:1__1.428571',
      'textLetterSpacing++s:all::bp:sm:1__normal'
    ]);
  });
});

describe('buildTypographyArtifact', () => {
  it('preserves profile order and exposes only space-separated atomic classes', () => {
    const build = createTypographyBuild(typography, breakpoints);
    if (!build) throw new Error('Expected typography build.');

    const shortenMap = Object.fromEntries(
      Array.from(new Set(build.additionalCoreStyleKeys)).map((key, index) => [key, `k-${index}`])
    );
    const artifact = buildTypographyArtifact(build, shortenMap);

    expect(Object.keys(artifact.profiles)).toEqual(['body-compact', 'body-regular', 'body-wide']);
    expect(artifact.profiles['body-compact']?.className).toBe('k-0 k-1 k-2 k-3 k-4');
    expect(artifact.usage).toEqual({
      'body-compact': [],
      'body-regular': [],
      'body-wide': []
    });
  });
});
