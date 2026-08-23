import type { SchemaTypography, TextWeightValue, TypographyProfile } from '@kiskadee/core';

const profile = (
  textFont: 'body' | 'heading',
  textWeight: TextWeightValue,
  textSize: number,
  textHeight: number
) =>
  ({
    decorations: { textFont, textWeight },
    scales: { textSize, textHeight }
  }) as const satisfies TypographyProfile;

export const fluent2MicrosoftTypography = {
  profiles: {
    'caption-small': profile('body', 'normal', 10, 14),
    'caption-small-strong': profile('body', 'semiBold', 10, 14),
    'caption-medium': profile('body', 'normal', 12, 16),
    'caption-medium-strong': profile('body', 'semiBold', 12, 16),
    'body-medium': profile('body', 'normal', 14, 20),
    'body-medium-strong': profile('body', 'semiBold', 14, 20),
    'body-large': profile('body', 'normal', 16, 22),
    'subtitle-small': profile('heading', 'semiBold', 16, 22),
    'subtitle-large': profile('heading', 'semiBold', 20, 26),
    'heading-small': profile('heading', 'semiBold', 24, 32),
    'heading-medium': profile('heading', 'semiBold', 28, 36),
    'heading-large': profile('heading', 'semiBold', 32, 40),
    'display-small': profile('heading', 'semiBold', 40, 52),
    'display-large': profile('heading', 'semiBold', 68, 92),
    'label-large': profile('body', 'semiBold', 16, 22)
  }
} as const satisfies SchemaTypography;
