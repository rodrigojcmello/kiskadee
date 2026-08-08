import type { Breakpoints } from '@kiskadee/core';
import { describe, expect, it } from 'vitest';
import { transformTypographyMetricKeyToCss } from './transformTypographyMetricKeyToCss.ts';

const testBreakpoints: Breakpoints = {
  'bp:all': 0,
  'bp:lg:1': 1200
};

describe('transformTypographyMetricKeyToCss', () => {
  it('emits a normalized unitless line-height', () => {
    expect(
      transformTypographyMetricKeyToCss(
        'textLineHeight__1.333333333',
        'line-height',
        testBreakpoints
      )
    ).toBe('.line-height { line-height: 1.333333 }');
  });

  it.each([
    ['textLetterSpacing__-0.01234567', '-0.012346em'],
    ['textLetterSpacing__0', '0em'],
    ['textLetterSpacing__0.025', '0.025em']
  ])('emits letter spacing in em for %s', (styleKey, expected) => {
    expect(transformTypographyMetricKeyToCss(styleKey, 'tracking', testBreakpoints)).toBe(
      `.tracking { letter-spacing: ${expected} }`
    );
  });

  it('emits a responsive normal reset with the active schema breakpoint', () => {
    expect(
      transformTypographyMetricKeyToCss(
        'textLetterSpacing++s:all::bp:lg:1__normal',
        'tracking-reset',
        testBreakpoints
      )
    ).toBe('@media (min-width: 1200px) { .tracking-reset { letter-spacing: normal } }');
  });
});
