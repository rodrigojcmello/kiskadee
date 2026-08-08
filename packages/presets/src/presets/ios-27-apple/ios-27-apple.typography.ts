import type { SchemaTypography, TypographyProfile } from '@kiskadee/core';

const bodyRegular = (textSize: number, textHeight: number) =>
  ({
    decorations: { textFont: 'body', textWeight: 'normal' },
    scales: { textSize, textHeight }
  }) as const satisfies TypographyProfile;

const bodyMedium = (textSize: number, textHeight: number) =>
  ({
    decorations: { textFont: 'body', textWeight: 'medium' },
    scales: { textSize, textHeight }
  }) as const satisfies TypographyProfile;

export const ios27AppleTypography = {
  profiles: {
    subheadline: bodyRegular(15, 20),
    body: bodyRegular(17, 22),
    'label-small': bodyMedium(13, 16),
    'label-medium': bodyMedium(17, 22),
    'tooltip-small': bodyMedium(11, 14),
    'tooltip-medium': bodyMedium(14, 18),
    'label-small-regular': bodyRegular(13, 16),
    'caption-strong': bodyMedium(12, 16),
    'caption-strong-relaxed': bodyMedium(12, 22)
  }
} as const satisfies SchemaTypography;
