import type { SchemaTypography } from '@kiskadee/core';

export const carbonIbmTypography = {
  profiles: {
    'body-medium-strong': {
      decorations: { textFont: 'body', textWeight: 'medium' },
      scales: { textSize: 14, textHeight: 18 }
    },
    'label-small': {
      decorations: { textFont: 'body', textWeight: 'normal' },
      scales: { textSize: 12, textHeight: 16 }
    },
    'body-medium': {
      decorations: { textFont: 'body', textWeight: 'normal' },
      scales: { textSize: 14, textHeight: 18 }
    }
  }
} as const satisfies SchemaTypography;
