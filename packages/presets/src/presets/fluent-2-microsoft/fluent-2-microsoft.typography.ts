import type { SchemaTypography, TypographyProfile } from '@kiskadee/core';

const bodyRegular = (textSize: number, textHeight: number) =>
  ({
    decorations: { textFont: 'body', textWeight: 'normal' },
    scales: { textSize, textHeight }
  }) as const satisfies TypographyProfile;

export const fluent2MicrosoftTypography = {
  profiles: {
    'caption-1': bodyRegular(12, 16),
    'caption-1-relaxed': bodyRegular(12, 20),
    'body-1': bodyRegular(14, 20),
    'body-1-strong': {
      decorations: { textFont: 'body', textWeight: 'semiBold' },
      scales: { textSize: 14, textHeight: 20 }
    },
    'subtitle-2': {
      decorations: { textFont: 'body', textWeight: 'semiBold' },
      scales: { textSize: 16, textHeight: 22 }
    }
  }
} as const satisfies SchemaTypography;
