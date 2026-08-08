import type { ElementTypography, SchemaTypography, TypographyProfile } from '@kiskadee/core';

const body = (textWeight: 'normal' | 'medium', textSize: number, textHeight: number) =>
  ({
    decorations: { textFont: 'body', textWeight },
    scales: { textSize, textHeight }
  }) as const satisfies TypographyProfile;

export const sandboxTypography = {
  profiles: {
    'body-small': body('normal', 12, 16),
    'body-regular': body('normal', 13, 18),
    'body-medium': body('normal', 14, 20),
    'body-large': body('normal', 16, 24),
    'body-small-strong': body('medium', 12, 16),
    'body-regular-strong': body('medium', 13, 18),
    'body-medium-strong': body('medium', 14, 20),
    'body-large-strong': body('medium', 16, 24),
    'caption-small-strong': body('medium', 12, 16),
    'caption-regular-strong': body('medium', 12, 18),
    'caption-medium-strong': body('medium', 12, 20),
    'caption-large-strong': body('medium', 12, 24)
  }
} as const satisfies SchemaTypography;

export const sandboxTypographyReferences = {
  body: {
    's:sm:3': 'body-small',
    's:sm:2': 'body-small',
    's:sm:1': 'body-regular',
    's:md:1': 'body-medium',
    's:lg:1': 'body-large'
  },
  bodyStrong: {
    's:sm:3': 'body-small-strong',
    's:sm:2': 'body-small-strong',
    's:sm:1': 'body-regular-strong',
    's:md:1': 'body-medium-strong',
    's:lg:1': 'body-large-strong'
  },
  caption: {
    's:sm:3': 'caption-small-strong',
    's:sm:2': 'caption-small-strong',
    's:sm:1': 'caption-regular-strong',
    's:md:1': 'caption-medium-strong',
    's:lg:1': 'caption-large-strong'
  }
} as const satisfies Record<string, ElementTypography>;
