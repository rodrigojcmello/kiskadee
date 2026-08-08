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
    'title-medium': body('medium', 16, 24),
    'headline-small-strong': body('medium', 24, 32),
    'headline-large-strong': body('medium', 32, 40),
    'tabs-label-small': body('medium', 13, 20),
    'tabs-label-medium': body('medium', 14, 24),
    'tabs-bridge-label-small-stronger': body('extraBold', 16, 20),
    'tabs-bridge-label-medium-stronger': body('extraBold', 18, 24),
    'supporting-small-compact': body('normal', 11, 16),
    'floating-label': body('normal', 12, 14)
  }
} as const satisfies SchemaTypography;
