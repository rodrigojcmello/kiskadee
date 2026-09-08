import type { SchemaTypography, TextWeightValue, TypographyProfile } from '@kiskadee/core';

const profile = (
  textSize: number,
  textHeight: number,
  textWeight: TextWeightValue = 'normal',
  textLetterSpacing?: number
) =>
  ({
    decorations: { textFont: 'body', textWeight },
    scales: {
      textSize,
      textHeight,
      ...(textLetterSpacing === undefined ? {} : { textLetterSpacing })
    }
  }) as const satisfies TypographyProfile;

// Apple default Dynamic Type metrics; normalized names preserve cross-preset consumers.
export const ios27AppleTypography = {
  profiles: {
    'caption-small': profile(11, 13, 'normal', 0.06),
    'caption-small-strong': profile(11, 13, 'semiBold', 0.06),
    'caption-medium': profile(12, 16),
    'caption-medium-strong': profile(12, 16, 'semiBold'),
    'body-small': profile(15, 20, 'normal', -0.23),
    'body-small-strong': profile(15, 20, 'semiBold', -0.23),
    'subtitle-small': profile(16, 21, 'normal', -0.31),
    'body-medium': profile(17, 22, 'normal', -0.43),
    'body-large': profile(20, 25, 'normal', -0.45),
    'label-small': profile(13, 18, 'normal', -0.08),
    'label-small-strong': profile(13, 18, 'semiBold', -0.08),
    'label-medium': profile(17, 22, 'semiBold', -0.43),
    'label-large': profile(20, 25, 'semiBold', -0.45),
    'heading-small': profile(22, 28, 'semiBold', -0.26),
    'heading-medium': profile(28, 34, 'semiBold', 0.38),
    'heading-large': profile(34, 41, 'bold', 0.4),
    'tooltip-small': profile(11, 13, 'medium', 0.06),
    'tooltip-medium': profile(13, 18, 'medium', -0.08)
  }
} as const satisfies SchemaTypography;
