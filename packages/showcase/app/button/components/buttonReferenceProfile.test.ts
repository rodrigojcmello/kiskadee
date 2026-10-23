import type { TypographyArtifact, TypographyArtifactProfile } from '@kiskadee/web-builder/types';
import { describe, expect, it } from 'vitest';
import { resolveButtonReferenceProfile } from './buttonReferenceProfile';

function profile(
  size: number,
  decorations: TypographyArtifactProfile['decorations'] = {
    textFont: 'body',
    textWeight: 'normal'
  }
): TypographyArtifactProfile {
  return {
    decorations,
    scales: { textSize: size, textHeight: size + 4 },
    bucket: 'test',
    className: 'test-profile'
  };
}

function artifact(profiles: TypographyArtifact['profiles']): TypographyArtifact {
  return { profiles, usage: {} };
}

describe('Button reference typography profile', () => {
  it('keeps the caption when the artifact or current profile is unavailable', () => {
    expect(resolveButtonReferenceProfile(undefined, 'caption-medium')).toBe('caption-medium');
    expect(
      resolveButtonReferenceProfile(artifact({ 'caption-small': profile(10) }), 'caption-medium')
    ).toBe('caption-medium');
  });

  it('selects the nearest smaller published profile without changing font or weight', () => {
    const typography = artifact({
      'caption-medium': profile(12),
      'caption-tiny': profile(8),
      'heading-small': profile(11, { textFont: 'heading', textWeight: 'normal' }),
      'caption-small-strong': profile(11, { textFont: 'body', textWeight: 'semiBold' }),
      'caption-small': profile(10)
    });

    expect(resolveButtonReferenceProfile(typography, 'caption-medium')).toBe('caption-small');
  });

  it('keeps the caption when no compatible smaller profile is published', () => {
    const typography = artifact({
      'body-small': profile(12),
      'label-small': profile(12, { textFont: 'body', textWeight: 'medium' }),
      'body-medium': profile(14),
      'caption-small-strong': profile(10, { textFont: 'body', textWeight: 'semiBold' })
    });

    expect(resolveButtonReferenceProfile(typography, 'body-small')).toBe('body-small');
  });

  it('ignores nonpositive and nonfinite candidate sizes', () => {
    const typography = artifact({
      caption: profile(12),
      zero: profile(0),
      negative: profile(-1),
      infinite: profile(Number.POSITIVE_INFINITY),
      invalid: profile(Number.NaN)
    });

    expect(resolveButtonReferenceProfile(typography, 'caption')).toBe('caption');
  });

  it.each([
    0,
    -1,
    Number.NaN,
    Number.POSITIVE_INFINITY
  ])('keeps an invalid current size (%s) without selecting a substitute', (size) => {
    expect(
      resolveButtonReferenceProfile(
        artifact({ caption: profile(size), smaller: profile(10) }),
        'caption'
      )
    ).toBe('caption');
  });

  it('resolves equal-size candidates deterministically regardless of publication order', () => {
    const profiles = {
      caption: profile(12),
      'z-caption-small': profile(10),
      'a-caption-small': profile(10)
    };
    const reversed = Object.fromEntries(Object.entries(profiles).reverse());

    expect(resolveButtonReferenceProfile(artifact(profiles), 'caption')).toBe('a-caption-small');
    expect(resolveButtonReferenceProfile(artifact(reversed), 'caption')).toBe('a-caption-small');
  });
});
