import type { SchemaTypography, TextWeightValue, TypographyProfile } from '@kiskadee/core';

const body = (textWeight: TextWeightValue, textSize: number, textHeight: number) =>
  ({
    decorations: { textFont: 'body', textWeight },
    scales: { textSize, textHeight }
  }) as const satisfies TypographyProfile;

export const material3GoogleTypography = {
  profiles: {
    'label-medium': body('medium', 12, 16),
    'label-large': body('medium', 14, 20),
    'body-small': body('normal', 12, 16),
    'body-medium': body('normal', 14, 20),
    'body-large': body('normal', 16, 24),
    'label-extra-large': body('medium', 16, 24),
    'label-display-small': body('medium', 24, 32),
    'label-display-large': body('medium', 32, 40)
  }
} as const satisfies SchemaTypography;
