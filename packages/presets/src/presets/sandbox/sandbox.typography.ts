import type { ElementTypography, SchemaTypography, TypographyProfile } from '@kiskadee/core';

const body = (textWeight: 'normal' | 'medium', textSize: number, textHeight: number) =>
  ({
    decorations: { textFont: 'body', textWeight },
    scales: { textSize, textHeight }
  }) as const satisfies TypographyProfile;

export const sandboxTypography = {
  profiles: {
    'body-extra-small': body('normal', 12, 16),
    'body-small': body('normal', 13, 18),
    'body-medium': body('normal', 14, 20),
    'body-large': body('normal', 16, 24),
    'body-extra-small-strong': body('medium', 12, 16),
    'body-small-strong': body('medium', 13, 18),
    'body-medium-strong': body('medium', 14, 20),
    'body-large-strong': body('medium', 16, 24)
  }
} as const satisfies SchemaTypography;

export const sandboxTypographyReferences = {
  body: {
    's:sm:3': 'body-extra-small',
    's:sm:2': 'body-extra-small',
    's:sm:1': 'body-small',
    's:md:1': 'body-medium',
    's:lg:1': 'body-large'
  },
  bodyStrong: {
    's:sm:3': 'body-extra-small-strong',
    's:sm:2': 'body-extra-small-strong',
    's:sm:1': 'body-small-strong',
    's:md:1': 'body-medium-strong',
    's:lg:1': 'body-large-strong'
  },
  optionalIndicator: {
    's:sm:3': 'body-extra-small-strong',
    's:sm:2': 'body-extra-small-strong',
    's:sm:1': 'body-extra-small-strong',
    's:md:1': 'body-extra-small-strong',
    's:lg:1': 'body-extra-small-strong'
  }
} as const satisfies Record<string, ElementTypography>;
