import type {
  SchemaTypography,
  TextFontValue,
  TextWeightValue,
  TypographyProfile
} from '@kiskadee/core';

const profile = (
  textFont: TextFontValue,
  textWeight: TextWeightValue,
  textSize: number,
  textHeight: number,
  textLetterSpacing = 0
) =>
  ({
    decorations: { textFont, textWeight },
    scales: { textSize, textHeight, textLetterSpacing }
  }) as const satisfies TypographyProfile;

export const carbonIbmTypography = {
  profiles: {
    // Micro badge labels are Kiskadee extensions below Carbon's 12px utility floor.
    'caption-tiny-strong': profile('body', 'semiBold', 6, 6),
    'caption-extra-small-strong': profile('body', 'semiBold', 8, 8),
    'caption-small': profile('body', 'normal', 10, 14),
    'caption-small-strong': profile('body', 'semiBold', 10, 14),
    'label-small': profile('body', 'normal', 12, 16, 0.32),
    'caption-medium-strong': profile('body', 'semiBold', 12, 16, 0.32),
    'body-medium': profile('body', 'normal', 14, 18, 0.16),
    'body-medium-strong': profile('body', 'semiBold', 14, 18, 0.16),
    'body-large': profile('body', 'normal', 16, 22),
    'subtitle-small': profile('heading', 'semiBold', 16, 22),
    'subtitle-large': profile('heading', 'semiBold', 16, 24),
    'heading-small': profile('heading', 'normal', 20, 28),
    'heading-medium': profile('heading', 'normal', 28, 36),
    'heading-large': profile('heading', 'normal', 32, 40),
    'display-small': profile('heading', 'light', 42, 50),
    'display-large': profile('heading', 'light', 54, 64)
  }
} as const satisfies SchemaTypography;
